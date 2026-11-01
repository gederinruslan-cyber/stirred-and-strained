// Accounts, sessions and one-use links (ADR 0005). Steps before a user id exists go through the
// migration's security definer functions; everything else runs inside withUser (ADR 0003).
import { sql } from "drizzle-orm";
import type { Db, Scoped } from "./scope.ts";

export type TokenPurpose = "confirm" | "reset";

/** The account for a (lower-case) email, or null. */
export async function findUser(
  db: Db,
  email: string,
): Promise<{ id: string; passwordHash: string } | null> {
  const { rows } = await db.execute<{ id: string; password_hash: string }>(
    sql`select id, password_hash from auth_find_user(${email})`,
  );
  return rows[0] ? { id: rows[0].id, passwordHash: rows[0].password_hash } : null;
}

/** The user of a live session, by the SHA-256 of its token, or null. */
export async function sessionUser(db: Db, tokenHash: Buffer): Promise<string | null> {
  const { rows } = await db.execute<{ user_id: string | null }>(
    sql`select auth_session_user(${tokenHash}) as user_id`,
  );
  return rows[0]?.user_id ?? null;
}

export async function issueToken(
  db: Db,
  tokenHash: Buffer,
  purpose: TokenPurpose,
  email: string,
  passwordHash: string | null,
): Promise<void> {
  await db.execute(
    sql`select auth_issue_token(${tokenHash}, ${purpose}, ${email}, ${passwordHash})`,
  );
}

/** Uses a live link once; null when unknown, used or expired. */
export async function takeToken(
  db: Db,
  tokenHash: Buffer,
  purpose: TokenPurpose,
): Promise<{ email: string; passwordHash: string | null } | null> {
  const { rows } = await db.execute<{ email: string; password_hash: string | null }>(
    sql`select email, password_hash from auth_take_token(${tokenHash}, ${purpose})`,
  );
  return rows[0] ? { email: rows[0].email, passwordHash: rows[0].password_hash } : null;
}

/** Creates the scoped user; false when the email already has an account. */
export async function createUser(
  { tx, userId }: Scoped,
  email: string,
  passwordHash: string,
): Promise<boolean> {
  const { rows } = await tx.execute(sql`
    insert into app_user (id, email, password_hash) values (${userId}, ${email}, ${passwordHash})
    on conflict (email) do nothing returning id`);
  return rows.length === 1;
}

export async function setPassword({ tx, userId }: Scoped, passwordHash: string): Promise<number> {
  const { rows } = await tx.execute(
    sql`update app_user set password_hash = ${passwordHash} where id = ${userId} returning id`,
  );
  return rows.length;
}

export async function userEmail({ tx, userId }: Scoped): Promise<string | null> {
  const { rows } = await tx.execute<{ email: string }>(
    sql`select email from app_user where id = ${userId}`,
  );
  return rows[0]?.email ?? null;
}

/** Starts a session and sweeps the user's expired ones. */
export async function createSession(
  { tx, userId }: Scoped,
  tokenHash: Buffer,
  expiresAt: Date,
): Promise<void> {
  await tx.execute(sql`delete from session where user_id = ${userId} and expires_at <= now()`);
  await tx.execute(sql`
    insert into session (token_hash, user_id, expires_at)
    values (${tokenHash}, ${userId}, ${expiresAt.toISOString()})`);
}

/** Ends one session (by token hash) or, with none given, all of the user's sessions. */
export async function endSessions({ tx, userId }: Scoped, tokenHash?: Buffer): Promise<number> {
  const { rows } = await tx.execute(
    tokenHash
      ? sql`delete from session where user_id = ${userId} and token_hash = ${tokenHash} returning 1`
      : sql`delete from session where user_id = ${userId} returning 1`,
  );
  return rows.length;
}
