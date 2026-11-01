import { isWithin, type IngredientNode, type Taxonomy } from "./taxonomy.ts";

export type Line = {
  readonly ingredient: string;
  readonly exact?: boolean;
  readonly optional?: boolean;
};
export type RecipeLike = {
  readonly id: string;
  readonly name: string;
  readonly lines: readonly Line[];
};
export type LineMatch = { kind: "direct" | "swap"; using: string };

const byString = (a: string, b: string) => (a < b ? -1 : a > b ? 1 : 0);
/** The stated recipe order: name, then id. */
const byRecipe = (a: RecipeLike, b: RecipeLike) => byString(a.name, b.name) || byString(a.id, b.id);

/**
 * How the bar covers one line. A line is satisfied by its own node or anything under it, or —
 * unless it is `exact` — by anything under one of its substitutes (one hop). A direct match
 * beats a swap; among equals the smallest owned id is used.
 */
export function matchLine(tax: Taxonomy, bar: Iterable<string>, line: Line): LineMatch | null {
  const owned = [...new Set(bar)].sort(byString);
  const subs = line.exact ? [] : (tax.substitutesFor.get(line.ingredient) ?? []);
  const direct = owned.find((id) =>
    line.exact ? id === line.ingredient : isWithin(tax, id, line.ingredient),
  );
  if (direct !== undefined) return { kind: "direct", using: direct };
  const swap = owned.find((id) => subs.some((s) => isWithin(tax, id, s)));
  return swap === undefined ? null : { kind: "swap", using: swap };
}

function missingLines(tax: Taxonomy, bar: readonly string[], recipe: RecipeLike) {
  return recipe.lines.filter((l) => !l.optional && matchLine(tax, bar, l) === null);
}

/** Recipes the bar can make now, each with the swaps it relies on; ordered by name, then id. */
export function makeNow<T extends RecipeLike>(
  tax: Taxonomy,
  bar: Iterable<string>,
  recipes: readonly T[],
) {
  const owned = [...bar];
  return [...recipes]
    .sort(byRecipe)
    .filter((r) => missingLines(tax, owned, r).length === 0)
    .map((recipe) => ({
      recipe,
      swaps: recipe.lines.flatMap((line) => {
        const m = matchLine(tax, owned, line);
        return m?.kind === "swap" ? [{ line, using: m.using }] : [];
      }),
    }));
}

/** Recipes missing exactly one required line, naming it; ordered by name, then id. */
export function oneAway<T extends RecipeLike>(
  tax: Taxonomy,
  bar: Iterable<string>,
  recipes: readonly T[],
) {
  const owned = [...bar];
  return [...recipes].sort(byRecipe).flatMap((recipe) => {
    const missing = missingLines(tax, owned, recipe);
    return missing.length === 1 ? [{ recipe, missing: missing[0]! }] : [];
  });
}

/**
 * The ingredients missing from one-away recipes, each with every one-away recipe owning it would
 * complete (directly or through a substitution). Ordered by that count (most first), then
 * ingredient name, then id.
 */
export function buyNext<T extends RecipeLike>(
  tax: Taxonomy,
  bar: Iterable<string>,
  recipes: readonly T[],
) {
  const away = oneAway(tax, bar, recipes);
  const candidates = [...new Set(away.map((a) => a.missing.ingredient))];
  return candidates
    .map((id) => ({
      ingredient: tax.nodes.get(id) as IngredientNode,
      unlocks: away.filter((a) => matchLine(tax, [id], a.missing) !== null).map((a) => a.recipe),
    }))
    .sort(
      (a, b) =>
        b.unlocks.length - a.unlocks.length ||
        byString(a.ingredient.name, b.ingredient.name) ||
        byString(a.ingredient.id, b.ingredient.id),
    );
}
