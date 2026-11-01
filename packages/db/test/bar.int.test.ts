import { randomUUID } from "node:crypto";
import { sql } from "drizzle-orm";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import {
  addToBar,
  createDb,
  createPool,
  createUser,
  listBar,
  removeFromBar,
  withUser,
  type Scoped,
} from "../src/index.ts";
import { importSeed, readSeed } from "../src/seed/import.ts";
import { expectIsolated } from "../test-support/isolation.ts";
import { APP_URL, MIGRATION_URL } from "./env.ts";

const pool = createPool(APP_URL);
const db = createDb(pool);
const seed = readSeed(new URL("../../../data/seed", import.meta.url).pathname);
// Bar items name house ingredients; the import is idempotent.
beforeAll(() => importSeed(MIGRATION_URL, seed));
afterAll(() => pool.end());

const ensureUser = (s: Scoped) => createUser(s, `${s.userId}@example.test`, "scrypt$test");

describe("bar_item (M2-03)", () => {
  it("is isolated per user (ADR 0003)", () =>
    expectIsolated(db, {
      create: async (s) => (await ensureUser(s), await addToBar(s, ["gin"]), "gin"),
      // Read and update without a user filter: row-level security alone stops B.
      read: async ({ tx }, id) =>
        (await tx.execute(sql`select user_id from bar_item where ingredient_id = ${id}`)).rows[0] ??
        null,
      update: async ({ tx }, id) =>
        (
          await tx.execute(
            sql`update bar_item set added_at = now() where ingredient_id = ${id} returning 1`,
          )
        ).rows.length,
      remove: (s, id) => removeFromBar(s, id),
    }));

  it("adds without duplicates and removes once", async () => {
    await withUser(db, randomUUID(), async (s) => {
      await ensureUser(s);
      expect(await addToBar(s, ["gin", "campari"])).toBe(2);
      expect(await addToBar(s, ["gin", "sweet-vermouth"])).toBe(1);
      expect(await listBar(s)).toEqual(["campari", "gin", "sweet-vermouth"]);
      expect(await removeFromBar(s, "gin")).toBe(1);
      expect(await removeFromBar(s, "gin")).toBe(0);
      expect(await listBar(s)).toEqual(["campari", "sweet-vermouth"]);
    });
  });

  it("keeps a re-seed from deleting an ingredient someone keeps", async () => {
    await withUser(db, randomUUID(), async (s) => (await ensureUser(s), addToBar(s, ["allspice"])));
    const without = { ...seed, nodes: seed.nodes.filter((n) => n.id !== "allspice") };
    await expect(importSeed(MIGRATION_URL, without)).rejects.toThrow(/bar_item/);
  });

  it("shows nothing outside a scoped transaction", async () => {
    await expect(pool.query("select * from bar_item")).resolves.toMatchObject({ rowCount: 0 });
  });
});
