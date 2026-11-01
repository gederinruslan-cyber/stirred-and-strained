import { describe, expect, it } from "vitest";
import type { RecipeDetail } from "@stirred/schema";
import { amountText, strengthText } from "../lib/amounts.ts";

const recipe = (
  drinks: RecipeDetail["strength"]["drinks"],
  zeroProof = false,
  abv = 19.80281,
): RecipeDetail => ({
  id: "negroni",
  name: "Negroni",
  method: "built",
  glass: "rocks glass",
  steps: ["Fill a rocks glass with ice.", "Pour in everything and give it a gentle stir."],
  variations: [],
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

describe("amountText", () => {
  const line = (value: number, unit: "ml" | "dash" | "top", max?: number) => ({
    ingredient: { id: "x", name: "X" },
    amount: { value, unit },
    ...(max === undefined ? {} : { max }),
    optional: false,
  });
  it.each([
    [line(30, "ml"), "oz", "1 oz"],
    [line(2, "dash", 3), "ml", "2–3 dashes"],
    [line(22.5, "ml", 30), "oz", "¾–1 oz"],
    [line(1, "top"), "cl", "top up"],
  ] as const)("%o in %s → %s", (l, unit, text) => {
    expect(amountText(l, unit)).toBe(text);
  });
});
