import { createHash, randomBytes } from "node:crypto";
import { sql } from "drizzle-orm";
import { afterAll, describe, expect, it } from "vitest";
import {
  createDb,
  createPool,
  createSession,
  createUser,
  sessionUser,
  withUser,
  type Scoped,
} from "../src/index.ts";
import { expectIsolated } from "../test-support/isolation.ts";
import { APP_URL } from "./env.ts";

const pool = createPool(APP_URL);
const db = createDb(pool);
afterAll(() => pool.end());

const hash = () => createHash("sha256").update(randomBytes(32)).digest();
const later = () => new Date(Date.now() + 3_600_000);
const ensureUser = (s: Scoped) => createUser(s, `${s.userId}@example.test`, "scrypt$test");

describe("auth tables are isolated per user (ADR 0003)", () => {
  it("app_user: B cannot read, change or delete A's account", () =>
    expectIsolated(db, {
      create: async (s) => (await ensureUser(s), s.userId),
      read: async ({ tx }, id) =>
        (await tx.execute(sql`select id, email from app_user where id = ${id}`)).rows[0] ?? null,
      update: async ({ tx }, id) =>
        (
          await tx.execute(
            sql`update app_user set password_hash = 'x' where id = ${id} returning 1`,
          )
        ).rows.length,
      remove: async ({ tx }, id) =>
        (await tx.execute(sql`delete from app_user where id = ${id} returning 1`)).rows.length,
    }));

  it("session: B cannot read, change or delete A's session", () =>
    expectIsolated(db, {
      create: async (s) => {
        await ensureUser(s);
        const h = hash();
        await createSession(s, h, later());
        return h.toString("hex");
      },
      read: async ({ tx }, id) =>
        (await tx.execute(sql`select user_id from session where token_hash = decode(${id}, 'hex')`))
          .rows[0] ?? null,
      update: async ({ tx }, id) =>
        (
          await tx.execute(
            sql`update session set expires_at = now() where token_hash = decode(${id}, 'hex') returning 1`,
          )
        ).rows.length,
      remove: async ({ tx }, id) =>
        (
          await tx.execute(
            sql`delete from session where token_hash = decode(${id}, 'hex') returning 1`,
          )
        ).rows.length,
    }));

  it("the api role reaches one-use links only through the auth functions", async () => {
    await expect(pool.query("select * from auth_token")).rejects.toThrow(/permission denied/);
    await expect(pool.query("select * from app_user")).resolves.toMatchObject({ rowCount: 0 });
    await expect(pool.query("select * from session")).resolves.toMatchObject({ rowCount: 0 });
  });

  it("finds a session's user only while it is live", async () => {
    const live = hash();
    const gone = hash();
    const id = crypto.randomUUID();
    await withUser(db, id, async (s) => {
      await ensureUser(s);
      await createSession(s, live, later());
      await createSession(s, gone, new Date(Date.now() - 1000));
    });
    expect(await sessionUser(db, live)).toBe(id);
    expect(await sessionUser(db, gone)).toBeNull();
  });
});
