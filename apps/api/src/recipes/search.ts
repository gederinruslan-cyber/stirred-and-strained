// Search over the house library: name, ingredients through the hierarchy, and facets derived at
// load (base spirit from the taxonomy, family and flavour from the source's tags through our
// own labels). Values within a facet are OR, facets are AND; counts are over the results.
import { isWithin } from "@stirred/engine";
import { summary, words, type Library, type Spec } from "./library.ts";
import { glassName } from "./steps.ts";

const FAMILY: Record<string, string> = {
  Sour: "Sour",
  Tiki: "Tiki",
  Negroni: "Negroni",
  Spritz: "Spritz",
  Mule: "Mule",
  "Old Fashioned": "Old Fashioned",
  Margarita: "Margarita",
  Manhattan: "Manhattan",
  Smash: "Smash",
  Julep: "Julep",
  Swizzle: "Swizzle",
  Flip: "Flip",
  Fizz: "Fizz",
  Mojito: "Mojito",
  highball: "Highball",
  Punch: "Punch",
};
const FLAVOUR: Record<string, string> = {
  Citrusy: "Citrusy",
  Bitter: "Bitter",
  Fruity: "Fruity",
  Sweet: "Sweet",
  Smokey: "Smoky",
  Herbacious: "Herbal",
  Herbal: "Herbal",
  Tropical: "Tropical",
  Refreshing: "Refreshing",
  Coffee: "Coffee",
  Complex: "Complex",
  Savory: "Savoury",
  Dry: "Dry",
  Spicy: "Spicy",
  Light: "Light",
  Floral: "Floral",
  Bright: "Bright",
  Briny: "Briny",
  Minty: "Minty",
  Nutty: "Nutty",
};
const SPIRITS = "spirits";
const NO_SPIRIT = { id: "none", name: "No spirit" };

type Entry = {
  r: Spec & { tags: readonly string[] };
  key: string;
  base: { id: string; name: string };
  family: string[];
  flavour: string[];
  abv: number;
};

/** The type directly under spirits for the largest-volume spirit line (ties by id). */
function baseSpirit(lib: Library, r: Spec) {
  const top = (id: string) => {
    let at = id;
    while (lib.tax.nodes.get(at)?.parentId && lib.tax.nodes.get(at)!.parentId !== SPIRITS)
      at = lib.tax.nodes.get(at)!.parentId!;
    return at;
  };
  const spirits = r.lines
    .filter((l) => l.unit === "ml" && l.value !== null && isWithin(lib.tax, l.ingredient, SPIRITS))
    .sort((a, b) => b.value! - a.value! || (a.ingredient < b.ingredient ? -1 : 1));
  const first = spirits[0];
  if (!first || first.ingredient === SPIRITS) return NO_SPIRIT;
  const id = top(first.ingredient);
  return { id, name: lib.tax.nodes.get(id)!.name };
}

const unique = (xs: string[]) => [...new Set(xs)];
const entry = (lib: Library, r: Entry["r"]): Entry => ({
  r,
  key: words(r.name),
  base: baseSpirit(lib, r),
  family: unique(r.tags.flatMap((t) => (FAMILY[t] ? [FAMILY[t]] : []))),
  flavour: unique(r.tags.flatMap((t) => (FLAVOUR[t] ? [FLAVOUR[t]] : []))),
  abv: summary(lib, r).abv,
});
const cache = new WeakMap<Library, Entry[]>();
function entries(lib: Library): Entry[] {
  let all = cache.get(lib);
  if (!all) {
    all = lib.recipes.map((r) => entry(lib, r));
    cache.set(lib, all);
  }
  return all;
}
const byName = (a: Entry, b: Entry) =>
  a.r.name < b.r.name ? -1 : a.r.name > b.r.name ? 1 : a.r.id < b.r.id ? -1 : 1;

export type SearchQuery = {
  q?: string;
  include: string[];
  exclude: string[];
  base: string[];
  method: string[];
  glass: string[];
  family: string[];
  flavour: string[];
  abvMin?: number;
  abvMax?: number;
  /** Signed in (M2-07): the user's marks by recipe id, and the wanted ones. */
  marks?: ReadonlyMap<string, { favourite: boolean; rating: number | null }>;
  mark?: string[];
};

const MARK_LABEL: Record<string, string> = { favourite: "Favourites", rated4: "Rated 4+" };

type Facet = { value: string; label: string; count: number }[];

function facet(rows: Entry[], pick: (e: Entry) => { value: string; label: string }[]): Facet {
  const counts = new Map<string, { value: string; label: string; count: number }>();
  for (const e of rows)
    for (const v of pick(e)) {
      const c = counts.get(v.value) ?? { ...v, count: 0 };
      c.count += 1;
      counts.set(v.value, c);
    }
  return [...counts.values()].sort(
    (a, b) => b.count - a.count || (a.label < b.label ? -1 : a.label > b.label ? 1 : 0),
  );
}

/**
 * Matching recipes in the library's order (name, then id) and the facet counts over them;
 * `own` adds a signed-in user's recipes (M2-06), which carry no tags.
 */
export function search(lib: Library, q: SearchQuery, own: readonly Spec[] = []) {
  const key = q.q ? words(q.q).trim() : "";
  const has = (e: Entry, id: string) => e.r.lines.some((l) => isWithin(lib.tax, l.ingredient, id));
  const any = (wanted: string[], values: string[]) =>
    wanted.length === 0 || wanted.some((w) => values.includes(w));
  const marked = (e: Entry) => {
    const m = q.marks?.get(e.r.id);
    return m
      ? [...(m.favourite ? ["favourite"] : []), ...((m.rating ?? 0) >= 4 ? ["rated4"] : [])]
      : [];
  };
  const all =
    own.length === 0
      ? entries(lib)
      : [...entries(lib), ...own.map((r) => entry(lib, { ...r, tags: [] }))].sort(byName);
  const rows = all.filter(
    (e) =>
      (!key || e.key.includes(` ${key}`)) &&
      q.include.every((id) => has(e, id)) &&
      !q.exclude.some((id) => has(e, id)) &&
      any(q.base, [e.base.id]) &&
      any(q.method, [e.r.method]) &&
      any(q.glass, [e.r.glass ?? ""]) &&
      any(q.family, e.family) &&
      any(q.flavour, e.flavour) &&
      (q.abvMin === undefined || e.abv >= q.abvMin) &&
      (q.abvMax === undefined || e.abv <= q.abvMax) &&
      (!q.marks || any(q.mark ?? [], marked(e))),
  );
  const same = (v: string) => [{ value: v, label: v }];
  return {
    rows,
    facets: {
      base: facet(rows, (e) => [{ value: e.base.id, label: e.base.name }]),
      method: facet(rows, (e) => same(e.r.method)),
      glass: facet(rows, (e) =>
        e.r.glass ? [{ value: e.r.glass, label: glassName(e.r.glass) }] : [],
      ),
      family: facet(rows, (e) => e.family.flatMap(same)),
      flavour: facet(rows, (e) => e.flavour.flatMap(same)),
      ...(q.marks
        ? {
            mark: facet(rows, (e) => marked(e).map((v) => ({ value: v, label: MARK_LABEL[v]! }))),
          }
        : {}),
    },
  };
}
