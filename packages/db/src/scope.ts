import { sql } from "drizzle-orm";
import { drizzle, type NodePgDatabase } from "drizzle-orm/node-postgres";
import type { Pool } from "./pool.ts";

export type Db = NodePgDatabase;
export type Tx = Parameters<Parameters<Db["transaction"]>[0]>[0];
export type UserId = string & { readonly __brand: "UserId" };
/** A transaction scoped to one user: RLS sees `userId`, and repositories filter on it too. */
export type Scoped = { readonly tx: Tx; readonly userId: UserId };

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export function createDb(pool: Pool): Db {
  return drizzle({ client: pool });
}

/**
 * The only way to touch user-owned rows (ADR 0003): one transaction with `app.user_id` set for
 * that transaction alone. A malformed id is refused before any query.
 */
export async function withUser<T>(
  db: Db,
  userId: string,
  work: (scoped: Scoped) => Promise<T>,
): Promise<T> {
  if (!UUID.test(userId)) throw new TypeError("withUser needs a user id (uuid)");
  return db.transaction(async (tx) => {
    await tx.execute(sql`select set_config('app.user_id', ${userId}, true)`);
    return work({ tx, userId: userId as UserId });
  });
}
