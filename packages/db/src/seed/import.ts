// Writes the transformed seed as the table owner, in one transaction: upserts what is in the
// seed, removes what is not. Running it twice on the same snapshot changes nothing.
import { readFileSync } from "node:fs";
import { createPool } from "../pool.ts";
import { transform, type Rules } from "./transform.ts";
import type { Snapshot } from "./snapshot.ts";

export function readSeed(dir: string) {
  const read = (file: string) => JSON.parse(readFileSync(`${dir}/${file}`, "utf8"));
  return transform(read("bar-assistant.json") as Snapshot, read("rules.json") as Rules);
}

export async function importSeed(migrationUrl: string, seed: ReturnType<typeof transform>) {
  const pool = createPool(migrationUrl);
  const c = await pool.connect();
  const col = <T, K extends keyof T>(rows: T[], key: K) => rows.map((r) => r[key]);
  try {
    await c.query("begin");
    await c.query("set local role stirred_owner");
    const { nodes, recipes } = seed;
    await c.query(
      `insert into ingredient_node (id, name, kind, parent_id, abv)
       select * from unnest($1::text[], $2::text[], $3::text[], $4::text[], $5::numeric[])
       on conflict (id) do update set name = excluded.name, kind = excluded.kind,
         parent_id = excluded.parent_id, abv = excluded.abv
       where (ingredient_node.name, ingredient_node.kind, ingredient_node.parent_id, ingredient_node.abv)
         is distinct from (excluded.name, excluded.kind, excluded.parent_id, excluded.abv)`,
      [
        col(nodes, "id"),
        col(nodes, "name"),
        col(nodes, "kind"),
        col(nodes, "parentId"),
        col(nodes, "abv"),
      ],
    );
    await c.query(
      `insert into recipe (id, name, method, glass, tags, source, credit, licence)
       select id, name, method, glass, array(select jsonb_array_elements_text(tags)), source, credit, licence
       from unnest($1::text[], $2::text[], $3::text[], $4::text[], $5::jsonb[], $6::text[], $7::text[], $8::text[])
         as t(id, name, method, glass, tags, source, credit, licence)
       on conflict (id) do update set name = excluded.name, method = excluded.method,
         glass = excluded.glass, tags = excluded.tags, source = excluded.source,
         credit = excluded.credit, licence = excluded.licence`,
      [
        col(recipes, "id"),
        col(recipes, "name"),
        col(recipes, "method"),
        col(recipes, "glass"),
        recipes.map((r) => JSON.stringify(r.tags)),
        col(recipes, "source"),
        col(recipes, "credit"),
        col(recipes, "licence"),
      ],
    );
    const lines = recipes.flatMap((r) =>
      r.lines.map((l, position) => ({ recipe: r.id, position, ...l })),
    );
    await c.query("delete from recipe_line where recipe_id = any($1)", [col(recipes, "id")]);
    await c.query(
      `insert into recipe_line (recipe_id, position, ingredient_id, amount_value, amount_unit, amount_max, optional)
       select * from unnest($1::text[], $2::int[], $3::text[], $4::numeric[], $5::text[], $6::numeric[], $7::bool[])`,
      [
        col(lines, "recipe"),
        col(lines, "position"),
        col(lines, "ingredient"),
        col(lines, "value"),
        col(lines, "unit"),
        col(lines, "max"),
        col(lines, "optional"),
      ],
    );
    await c.query("delete from recipe where id <> all($1)", [col(recipes, "id")]);
    await c.query(
      "delete from ingredient_substitution where substitute <> all($1) or replaces <> all($1)",
      [col(nodes, "id")],
    );
    await c.query("delete from ingredient_node where id <> all($1)", [col(nodes, "id")]);
    await c.query("commit");
  } catch (error) {
    await c.query("rollback");
    throw error;
  } finally {
    c.release();
    await pool.end();
  }
}
