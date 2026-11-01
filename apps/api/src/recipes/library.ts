// The house library the api serves: taxonomy and recipes, loaded once at start (house data
// changes only by import and restart). Strength is derived here by packages/units (ADR 0004),
// never stored; zero-proof is derived from the ingredients, never from a tag.
import {
  createDb,
  loadRecipes,
  loadTaxonomy,
  type HouseRecipe,
  type Pool,
  type TaxonomyEdge,
  type TaxonomyNode,
} from "@stirred/db";
import { createTaxonomy, type Taxonomy } from "@stirred/engine";
import type { RecipeDetail } from "@stirred/schema";
import { finishedAbv, quantity, standardDrinks, type Method } from "@stirred/units";

export type Library = {
  tax: Taxonomy;
  recipes: HouseRecipe[];
  byId: Map<string, HouseRecipe>;
  abv: Map<string, number>;
};

export function createLibrary(
  nodes: TaxonomyNode[],
  substitutions: TaxonomyEdge[],
  recipes: HouseRecipe[],
): Library {
  return {
    tax: createTaxonomy(nodes, substitutions),
    recipes,
    byId: new Map(recipes.map((r) => [r.id, r])),
    abv: new Map(nodes.map((n) => [n.id, n.abv])),
  };
}

export async function loadLibrary(pool: Pool): Promise<Library> {
  const db = createDb(pool);
  const [{ nodes, substitutions }, recipes] = await Promise.all([
    loadTaxonomy(db),
    loadRecipes(db),
  ]);
  if (recipes.length === 0) throw new Error("the house library is empty: run `pnpm db:seed`");
  return createLibrary(nodes, substitutions, recipes);
}

export const nameOf = (lib: Library, id: string) => lib.tax.nodes.get(id)?.name ?? id;
export const ref = (lib: Library, id: string) => ({ id, name: nameOf(lib, id) });

export const isZeroProof = (lib: Library, r: HouseRecipe) =>
  r.lines.every((l) => lib.abv.get(l.ingredient) === 0);

function finished(lib: Library, r: HouseRecipe) {
  const lines = r.lines.flatMap((l) =>
    l.value === null || l.unit === null
      ? []
      : [{ quantity: quantity(l.value, l.unit), abv: lib.abv.get(l.ingredient) ?? 0 }],
  );
  return finishedAbv(lines, r.method as Method);
}

export const summary = (lib: Library, r: HouseRecipe) => ({
  id: r.id,
  name: r.name,
  method: r.method,
  zeroProof: isZeroProof(lib, r),
  abv: finished(lib, r).abv,
});

/** A recipe with its provenance and its strength for `country` (grams where none is known). */
export function detail(lib: Library, r: HouseRecipe, country = "ZZ"): RecipeDetail {
  const s = finished(lib, r);
  return {
    id: r.id,
    name: r.name,
    method: r.method,
    zeroProof: isZeroProof(lib, r),
    ...(r.glass ? { glass: r.glass } : {}),
    ...(r.steps ? { steps: r.steps } : {}),
    source: r.source,
    credit: r.credit,
    licence: r.licence,
    strength: { abv: s.abv, volumeMl: s.volumeMl, drinks: standardDrinks(s, country) },
    lines: r.lines.map((l) => ({
      ingredient: ref(lib, l.ingredient),
      ...(l.value !== null && l.unit !== null ? { amount: { value: l.value, unit: l.unit } } : {}),
      ...(l.max !== null ? { max: l.max } : {}),
      optional: l.optional,
    })),
  };
}
