import { randomBytes, randomUUID } from "node:crypto";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import {
  addToBar,
  createDb,
  createPool,
  createSession,
  createUser,
  createUserRecipe,
  deleteUserRecipe,
  eraseUser,
  exportUser,
  issueToken,
  setMark,
  setSwapAllowed,
  updateUserRecipe,
  withUser,
  type Scoped,
  type UserSpec,
} from "../src/index.ts";
import { importSeed, readSeed } from "../src/seed/import.ts";
import { ADMIN_URL, APP_URL, MIGRATION_URL } from "./env.ts";

const pool = createPool(APP_URL);
const admin = createPool(ADMIN_URL);
const db = createDb(pool);
beforeAll(() =>
  importSeed(MIGRATION_URL, readSeed(new URL("../../../data/seed", import.meta.url).pathname)),
);
afterAll(() => Promise.all([pool.end(), admin.end()]));

const spec = (campari: number): UserSpec => ({
  name: "Ana's Negroni",
  method: "built",
  glass: null,
  steps: null,
  lines: [
    { ingredient: "gin", value: 30, unit: "ml", entered: "ml", optional: false },
    { ingredient: "campari", value: campari, unit: "ml", entered: "oz", optional: false },
  ],
});

/** A user with a row in every user-owned table, and a pending reset link for their address. */
async function fullUser() {
  const id = randomUUID();
  const email = `${id}@example.test`;
  await withUser(db, id, async (s: Scoped) => {
    await createUser(s, email, "scrypt$test");
    await createSession(s, randomBytes(32), new Date(Date.now() + 86_400_000));
    await addToBar(s, ["gin", "campari"]);
    await setSwapAllowed(s, { substitute: "rye-whiskey", replaces: "bourbon-whiskey" }, false);
    const recipe = await createUserRecipe(s, spec(29.5735295625));
    await updateUserRecipe(s, recipe, spec(25));
    await deleteUserRecipe(s, recipe);
    await setMark(s, { house: "negroni" }, { favourite: true, rating: 4, note: "More Campari" });
    await setMark(s, { house: "negroni" }, { note: "Less Campari" });
  });
  await issueToken(db, randomBytes(32), "reset", email, null);
  return { id, email };
}

/** Tables with a user_id column, read from the catalog so a new one is never missed. */
async function userTables(): Promise<string[]> {
  const { rows } = await admin.query<{ table_name: string }>(`
    select c.table_name from information_schema.columns c
    join information_schema.tables t using (table_schema, table_name)
    where c.table_schema = 'public' and c.column_name = 'user_id' and t.table_type = 'BASE TABLE'
    order by c.table_name`);
  return rows.map((r) => r.table_name);
}

/** Rows a user has left in every user-owned table (as the superuser: no row-level security). */
async function rowsOf(user: { id: string; email: string }) {
  const counts: Record<string, number> = {};
  for (const table of await userTables()) {
    const { rows } = await admin.query(`select 1 from ${table} where user_id = $1`, [user.id]);
    counts[table] = rows.length;
  }
  counts.app_user = (
    await admin.query("select 1 from app_user where id = $1", [user.id])
  ).rowCount!;
  counts.auth_token = (
    await admin.query("select 1 from auth_token where email = $1", [user.email])
  ).rowCount!;
  return counts;
}

describe("export and erase (M2-08)", () => {
  it("every user-owned table goes when its user does (on delete cascade)", async () => {
    const tables = await userTables();
    expect(tables).toEqual(
      expect.arrayContaining(["bar_item", "recipe_mark", "session", "user_recipe"]),
    );
    const { rows } = await admin.query<{ table: string }>(`
      select cl.relname as table from pg_constraint k
      join pg_class cl on cl.oid = k.conrelid
      join pg_attribute a on a.attrelid = k.conrelid and a.attnum = any (k.conkey)
      where k.contype = 'f' and k.confrelid = 'app_user'::regclass and k.confdeltype = 'c'
        and a.attname = 'user_id' and array_length(k.conkey, 1) = 1`);
    expect(rows.map((r) => r.table).sort()).toEqual(tables);
  });

  it("exports everything the user owns, deleted recipes and kept notes included", async () => {
    const ana = await fullUser();
    await fullUser();
    const data = await withUser(db, ana.id, exportUser);
    expect(data.account).toMatchObject({ email: ana.email });
    expect(data.sessions).toHaveLength(1);
    expect(Object.keys(data.sessions[0]!).sort()).toEqual(["createdAt", "expiresAt"]);
    expect(data.bar.map((b) => b.ingredient)).toEqual(["campari", "gin"]);
    expect(data.swapsOff).toMatchObject([
      { substitute: "rye-whiskey", replaces: "bourbon-whiskey" },
    ]);
    expect(data.recipes).toHaveLength(1);
    const recipe = data.recipes[0]!;
    expect(recipe.deletedAt).not.toBeNull();
    expect(recipe.lines[1]).toMatchObject({ ingredient: "campari", value: 25, entered: "oz" });
    expect(recipe.events.map((e) => e.kind)).toEqual(["created", "edited", "deleted"]);
    expect(recipe.events[0]!.spec?.lines[1]?.value).toBe(29.5735295625);
    expect(data.marks).toMatchObject([
      {
        house: "negroni",
        own: null,
        favourite: true,
        rating: 4,
        note: "Less Campari",
        noteBefore: "More Campari",
      },
    ]);
  });

  it("erase leaves no row for the user and every row of the other", async () => {
    const ana = await fullUser();
    const ben = await fullUser();
    const before = await rowsOf(ben);
    expect(Object.values(await rowsOf(ana)).every((n) => n > 0)).toBe(true);

    expect(await withUser(db, ana.id, eraseUser)).toBe(true);

    expect(Object.values(await rowsOf(ana)).every((n) => n === 0)).toBe(true);
    expect(await rowsOf(ben)).toEqual(before);
    expect(await withUser(db, ana.id, eraseUser)).toBe(false);
  });
});
