// My Bar (M2-03): the ingredient ids a user keeps. Scoped (ADR 0003); ids are checked against the
// taxonomy by the caller and by the foreign key.
import { sql } from "drizzle-orm";
import type { Scoped } from "./scope.ts";

/** The user's ingredient ids, ordered by id. */
export async function listBar({ tx, userId }: Scoped): Promise<string[]> {
  const { rows } = await tx.execute<{ ingredient_id: string }>(
    sql`select ingredient_id from bar_item where user_id = ${userId} order by ingredient_id`,
  );
  return rows.map((r) => r.ingredient_id);
}

/** Adds the ingredients not already kept; returns how many were new. */
export async function addToBar({ tx, userId }: Scoped, ingredientIds: string[]): Promise<number> {
  const { rows } = await tx.execute(sql`
    insert into bar_item (user_id, ingredient_id)
    select ${userId}, id from jsonb_array_elements_text(${JSON.stringify(ingredientIds)}::jsonb) as id
    on conflict do nothing returning 1`);
  return rows.length;
}

/** Rows removed: 0 when the user does not keep it. */
export async function removeFromBar({ tx, userId }: Scoped, ingredientId: string): Promise<number> {
  const { rows } = await tx.execute(
    sql`delete from bar_item where user_id = ${userId} and ingredient_id = ${ingredientId} returning 1`,
  );
  return rows.length;
}
