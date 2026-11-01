// Custom recipes (M2-06): a user's own specs. Scoped (ADR 0003); never lost: delete only sets
// deleted_at, and every create and edit keeps the saved spec as an event. Amounts arrive
// canonical (the api converts oz and cl); ingredient ids are checked by the caller and the
// foreign key.
import { sql } from "drizzle-orm";
import type { Scoped } from "./scope.ts";
import type { Unit } from "./seed/transform.ts";

export type EnteredUnit = Unit | "cl" | "oz";
export type UserLine = {
  ingredient: string;
  /** Canonical: ml or a count of `unit`; null for "to taste". */
  value: number | null;
  unit: Unit | null;
  /** What the user typed it in, for showing it back when they edit. */
  entered: EnteredUnit | null;
  optional: boolean;
};
export type UserSpec = {
  name: string;
  method: string;
  glass: string | null;
  /** One step per line; null: written from the method. */
  steps: string | null;
  lines: UserLine[];
};
export type UserRecipe = UserSpec & {
  id: string;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
};
export type UserRecipeEvent = {
  kind: "created" | "edited" | "deleted" | "restored";
  at: string;
  spec: UserSpec | null;
};

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

const select = sql`
  select r.id, r.name, r.method, r.glass, r.steps,
    to_char(r.created_at at time zone 'UTC', 'YYYY-MM-DD"T"HH24:MI:SS.MS"Z"') as "createdAt",
    to_char(r.updated_at at time zone 'UTC', 'YYYY-MM-DD"T"HH24:MI:SS.MS"Z"') as "updatedAt",
    to_char(r.deleted_at at time zone 'UTC', 'YYYY-MM-DD"T"HH24:MI:SS.MS"Z"') as "deletedAt",
    coalesce(json_agg(json_build_object(
      'ingredient', l.ingredient_id,
      'value', l.amount_value,
      'unit', l.amount_unit,
      'entered', l.entered_unit,
      'optional', l.optional
    ) order by l.position) filter (where l.recipe_id is not null), '[]') as lines
  from user_recipe r left join user_recipe_line l on l.recipe_id = r.id`;

/** Every recipe of this user, deleted ones too, by name then id. */
export async function listUserRecipes({ tx, userId }: Scoped): Promise<UserRecipe[]> {
  const { rows } = await tx.execute<UserRecipe>(sql`${select}
    where r.user_id = ${userId} group by r.id order by r.name collate "C", r.id`);
  return rows;
}

/** One recipe with its history (oldest first), or null when this user has no such recipe. */
export async function getUserRecipe(
  { tx, userId }: Scoped,
  id: string,
): Promise<(UserRecipe & { events: UserRecipeEvent[] }) | null> {
  if (!UUID.test(id)) return null;
  const { rows } = await tx.execute<UserRecipe>(sql`${select}
    where r.user_id = ${userId} and r.id = ${id} group by r.id`);
  const recipe = rows[0];
  if (!recipe) return null;
  const events = await tx.execute<UserRecipeEvent>(sql`
    select kind, spec,
      to_char(at at time zone 'UTC', 'YYYY-MM-DD"T"HH24:MI:SS.MS"Z"') as at
    from user_recipe_event where user_id = ${userId} and recipe_id = ${id} order by seq`);
  return { ...recipe, events: events.rows };
}

async function writeLines({ tx, userId }: Scoped, id: string, lines: UserLine[]) {
  await tx.execute(
    sql`delete from user_recipe_line where user_id = ${userId} and recipe_id = ${id}`,
  );
  for (const [position, l] of lines.entries()) {
    await tx.execute(sql`
      insert into user_recipe_line
        (user_id, recipe_id, position, ingredient_id, amount_value, amount_unit, entered_unit, optional)
      values (${userId}, ${id}, ${position}, ${l.ingredient}, ${l.value}, ${l.unit}, ${l.entered},
        ${l.optional})`);
  }
}

async function record(
  { tx, userId }: Scoped,
  id: string,
  kind: UserRecipeEvent["kind"],
  spec: UserSpec | null,
) {
  await tx.execute(sql`
    insert into user_recipe_event (user_id, recipe_id, seq, kind, spec)
    select ${userId}, ${id}, coalesce(max(seq), 0) + 1, ${kind},
      ${spec === null ? null : JSON.stringify(spec)}::jsonb
    from user_recipe_event where recipe_id = ${id}`);
}

/** Saves a new recipe and its first history entry; returns its id. */
export async function createUserRecipe(s: Scoped, spec: UserSpec): Promise<string> {
  const { rows } = await s.tx.execute<{ id: string }>(sql`
    insert into user_recipe (user_id, name, method, glass, steps)
    values (${s.userId}, ${spec.name}, ${spec.method}, ${spec.glass}, ${spec.steps})
    returning id`);
  const id = rows[0]!.id;
  await writeLines(s, id, spec.lines);
  await record(s, id, "created", spec);
  return id;
}

/** Replaces a live recipe's spec and keeps it in the history; 0 when there is none to edit. */
export async function updateUserRecipe(s: Scoped, id: string, spec: UserSpec): Promise<number> {
  if (!UUID.test(id)) return 0;
  const { rows } = await s.tx.execute(sql`
    update user_recipe set name = ${spec.name}, method = ${spec.method}, glass = ${spec.glass},
      steps = ${spec.steps}, updated_at = now()
    where user_id = ${s.userId} and id = ${id} and deleted_at is null returning 1`);
  if (rows.length === 0) return 0;
  await writeLines(s, id, spec.lines);
  await record(s, id, "edited", spec);
  return 1;
}

/** Moves a live recipe to Deleted (kept, restorable); 0 when there is none. */
export async function deleteUserRecipe(s: Scoped, id: string): Promise<number> {
  if (!UUID.test(id)) return 0;
  const { rows } = await s.tx.execute(sql`
    update user_recipe set deleted_at = now()
    where user_id = ${s.userId} and id = ${id} and deleted_at is null returning 1`);
  if (rows.length > 0) await record(s, id, "deleted", null);
  return rows.length;
}

/** Brings a deleted recipe back; 0 when there is none deleted. */
export async function restoreUserRecipe(s: Scoped, id: string): Promise<number> {
  if (!UUID.test(id)) return 0;
  const { rows } = await s.tx.execute(sql`
    update user_recipe set deleted_at = null
    where user_id = ${s.userId} and id = ${id} and deleted_at is not null returning 1`);
  if (rows.length > 0) await record(s, id, "restored", null);
  return rows.length;
}
