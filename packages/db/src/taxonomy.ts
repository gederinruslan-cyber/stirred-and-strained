import { sql } from "drizzle-orm";
import type { Db } from "./scope.ts";

/** An ingredient node as packages/engine reads it, plus its strength (% ABV). */
export type TaxonomyNode = {
  id: string;
  name: string;
  kind: "category" | "type" | "brand";
  parentId: string | null;
  abv: number;
};
export type TaxonomyEdge = { substitute: string; replaces: string };

/** The whole house taxonomy, ordered by id. House data: no user scope. */
export async function loadTaxonomy(
  db: Db,
): Promise<{ nodes: TaxonomyNode[]; substitutions: TaxonomyEdge[] }> {
  const nodes = await db.execute<TaxonomyNode>(
    sql`select id, name, kind, parent_id as "parentId", abv::float8 as abv from ingredient_node order by id`,
  );
  const edges = await db.execute<TaxonomyEdge>(
    sql`select substitute, replaces from ingredient_substitution order by substitute, replaces`,
  );
  return { nodes: nodes.rows, substitutions: edges.rows };
}
