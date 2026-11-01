// The house library the api serves: taxonomy and recipes, loaded once at start (house data
// changes only by import and restart). Strength is derived here by packages/units (ADR 0004),
// never stored.
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
import { glassName, stepsFor } from "./steps.ts";

export type Library = {
  tax: Taxonomy;
  recipes: HouseRecipe[];
  byId: Map<string, HouseRecipe>;
  abv: Map<string, number>;
  /** Recipes whose name contains this one's as whole words (Negroni → Coffee Negroni). */
  variations: Map<string, HouseRecipe[]>;
  /** The longest house recipe name inside this one's (Coffee Negroni → Negroni). */
  variationOf: Map<string, HouseRecipe>;
};

export const words = (name: string) =>
  ` ${name
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim()} `;

function variationsOf(recipes: HouseRecipe[]) {
  const variations = new Map<string, HouseRecipe[]>();
  const variationOf = new Map<string, HouseRecipe>();
  const keyed = recipes.map((r) => ({ r, key: words(r.name) }));
  for (const base of keyed) {
    for (const v of keyed) {
      if (v.key === base.key || !v.key.includes(base.key)) continue;
      variations.set(base.r.id, [...(variations.get(base.r.id) ?? []), v.r]);
      const best = variationOf.get(v.r.id);
      if (!best || base.r.name.length > best.name.length) variationOf.set(v.r.id, base.r);
    }
  }
  return { variations, variationOf };
}

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
    ...variationsOf(recipes),
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

/** A type reads lower case in a sentence ("club soda"); a brand keeps its name. */
const topName = (lib: Library, id: string) =>
  lib.tax.nodes.get(id)?.kind === "brand" ? nameOf(lib, id) : nameOf(lib, id).toLowerCase();

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
  ...(r.glass ? { glass: glassName(r.glass) } : {}),
  abv: finished(lib, r).abv,
});

/** A recipe with its provenance and its strength for `country` (grams where none is known). */
export function detail(lib: Library, r: HouseRecipe, country = "ZZ"): RecipeDetail {
  const s = finished(lib, r);
  return {
    id: r.id,
    name: r.name,
    method: r.method,
    ...(r.glass ? { glass: glassName(r.glass) } : {}),
    steps: r.steps
      ? r.steps.split("\n")
      : stepsFor(
          r.method,
          r.glass,
          r.lines.filter((l) => l.unit === "top").map((l) => topName(lib, l.ingredient)),
        ),
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
    variations: (lib.variations.get(r.id) ?? []).map((v) => ({ id: v.id, name: v.name })),
    ...(lib.variationOf.has(r.id)
      ? {
          variationOf: { id: lib.variationOf.get(r.id)!.id, name: lib.variationOf.get(r.id)!.name },
        }
      : {}),
  };
}
