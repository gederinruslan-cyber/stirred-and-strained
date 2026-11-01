import { randomUUID } from "node:crypto";
import { sql } from "drizzle-orm";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import {
  createDb,
  createPool,
  createUser,
  createUserRecipe,
  deleteUserRecipe,
  getUserRecipe,
  listUserRecipes,
  restoreUserRecipe,
  updateUserRecipe,
  withUser,
  type Scoped,
  type UserSpec,
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
const OZ = 29.5735295625;
const negroni: UserSpec = {
  name: "Ana's Negroni",
  method: "built",
  glass: "Lowball",
  steps: null,
  lines: [
    { ingredient: "gin", value: OZ, unit: "ml", entered: "oz", optional: false },
    { ingredient: "campari", value: 30, unit: "ml", entered: "ml", optional: false },
    { ingredient: "orange", value: 1, unit: "piece", entered: "piece", optional: true },
  ],
};
const mine = async (s: Scoped) => (await ensureUser(s), createUserRecipe(s, negroni));

describe("user recipes (M2-06)", () => {
  // Each table on its own: B can neither read, change nor delete A's rows, by RLS alone.
  const rawTable = (table: "user_recipe_line" | "user_recipe_event", key: string) => ({
    create: mine,
    read: async ({ tx }: Scoped, id: string) =>
      (await tx.execute(sql`select ${sql.raw(key)} from ${sql.raw(table)} where recipe_id = ${id}`))
        .rows[0] ?? null,
    update: async ({ tx }: Scoped, id: string) =>
      (
        await tx.execute(
          sql`update ${sql.raw(table)} set user_id = user_id where recipe_id = ${id} returning 1`,
        )
      ).rows.length,
    remove: async ({ tx }: Scoped, id: string) =>
      (await tx.execute(sql`delete from ${sql.raw(table)} where recipe_id = ${id} returning 1`))
        .rows.length,
  });
  it("keeps user_recipe to its owner (ADR 0003)", () =>
    expectIsolated(db, {
      create: mine,
      read: getUserRecipe,
      update: (s, id) => updateUserRecipe(s, id, { ...negroni, name: "Bob's now" }),
      remove: deleteUserRecipe,
    }));
  it("keeps user_recipe_line to its owner", () =>
    expectIsolated(db, rawTable("user_recipe_line", "ingredient_id")));
  it("keeps user_recipe_event to its owner", () =>
    expectIsolated(db, rawTable("user_recipe_event", "kind")));

  it("stores amounts exactly as given and keeps every save", async () => {
    await withUser(db, randomUUID(), async (s) => {
      const id = await mine(s);
      const saved = await getUserRecipe(s, id);
      expect(saved?.lines[0]).toEqual(negroni.lines[0]);
      expect(saved?.lines.map((l) => l.ingredient)).toEqual(["gin", "campari", "orange"]);
      const lighter = {
        ...negroni,
        lines: [negroni.lines[0]!, { ...negroni.lines[1]!, value: 25 }],
      };
      expect(await updateUserRecipe(s, id, lighter)).toBe(1);
      const edited = await getUserRecipe(s, id);
      expect(edited?.lines.map((l) => l.value)).toEqual([OZ, 25]);
      expect(edited?.events.map((e) => e.kind)).toEqual(["created", "edited"]);
      expect(edited?.events[0]?.spec).toEqual(negroni);
    });
  });

  it("deletes softly, restores, and records both", async () => {
    await withUser(db, randomUUID(), async (s) => {
      const id = await mine(s);
      expect(await deleteUserRecipe(s, id)).toBe(1);
      expect(await deleteUserRecipe(s, id)).toBe(0);
      expect(await updateUserRecipe(s, id, negroni)).toBe(0);
      expect((await listUserRecipes(s))[0]?.deletedAt).not.toBeNull();
      expect(await restoreUserRecipe(s, id)).toBe(1);
      expect(await restoreUserRecipe(s, id)).toBe(0);
      const back = await getUserRecipe(s, id);
      expect(back?.deletedAt).toBeNull();
      expect(back?.events.map((e) => e.kind)).toEqual(["created", "deleted", "restored"]);
    });
  });

  it("answers null for an id that is not a uuid", async () => {
    await withUser(db, randomUUID(), async (s) => {
      expect(await getUserRecipe(s, "negroni")).toBeNull();
    });
  });

  it("keeps a re-seed from deleting an ingredient a recipe uses", async () => {
    await withUser(db, randomUUID(), async (s) => {
      await ensureUser(s);
      await createUserRecipe(s, {
        ...negroni,
        lines: [{ ingredient: "amer-picon", value: 5, unit: "ml", entered: "ml", optional: false }],
      });
    });
    const without = { ...seed, nodes: seed.nodes.filter((n) => n.id !== "amer-picon") };
    await expect(importSeed(MIGRATION_URL, without)).rejects.toThrow(/user_recipe_line/);
  });

  it("shows nothing outside a scoped transaction", async () => {
    for (const t of ["user_recipe", "user_recipe_line", "user_recipe_event"])
      await expect(pool.query(`select * from ${t}`)).resolves.toMatchObject({ rowCount: 0 });
  });
});
