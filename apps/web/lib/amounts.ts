// Amount and strength display for recipe lines served by the api. Formatting goes through
// @stirred/units; nothing is converted here.
import { formatQuantity, quantity, type DisplayUnit } from "@stirred/units";
import type { RecipeDetail } from "@stirred/schema";

type Line = RecipeDetail["lines"][number];

export function amountText(line: Line, unit: DisplayUnit): string {
  if (!line.amount) return "to taste";
  const text = formatQuantity(quantity(line.amount.value, line.amount.unit), unit);
  if (line.max === undefined) return text;
  // A range keeps one unit word: "2–3 dashes", "¾–1 oz".
  const top = formatQuantity(quantity(line.max, line.amount.unit), unit);
  return `${text.split(" ")[0]}–${top}`;
}

/**
 * Finished ABV and the country's drink count, rounded once here: ABV and drinks to 0.1, grams
 * to the whole gram. The api derives both (ADR 0004).
 */
export function strengthText(recipe: RecipeDetail): string {
  if (recipe.zeroProof) return "0% ABV · nothing to count";
  const { abv, drinks } = recipe.strength;
  const count = drinks.value.toFixed(1);
  const measure =
    drinks.measure === "grams"
      ? `${Math.round(drinks.value)} g of alcohol`
      : drinks.measure === "units"
        ? `${count} UK ${count === "1.0" ? "unit" : "units"}`
        : `${count} ${count === "1.0" ? "standard drink" : "standard drinks"}`;
  return `${abv.toFixed(1)}% ABV · ${measure}`;
}

export function parseUnit(value: unknown): DisplayUnit {
  return value === "cl" || value === "oz" ? value : "ml";
}
