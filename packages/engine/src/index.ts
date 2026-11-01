// Pure ingredient taxonomy and matching: make now, one away, buy next. No database, no HTTP.
export { createTaxonomy, isWithin } from "./taxonomy.ts";
export type { IngredientNode, Substitution, Taxonomy } from "./taxonomy.ts";
export { buyNext, makeNow, matchLine, oneAway } from "./match.ts";
export type { Line, LineMatch, RecipeLike } from "./match.ts";
