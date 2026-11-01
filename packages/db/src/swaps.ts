// Substitution preferences (M2-05): the house swaps a user has turned off. Swaps count until
// refused, so only refusals are stored. Scoped (ADR 0003).
import { sql } from "drizzle-orm";
import type { Scoped } from "./scope.ts";

export type Swap = { substitute: string; replaces: string };

/** The swaps this user has turned off, ordered by substitute then replaces. */
export async function listRefusals({ tx, userId }: Scoped): Promise<Swap[]> {
  const { rows } = await tx.execute<Swap>(sql`
    select substitute, replaces from substitution_refusal where user_id = ${userId}
    order by substitute, replaces`);
  return rows;
}

/** Turns a house swap on or off for this user; false when there is no such swap. */
export async function setSwapAllowed(
  { tx, userId }: Scoped,
  swap: Swap,
  allowed: boolean,
): Promise<boolean> {
  const exists = await tx.execute(sql`
    select 1 from ingredient_substitution
    where substitute = ${swap.substitute} and replaces = ${swap.replaces}`);
  if (exists.rows.length === 0) return false;
  await tx.execute(
    allowed
      ? sql`delete from substitution_refusal where user_id = ${userId}
          and substitute = ${swap.substitute} and replaces = ${swap.replaces}`
      : sql`insert into substitution_refusal (user_id, substitute, replaces)
          values (${userId}, ${swap.substitute}, ${swap.replaces}) on conflict do nothing`,
  );
  return true;
}
