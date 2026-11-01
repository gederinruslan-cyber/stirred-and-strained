import { describe, expect, it } from "vitest";
import type { RecipeDetail } from "@stirred/schema";
import { strengthText } from "../lib/amounts.ts";

const recipe = (
  drinks: RecipeDetail["strength"]["drinks"],
  zeroProof = false,
  abv = 19.80281,
): RecipeDetail => ({
  id: "negroni",
  name: "Negroni",
  method: "built",
  zeroProof,
  source: "https://iba-world.com/negroni/",
  credit: "Spec via iba-world.com",
  licence: "Bar Assistant open data, MIT",
  strength: { abv, volumeMl: 125.7, drinks },
  lines: [],
});

describe("strengthText rounds once, at display", () => {
  it.each([
    [{ measure: "standard drinks", value: 1.40372, source: "" }, "19.8% ABV · 1.4 standard drinks"],
    [{ measure: "standard drinks", value: 0.96, source: "" }, "19.8% ABV · 1.0 standard drink"],
    [{ measure: "units", value: 2.49, source: "" }, "19.8% ABV · 2.5 UK units"],
    [{ measure: "grams", value: 19.652, source: "" }, "19.8% ABV · 20 g of alcohol"],
  ] as const)("%o → %s", (drinks, text) => {
    expect(strengthText(recipe(drinks))).toBe(text);
  });

  it("says a zero-proof drink has nothing to count", () => {
    expect(
      strengthText(recipe({ measure: "standard drinks", value: 0, source: "" }, true, 0)),
    ).toBe("0% ABV · nothing to count");
  });
});
