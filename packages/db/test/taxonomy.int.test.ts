import { createTaxonomy } from "@stirred/engine";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { createDb, createPool, loadTaxonomy } from "../src/index.ts";
import { APP_URL, MIGRATION_URL } from "./env.ts";

// The migrator writes house data (as the seed import will); the api role only reads it.
const writer = createPool(MIGRATION_URL);
const app = createPool(APP_URL);
const asOwner = async (sql: string) => {
  const c = await writer.connect();
  try {
    await c.query("begin; set local role stirred_owner");
    await c.query(sql);
    await c.query("commit");
  } catch (e) {
    await c.query("rollback");
    throw e;
  } finally {
    c.release();
  }
};

const FIXTURE = `
  insert into ingredient_node (id, name, kind, parent_id, abv) values
    ('t-spirits', 'Spirits', 'category', null, 40),
    ('t-whiskey', 'Whiskey', 'type', 't-spirits', 40),
    ('t-bourbon', 'Bourbon', 'type', 't-whiskey', 45),
    ('t-rye', 'Rye', 'type', 't-whiskey', 45),
    ('t-pantry', 'Pantry', 'category', null, 0),
    ('t-soda', 'Soda water', 'type', 't-pantry', 0);
  insert into ingredient_substitution (substitute, replaces) values ('t-rye', 't-bourbon');`;

beforeAll(() => asOwner(FIXTURE));
afterAll(async () => {
  await asOwner(`delete from ingredient_substitution where substitute like 't-%';
    delete from ingredient_node where id like 't-%' and kind <> 'category';
    delete from ingredient_node where id like 't-%';`);
  await Promise.all([writer.end(), app.end()]);
});

describe("ingredient taxonomy tables", () => {
  it("load in the engine's shape, 0% nodes included, and the engine accepts them", async () => {
    const { nodes, substitutions } = await loadTaxonomy(createDb(app));
    const ours = nodes.filter((n) => n.id.startsWith("t-"));
    expect(ours).toContainEqual({
      id: "t-bourbon",
      name: "Bourbon",
      kind: "type",
      parentId: "t-whiskey",
      abv: 45,
    });
    expect(ours).toContainEqual({
      id: "t-soda",
      name: "Soda water",
      kind: "type",
      parentId: "t-pantry",
      abv: 0,
    });
    expect(ours.map((n) => n.id)).toEqual([...ours.map((n) => n.id)].sort());
    expect(substitutions).toContainEqual({ substitute: "t-rye", replaces: "t-bourbon" });
    expect(() => createTaxonomy(nodes, substitutions)).not.toThrow();
  });

  it.each([
    ["a category with a parent", "('t-x', 'X', 'category', 't-spirits', 0)"],
    ["a type without a parent", "('t-x', 'X', 'type', null, 0)"],
    ["an unknown parent", "('t-x', 'X', 'brand', 't-nope', 40)"],
    ["an ABV above 100", "('t-x', 'X', 'type', 't-spirits', 100.5)"],
    ["a negative ABV", "('t-x', 'X', 'type', 't-spirits', -1)"],
    ["an unknown kind", "('t-x', 'X', 'family', 't-spirits', 40)"],
  ])("refuses %s", async (_, row) => {
    await expect(
      asOwner(`insert into ingredient_node (id, name, kind, parent_id, abv) values ${row}`),
    ).rejects.toThrow();
  });

  it.each([
    ["an unknown node", "('t-nope', 't-bourbon')"],
    ["a node replacing itself", "('t-rye', 't-rye')"],
    ["a duplicate edge", "('t-rye', 't-bourbon')"],
  ])("refuses a substitution with %s", async (_, row) => {
    await expect(
      asOwner(`insert into ingredient_substitution (substitute, replaces) values ${row}`),
    ).rejects.toThrow();
  });

  it("refuses to delete a node that has children or edges", async () => {
    await expect(asOwner("delete from ingredient_node where id = 't-whiskey'")).rejects.toThrow();
    await expect(asOwner("delete from ingredient_node where id = 't-rye'")).rejects.toThrow();
  });

  it("is read-only for the api role", async () => {
    await expect(app.query("select count(*) from ingredient_node")).resolves.toBeTruthy();
    await expect(
      app.query("insert into ingredient_node values ('t-x', 'X', 'category', null, 0)"),
    ).rejects.toThrow(/permission denied/);
    await expect(
      app.query("update ingredient_node set name = 'Y' where id = 't-rye'"),
    ).rejects.toThrow(/permission denied/);
    await expect(app.query("delete from ingredient_substitution")).rejects.toThrow(
      /permission denied/,
    );
  });
});
