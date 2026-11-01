import { eq, sql } from "drizzle-orm";
import { pgTable, text, uuid } from "drizzle-orm/pg-core";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { createDb, createPool, withUser, type Scoped } from "../src/index.ts";
import { expectIsolated, type IsolatedResource } from "../test-support/isolation.ts";
import { APP_URL, MIGRATION_URL } from "./env.ts";

// A throwaway user-owned table with the standard policy (ADR 0003).
const notes = pgTable("isolation_probe", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").notNull(),
  body: text("body").notNull(),
});

const migrator = createPool(MIGRATION_URL);
const pool = createPool(APP_URL);
const db = createDb(pool);

beforeAll(async () => {
  await migrator.query(`
    begin;
    set local role stirred_owner;
    create table isolation_probe (id uuid primary key default gen_random_uuid(), user_id uuid not null, body text not null);
    alter table isolation_probe enable row level security;
    create policy isolation_probe_owner on isolation_probe
      using (user_id = app_user_id()) with check (user_id = app_user_id());
    commit;`);
});
afterAll(async () => {
  await migrator.query("begin; set local role stirred_owner; drop table isolation_probe; commit;");
  await Promise.all([migrator.end(), pool.end()]);
});

const careful: IsolatedResource = {
  create: async ({ tx, userId }) =>
    (await tx.insert(notes).values({ userId, body: "30 ml gin" }).returning())[0]!.id,
  read: async ({ tx, userId }, id) =>
    (
      await tx
        .select()
        .from(notes)
        .where(sql`${notes.id} = ${id} and ${notes.userId} = ${userId}`)
    )[0] ?? null,
  update: async ({ tx, userId }, id) =>
    (
      await tx
        .update(notes)
        .set({ body: "changed" })
        .where(sql`${notes.id} = ${id} and ${notes.userId} = ${userId}`)
        .returning()
    ).length,
  remove: async ({ tx, userId }, id) =>
    (
      await tx
        .delete(notes)
        .where(sql`${notes.id} = ${id} and ${notes.userId} = ${userId}`)
        .returning()
    ).length,
};

// Forgets its user filter on every read and write; row-level security must still hold.
const careless: IsolatedResource = {
  create: careful.create,
  read: async ({ tx }: Scoped, id) =>
    (await tx.select().from(notes).where(eq(notes.id, id)))[0] ?? null,
  update: async ({ tx }: Scoped, id) =>
    (await tx.update(notes).set({ body: "changed" }).where(eq(notes.id, id)).returning()).length,
  remove: async ({ tx }: Scoped, id) =>
    (await tx.delete(notes).where(eq(notes.id, id)).returning()).length,
};

describe("user isolation", () => {
  it("keeps user B away from user A's row through the repository", () =>
    expectIsolated(db, careful));
  it("keeps user B away even when the repository forgets its filter", () =>
    expectIsolated(db, careless));

  it("scopes only the transaction: unscoped queries afterwards see no user rows", async () => {
    await withUser(db, "00000000-0000-4000-8000-000000000001", (s) => careful.create(s));
    expect((await db.select().from(notes)).length).toBe(0);
  });

  it("refuses a malformed user id before any query", async () => {
    await expect(withUser(db, "1 or 1=1", async () => "ran")).rejects.toThrow(/user id/);
  });
});
