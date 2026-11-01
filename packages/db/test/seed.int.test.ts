import { afterAll, describe, expect, it } from "vitest";
import { createPool } from "../src/index.ts";
import { importSeed, readSeed } from "../src/seed/import.ts";
import { APP_URL, MIGRATION_URL } from "./env.ts";

const seed = readSeed(new URL("../../../data/seed", import.meta.url).pathname);
const app = createPool(APP_URL);
afterAll(() => app.end());

const lines = async (id: string) =>
  (
    await app.query(
      `select ingredient_id as i, amount_value::float8 as v, amount_unit as u from recipe_line
       where recipe_id = $1 order by position`,
      [id],
    )
  ).rows;
const fingerprint = async () =>
  (
    await app.query(`select
      (select md5(string_agg(t::text, ',' order by id)) from ingredient_node t) as nodes,
      (select md5(string_agg(t::text, ',' order by id)) from recipe t) as recipes,
      (select md5(string_agg(t::text, ',' order by recipe_id, position)) from recipe_line t) as lines`)
  ).rows[0];

describe("seed import", () => {
  it("imports the pinned snapshot, every recipe with provenance, and a re-run changes nothing", async () => {
    await importSeed(MIGRATION_URL, seed);
    const first = await fingerprint();
    await importSeed(MIGRATION_URL, seed);
    expect(await fingerprint()).toEqual(first);
    const { rows } = await app.query(
      "select count(*)::int as n, count(*) filter (where source = '' or credit = '' or licence = '')::int as bare from recipe",
    );
    expect(rows[0]).toEqual({ n: seed.recipes.length, bare: 0 });
  });

  it("pins the landing classics to the IBA specs", async () => {
    expect(await lines("negroni")).toEqual([
      { i: "gin", v: 30, u: "ml" },
      { i: "campari", v: 30, u: "ml" },
      { i: "sweet-vermouth", v: 30, u: "ml" },
    ]);
    expect((await lines("daiquiri")).map((l) => [l.v, l.u])).toEqual([
      [60, "ml"],
      [20, "ml"],
      [2, "barspoon"],
    ]);
    expect((await lines("margarita")).map((l) => l.v)).toEqual([50, 20, 15]);
    expect(await lines("old-fashioned")).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ v: 45, u: "ml" }),
        expect.objectContaining({ v: 1, u: "piece" }),
        expect.objectContaining({ i: "angostura-aromatic-bitters", u: "dash" }),
      ]),
    );
  });

  it("derives zero-proof from the ingredients, never from a source tag", async () => {
    const { rows } = await app.query(`select
      (select count(*)::int from recipe where 'Virgin' = any(tags)) as tagged,
      (select count(*)::int from recipe r where not exists (select 1 from recipe_line l
        join ingredient_node n on n.id = l.ingredient_id where l.recipe_id = r.id and n.abv > 0)) as zero,
      (select bool_and(n.abv > 0) from recipe_line l join ingredient_node n on n.id = l.ingredient_id
        where l.recipe_id = 'tonic-rickey' and n.id = 'angostura-aromatic-bitters') as bitters`);
    expect(rows[0]).toEqual({ tagged: 0, zero: expect.any(Number), bitters: true });
    expect(rows[0].zero).toBeGreaterThanOrEqual(9);
  });

  it("is read-only for the api role", async () => {
    await expect(app.query("update recipe set name = 'x' where id = 'negroni'")).rejects.toThrow(
      /permission denied/,
    );
    await expect(app.query("delete from recipe_line")).rejects.toThrow(/permission denied/);
  });
});
