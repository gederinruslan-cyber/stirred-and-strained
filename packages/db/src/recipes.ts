import { sql } from "drizzle-orm";
import type { Db } from "./scope.ts";
import type { SeedRecipe } from "./seed/transform.ts";

/** A house recipe as stored: provenance, canonical lines in order, our own steps if written. */
export type HouseRecipe = SeedRecipe & { steps: string | null };

/** Every house recipe, ordered by name then id. House data: no user scope. */
export async function loadRecipes(db: Db): Promise<HouseRecipe[]> {
  const { rows } = await db.execute<HouseRecipe>(sql`
    select r.id, r.name, r.method, r.glass, r.tags, r.source, r.credit, r.licence, r.steps,
      coalesce(json_agg(json_build_object(
        'ingredient', l.ingredient_id,
        'value', l.amount_value::float8,
        'unit', l.amount_unit,
        'max', l.amount_max::float8,
        'optional', l.optional
      ) order by l.position) filter (where l.recipe_id is not null), '[]') as lines
    from recipe r left join recipe_line l on l.recipe_id = r.id
    group by r.id
    order by r.name collate "C", r.id collate "C"`);
  return rows;
}
