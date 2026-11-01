// Favourites, ratings and notes (M2-07). Scoped (ADR 0003). A mark names a house recipe or one of
// the user's own; an own recipe must be this user's (a foreign key alone would accept another
// user's id). A note is never lost: the one it replaced is kept for undo.
import { sql } from "drizzle-orm";
import type { Scoped } from "./scope.ts";

export type MarkRef = { house: string } | { own: string };
export type Mark = { favourite: boolean; rating: number | null; note: string | null };
export type MarkPatch = Partial<Mark>;
export type MarkRow = Mark & { house: string | null; own: string | null };

const where = (userId: string, ref: MarkRef) =>
  "house" in ref
    ? sql`user_id = ${userId} and house_recipe_id = ${ref.house}`
    : sql`user_id = ${userId} and user_recipe_id = ${ref.own}`;

/** Whether the recipe exists for this user: any house recipe, or one of their own. */
export async function canMark({ tx, userId }: Scoped, ref: MarkRef): Promise<boolean> {
  const exists =
    "house" in ref
      ? sql`select 1 from recipe where id = ${ref.house}`
      : sql`select 1 from user_recipe where id = ${ref.own} and user_id = ${userId}`;
  return (await tx.execute(exists)).rows.length > 0;
}

/** This user's mark on the recipe, or null. */
export async function getMark({ tx, userId }: Scoped, ref: MarkRef): Promise<Mark | null> {
  const { rows } = await tx.execute<Mark>(
    sql`select favourite, rating, note from recipe_mark where ${where(userId, ref)}`,
  );
  return rows[0] ?? null;
}

/**
 * Merges the patch, keeping the note it replaces for undo. Returns null, writing nothing, when the
 * recipe does not exist for this user; otherwise whether the note changed.
 */
export async function setMark(
  s: Scoped,
  ref: MarkRef,
  patch: MarkPatch,
): Promise<{ noteChanged: boolean } | null> {
  if (!(await canMark(s, ref))) return null;
  const was = await current(s, ref);
  const next: Mark = { ...was, ...patch };
  const noteChanged = patch.note !== undefined && patch.note !== was.note;
  await write(s, ref, was.exists, next, noteChanged ? was.note : was.noteBefore);
  return { noteChanged };
}

/** Puts back the note as it was before its last change (and keeps this one for a redo). */
export async function undoNote(s: Scoped, ref: MarkRef): Promise<boolean> {
  const was = await current(s, ref);
  if (!was.exists || was.note === was.noteBefore) return false;
  await write(s, ref, true, { ...was, note: was.noteBefore }, was.note);
  return true;
}

async function current({ tx, userId }: Scoped, ref: MarkRef) {
  const { rows } = await tx.execute<Mark & { noteBefore: string | null }>(sql`
    select favourite, rating, note, note_before as "noteBefore"
    from recipe_mark where ${where(userId, ref)} for update`);
  const row = rows[0];
  return row
    ? { ...row, exists: true }
    : { favourite: false, rating: null, note: null, noteBefore: null, exists: false };
}

async function write(
  { tx, userId }: Scoped,
  ref: MarkRef,
  exists: boolean,
  next: Mark,
  noteBefore: string | null,
) {
  if (!next.favourite && next.rating === null && next.note === null && noteBefore === null) {
    await tx.execute(sql`delete from recipe_mark where ${where(userId, ref)}`);
  } else if (exists) {
    await tx.execute(sql`update recipe_mark
      set favourite = ${next.favourite}, rating = ${next.rating}, note = ${next.note},
        note_before = ${noteBefore}, updated_at = now()
      where ${where(userId, ref)}`);
  } else {
    await tx.execute(sql`insert into recipe_mark
      (user_id, house_recipe_id, user_recipe_id, favourite, rating, note, note_before)
      values (${userId}, ${"house" in ref ? ref.house : null}, ${"own" in ref ? ref.own : null},
        ${next.favourite}, ${next.rating}, ${next.note}, ${noteBefore})`);
  }
}

/** Every mark of this user that shows (favourite, rating or note) on a recipe they can open now
 * (own recipes in the bin wait). */
export async function listMarks({ tx, userId }: Scoped): Promise<MarkRow[]> {
  const { rows } = await tx.execute<MarkRow>(sql`
    select m.house_recipe_id as house, m.user_recipe_id as own, m.favourite, m.rating, m.note
    from recipe_mark m left join user_recipe r on r.id = m.user_recipe_id
    where m.user_id = ${userId} and (m.user_recipe_id is null or r.deleted_at is null)
      and (m.favourite or m.rating is not null or m.note is not null)
    order by m.updated_at desc, m.house_recipe_id, m.user_recipe_id`);
  return rows;
}
