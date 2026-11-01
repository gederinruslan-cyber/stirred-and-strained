// Turns the facts-only snapshot plus data/seed/rules.json into house taxonomy and recipes. Pure:
// every problem not excused in the rules throws, naming the recipe or ingredient.
import { createTaxonomy } from "@stirred/engine";
import { ML_PER_CL, ML_PER_US_FL_OZ, ML_PER_US_TBSP, ML_PER_US_TSP } from "@stirred/units";
import type { TaxonomyNode } from "../taxonomy.ts";
import type { Snapshot } from "./snapshot.ts";

export type Unit = "ml" | "dash" | "barspoon" | "drop" | "piece" | "top";
export type SeedLine = {
  ingredient: string;
  value: number | null;
  unit: Unit | null;
  max: number | null;
  optional: boolean;
};
export type SeedRecipe = {
  id: string;
  name: string;
  method: string;
  glass: string | null;
  tags: string[];
  source: string;
  credit: string;
  licence: string;
  lines: SeedLine[];
};
export type Correction = {
  source: string;
  credit: string;
  method?: string;
  lines: { ingredient: string; amount: number; unit: Unit; optional?: boolean }[];
};
export type Rules = {
  categories: Record<string, string>;
  moveUnder: Record<string, string>;
  placements: Record<string, string>;
  exclusions: Record<string, string>;
  /** Recipes sourced to iba-world.com whose amounts were checked against the page and match. */
  ibaChecked: string[];
  corrections: Record<string, Correction>;
};

export const LICENCE = "Bar Assistant open data, MIT";
/** IBA specs are facts checked entry by entry; the IBA publishes no licence (data/SOURCES.md). */
export const IBA_LICENCE = "Facts from the IBA official list (no licence published)";

const METHODS: Record<string, string> = {
  Shake: "shaken",
  Stir: "stirred",
  Build: "built",
  Blend: "blended",
  Muddle: "muddled",
  Layer: "layered",
};
const ML: Record<string, number> = {
  ml: 1,
  cl: ML_PER_CL,
  oz: ML_PER_US_FL_OZ,
  teaspoon: ML_PER_US_TSP,
  tsp: ML_PER_US_TSP,
  tablespoon: ML_PER_US_TBSP,
  tablespoons: ML_PER_US_TBSP,
};
const COUNTED: Record<string, Unit> = {
  dash: "dash",
  dashes: "dash",
  barspoon: "barspoon",
  drop: "drop",
  drops: "drop",
  ...Object.fromEntries(
    "whole slice slices wedge wedges leaf leaves sprig sprigs peel cube piece stick stalk stalks chunks beans yolk scoop scoops"
      .split(" ")
      .map((u) => [u, "piece" as const]),
  ),
};
const round3 = (n: number) => Math.round(n * 1000) / 1000;

function amount(l: Snapshot["cocktails"][number]["lines"][number], where: string) {
  if (l.units === "topup" || l.units === "top")
    return { value: 1, unit: "top" as const, max: null };
  const factor = ML[l.units];
  const unit = factor ? ("ml" as const) : COUNTED[l.units];
  if (!unit) throw new Error(`${where}: unit "${l.units}" has no canonical form`);
  if (l.amount == null || l.amount <= 0) return { value: null, unit: null, max: null };
  const scale = (n: number) => round3(n * (factor ?? 1));
  return {
    value: scale(l.amount),
    unit,
    max: l.max != null && l.max > l.amount ? scale(l.max) : null,
  };
}

function credit(source: string, author: string | null) {
  const where = /^https?:\/\//.test(source)
    ? new URL(source).hostname.replace(/^www\./, "")
    : source;
  return `Spec via ${where}${author ? ` (${author})` : ""}`;
}

export function transform(snapshot: Snapshot, rules: Rules) {
  const hasChildren = new Set(snapshot.ingredients.map((i) => i.parent).filter(Boolean));

  const nodes: TaxonomyNode[] = Object.entries(rules.categories).map(([id, name]) => ({
    id,
    name,
    kind: "category" as const,
    parentId: null,
    abv: 0,
  }));
  for (const i of snapshot.ingredients) {
    const parentId =
      i.parent ?? rules.moveUnder[i.id] ?? (hasChildren.has(i.id) ? null : rules.placements[i.id]);
    if (i.parent === null && !hasChildren.has(i.id) && !parentId) {
      throw new Error(`ingredient "${i.id}" needs a placement in rules.json`);
    }
    const kind = parentId === null ? "category" : i.brand ? "brand" : "type";
    nodes.push({ id: i.id, name: i.name, kind, parentId: parentId ?? null, abv: i.abv });
  }
  const tax = createTaxonomy(nodes, []);

  const recipes: SeedRecipe[] = [];
  const excluded: string[] = [];
  for (const c of snapshot.cocktails) {
    if (rules.exclusions[c.id]) {
      excluded.push(c.id);
      continue;
    }
    const where = `recipe "${c.id}"`;
    const fix = rules.corrections[c.id];
    if (!c.source && !fix) throw new Error(`${where} has no source`);
    if (!fix && c.source?.includes("iba-world.com") && !rules.ibaChecked.includes(c.id)) {
      throw new Error(`${where} is sourced to the IBA but not checked against its page`);
    }
    const method = fix?.method ?? (c.method ? METHODS[c.method] : undefined);
    if (!method) throw new Error(`${where} has no known method ("${c.method}")`);
    const lines: SeedLine[] = fix
      ? fix.lines.map((l) => ({
          ingredient: l.ingredient,
          value: l.amount,
          unit: l.unit,
          max: null,
          optional: l.optional ?? false,
        }))
      : c.lines.map((l) => ({
          ingredient: l.ingredient,
          optional: l.optional,
          ...amount(l, where),
        }));
    for (const l of lines) {
      if (!tax.nodes.has(l.ingredient))
        throw new Error(`${where}: ingredient "${l.ingredient}" is not in the taxonomy`);
    }
    const source = fix?.source ?? c.source!;
    recipes.push({
      id: c.id,
      name: c.name,
      method,
      glass: c.glass,
      // Zero-proof is derived from the ingredients, never taken from a tag (three upstream
      // "Virgin" recipes carry dashes of 44.7% bitters).
      tags: c.tags.filter((t) => t !== "Virgin"),
      source,
      credit: fix?.credit ?? credit(source, c.author),
      licence: fix ? IBA_LICENCE : LICENCE,
      lines,
    });
  }
  return { nodes, recipes, excluded };
}
