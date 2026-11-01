// Amount and strength display for recipe lines served by the api. Formatting goes through
// @stirred/units; nothing is converted here.
import { formatQuantity, quantity, type DisplayUnit } from "@stirred/units";
import type { RecipeDetail } from "@stirred/schema";

type Line = RecipeDetail["lines"][number];

export function amountText(line: Line, unit: DisplayUnit): string {
  if (line.amount) return formatQuantity(quantity(line.amount.value, line.amount.unit), unit);
  // A house recipe still being written shows a placeholder, never a guess.
  return line.text ?? "[ml]";
}

/** A note under the name, when the line also has a measured amount. */
export const lineNote = (line: Line) => (line.amount ? line.text : undefined);

export function strengthText(recipe: RecipeDetail): string {
  // Finished ABV and standard drinks arrive with the strength model (M1-02).
  return recipe.zeroProof ? "0% ABV · nothing to count" : "[x.x]% ABV · [x.x] standard drinks";
}

export function parseUnit(value: unknown): DisplayUnit {
  return value === "cl" || value === "oz" ? value : "ml";
}
