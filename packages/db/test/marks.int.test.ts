import { randomUUID } from "node:crypto";
import { sql } from "drizzle-orm";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import {
  createDb,
  createPool,
  createUser,
  createUserRecipe,
  deleteUserRecipe,
  getMark,
  listMarks,
  restoreUserRecipe,
  setMark,
  undoNote,
  withUser,
  type Scoped,
} from "../src/index.ts";
import { importSeed, readSeed } from "../src/seed/import.ts";
import { expectIsolated } from "../test-support/isolation.ts";
import { APP_URL, MIGRATION_URL } from "./env.ts";

const pool = createPool(APP_URL);
const db = createDb(pool);
const seed = readSeed(new URL("../../../data/seed", import.meta.url).pathname);
beforeAll(() => importSeed(MIGRATION_URL, seed));
afterAll(() => pool.end());

const ensureUser = (s: Scoped) => createUser(s, `${s.userId}@example.test`, "scrypt$test");
const ownNegroni = (s: Scoped) =>
  createUserRecipe(s, {
    name: "Ana's Negroni",
    method: "built",
    glass: null,
    steps: null,
    lines: [{ ingredient: "gin", value: 30, unit: "ml", entered: "ml", optional: false }],
  });

describe("recipe_mark (M2-07)", () => {
  it("is isolated per user (ADR 0003)", () =>
    expectIsolated(db, {
      create: async (s) => {
        await ensureUser(s);
        await setMark(s, { house: "negroni" }, { note: "less Campari" });
        return "negroni";
      },
      // No user filter: row-level security alone stops B.
      read: async ({ tx }, id) =>
        (await tx.execute(sql`select note from recipe_mark where house_recipe_id = ${id}`))
          .rows[0] ?? null,
      update: async ({ tx }, id) =>
        (
          await tx.execute(
            sql`update recipe_mark set rating = 1 where house_recipe_id = ${id} returning 1`,
          )
        ).rows.length,
      remove: async ({ tx }, id) =>
        (await tx.execute(sql`delete from recipe_mark where house_recipe_id = ${id} returning 1`))
          .rows.length,
    }));

  it("merges a patch and deletes a mark with nothing left", async () => {
    await withUser(db, randomUUID(), async (s) => {
      await ensureUser(s);
      const ref = { house: "negroni" };
      expect(await setMark(s, ref, { favourite: true })).toEqual({ noteChanged: false });
      expect(await setMark(s, ref, { rating: 4 })).toEqual({ noteChanged: false });
      expect(await getMark(s, ref)).toEqual({ favourite: true, rating: 4, note: null });
      await setMark(s, ref, { favourite: false, rating: null });
      expect(await getMark(s, ref)).toBeNull();
      expect(await setMark(s, { house: "no-such-drink" }, { favourite: true })).toBeNull();
    });
  });

  it("never loses a note: the one replaced or cleared comes back with undo", async () => {
    await withUser(db, randomUUID(), async (s) => {
      await ensureUser(s);
      const ref = { house: "negroni" };
      expect(await setMark(s, ref, { note: "less Campari" })).toEqual({ noteChanged: true });
      expect(await setMark(s, ref, { note: "less Campari" })).toEqual({ noteChanged: false });
      expect(await setMark(s, ref, { note: null })).toEqual({ noteChanged: true });
      expect(await getMark(s, ref)).toEqual({ favourite: false, rating: null, note: null });
      expect(await listMarks(s)).toEqual([]);
      expect(await undoNote(s, ref)).toBe(true);
      expect(await getMark(s, ref)).toMatchObject({ note: "less Campari" });
      expect(await undoNote(s, ref)).toBe(true);
      expect(await getMark(s, ref)).toMatchObject({ note: null });
      expect(await undoNote(s, { house: "daiquiri" })).toBe(false);
    });
  });

  it("refuses a rating outside 1–5 and a note over 1000 characters", async () => {
    const id = randomUUID();
    await withUser(db, id, ensureUser);
    await expect(
      withUser(db, id, (s) => setMark(s, { house: "negroni" }, { rating: 6 })),
    ).rejects.toThrow();
    await expect(
      withUser(db, id, (s) => setMark(s, { house: "negroni" }, { note: "x".repeat(1001) })),
    ).rejects.toThrow();
  });

  it("will not mark another user's own recipe", async () => {
    const ana = randomUUID();
    const recipe = await withUser(db, ana, async (s) => (await ensureUser(s), ownNegroni(s)));
    await withUser(db, randomUUID(), async (s) => {
      await ensureUser(s);
      expect(await setMark(s, { own: recipe }, { favourite: true })).toBeNull();
      expect(await listMarks(s)).toEqual([]);
    });
  });

  it("keeps an own recipe's mark through delete and restore", async () => {
    await withUser(db, randomUUID(), async (s) => {
      await ensureUser(s);
      const own = await ownNegroni(s);
      await setMark(s, { own }, { favourite: true, rating: 5, note: "my house spec" });
      await setMark(s, { house: "daiquiri" }, { rating: 3 });
      await deleteUserRecipe(s, own);
      expect((await listMarks(s)).map((m) => m.house ?? m.own)).toEqual(["daiquiri"]);
      await restoreUserRecipe(s, own);
      expect(await listMarks(s)).toContainEqual({
        house: null,
        own,
        favourite: true,
        rating: 5,
        note: "my house spec",
      });
    });
  });

  it("keeps a re-seed from deleting a marked recipe", async () => {
    await withUser(db, randomUUID(), async (s) => {
      await ensureUser(s);
      await setMark(s, { house: "zombie" }, { favourite: true });
    });
    const without = { ...seed, recipes: seed.recipes.filter((r) => r.id !== "zombie") };
    await expect(importSeed(MIGRATION_URL, without)).rejects.toThrow(/recipe_mark/);
  });

  it("shows nothing outside a scoped transaction", async () => {
    await expect(pool.query("select * from recipe_mark")).resolves.toMatchObject({ rowCount: 0 });
  });
});
