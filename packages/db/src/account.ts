// Export and erase (M2-08): everything a user owns, and its removal. Scoped (ADR 0003).
import { sql } from "drizzle-orm";
import type { Scoped } from "./scope.ts";
import {
  getUserRecipe,
  listUserRecipes,
  type UserRecipe,
  type UserRecipeEvent,
} from "./user-recipes.ts";

const ts = (column: string) =>
  sql.raw(`to_char(${column} at time zone 'UTC', 'YYYY-MM-DD"T"HH24:MI:SS.MS"Z"')`);

export type UserExport = {
  account: { email: string; createdAt: string };
  /** When each live session started and ends; never its token. */
  sessions: { createdAt: string; expiresAt: string }[];
  bar: { ingredient: string; addedAt: string }[];
  swapsOff: { substitute: string; replaces: string; refusedAt: string }[];
  /** Deleted ones too, each with its full history. */
  recipes: (UserRecipe & { events: UserRecipeEvent[] })[];
  /** Every mark, on deleted own recipes too, with the note kept for undo. */
  marks: {
    house: string | null;
    own: string | null;
    favourite: boolean;
    rating: number | null;
    note: string | null;
    noteBefore: string | null;
    updatedAt: string;
  }[];
};

/** Every row the user owns, in a stable order. */
export async function exportUser(s: Scoped): Promise<UserExport> {
  const { tx, userId } = s;
  const account = await tx.execute<UserExport["account"]>(sql`
    select email, ${ts("created_at")} as "createdAt" from app_user where id = ${userId}`);
  const sessions = await tx.execute<UserExport["sessions"][number]>(sql`
    select ${ts("created_at")} as "createdAt", ${ts("expires_at")} as "expiresAt" from session
    where user_id = ${userId} and expires_at > now() order by created_at, expires_at`);
  const bar = await tx.execute<UserExport["bar"][number]>(sql`
    select ingredient_id as ingredient, ${ts("added_at")} as "addedAt" from bar_item
    where user_id = ${userId} order by ingredient_id`);
  const swapsOff = await tx.execute<UserExport["swapsOff"][number]>(sql`
    select substitute, replaces, ${ts("refused_at")} as "refusedAt" from substitution_refusal
    where user_id = ${userId} order by substitute, replaces`);
  const recipes = [];
  for (const r of await listUserRecipes(s)) recipes.push((await getUserRecipe(s, r.id))!);
  const marks = await tx.execute<UserExport["marks"][number]>(sql`
    select house_recipe_id as house, user_recipe_id as own, favourite, rating, note,
      note_before as "noteBefore", ${ts("updated_at")} as "updatedAt"
    from recipe_mark where user_id = ${userId}
    order by updated_at desc, house_recipe_id, user_recipe_id`);
  return {
    account: account.rows[0]!,
    sessions: sessions.rows,
    bar: bar.rows,
    swapsOff: swapsOff.rows,
    recipes,
    marks: marks.rows,
  };
}

/**
 * Removes the account and everything it owns: its pending mailed links, then the app_user row,
 * which every user-owned table follows (on delete cascade). False when there was no account.
 */
export async function eraseUser({ tx, userId }: Scoped): Promise<boolean> {
  await tx.execute(sql`select auth_forget_links()`);
  const { rows } = await tx.execute(sql`delete from app_user where id = ${userId} returning 1`);
  return rows.length === 1;
}
