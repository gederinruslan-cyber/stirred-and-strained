import fc from "fast-check";
import { describe, expect, it } from "vitest";
import {
  METHODS,
  finishedAbv,
  quantity,
  standardDrinks,
  type StrengthLine,
  type Unit,
} from "../src/index.ts";

const line = (value: number, unit: Unit, abv = 0): StrengthLine => ({
  quantity: quantity(value, unit),
  abv,
});

const NEGRONI = [line(30, "ml", 40), line(30, "ml", 24), line(30, "ml", 16)];

describe("finishedAbv: the ADR 0004 worked examples", () => {
  it("Thai Basil Daiquiri, shaken: ≈159.7 ml at ≈15.0% (Arnold publishes 160 ml at 15%)", () => {
    const s = finishedAbv(
      [line(60, "ml", 40), line(22.5, "ml"), line(22.5, "ml"), line(2, "drop")],
      "shaken",
    );
    expect(s.dilution).toBeCloseTo(0.519, 3);
    expect(s.volumeMl).toBeCloseTo(159.7, 1);
    expect(s.abv).toBeCloseTo(15.0, 1);
  });

  it("Negroni, stirred: ≈19.2%, 18.9 g → US 1.35, UK 2.40 units, AU 1.89", () => {
    const s = finishedAbv(NEGRONI, "stirred");
    expect(s.abv).toBeCloseTo(19.2, 1);
    expect(s.ethanolGrams).toBeCloseTo(18.9, 1);
    expect(standardDrinks(s, "US")).toMatchObject({ measure: "standard drinks" });
    expect(standardDrinks(s, "US").value).toBeCloseTo(1.35, 2);
    expect(standardDrinks(s, "GB")).toMatchObject({ measure: "units" });
    expect(standardDrinks(s, "GB").value).toBeCloseTo(2.4, 2);
    expect(standardDrinks(s, "AU").value).toBeCloseTo(1.89, 2);
  });

  it("gin and tonic, built: the top counts as 90 ml at 0% → ≈11.0%, 15.8 g, US 1.13", () => {
    const s = finishedAbv([line(50, "ml", 40), line(1, "top")], "built");
    expect(s.dilution).toBeCloseTo(0.298, 3);
    expect(s.abv).toBeCloseTo(11.0, 1);
    expect(s.ethanolGrams).toBeCloseTo(15.8, 1);
    expect(standardDrinks(s, "US").value).toBeCloseTo(1.13, 2);
  });

  it("an all-0% sour, shaken: 0% and 0 standard drinks through the same function", () => {
    const s = finishedAbv([line(60, "ml"), line(30, "ml"), line(20, "ml")], "shaken");
    expect(s.dilution).toBeCloseTo(0.203, 3);
    expect(s.abv).toBe(0);
    expect(standardDrinks(s, "US").value).toBe(0);
  });
});

describe("finishedAbv: counted units and methods", () => {
  it("a dash is 0.8 ml, a barspoon 5 ml, a drop 0.05 ml; a piece adds nothing", () => {
    const as = (extra: StrengthLine) => finishedAbv([line(50, "ml", 40), extra], "stirred");
    expect(as(line(2, "dash")).volumeMl).toBeCloseTo(as(line(1.6, "ml")).volumeMl, 9);
    expect(as(line(1, "barspoon")).volumeMl).toBeCloseTo(as(line(5, "ml")).volumeMl, 9);
    expect(as(line(20, "drop")).volumeMl).toBeCloseTo(as(line(1, "ml")).volumeMl, 9);
    expect(as(line(3, "piece")).abv).toBe(finishedAbv([line(50, "ml", 40)], "stirred").abv);
  });

  it("built and muddled dilute as stirred, blended as shaken, layered not at all", () => {
    const d = (m: (typeof METHODS)[number]) => finishedAbv(NEGRONI, m).dilution;
    expect(d("built")).toBe(d("stirred"));
    expect(d("muddled")).toBe(d("stirred"));
    expect(d("blended")).toBe(d("shaken"));
    expect(d("layered")).toBe(0);
    expect(finishedAbv(NEGRONI, "layered").abv).toBeCloseTo((24 / 90) * 100, 9);
  });

  it("refuses a recipe with no line that has volume", () => {
    expect(() => finishedAbv([line(1, "piece")], "built")).toThrow(RangeError);
    expect(() => finishedAbv([], "shaken")).toThrow(RangeError);
  });
});

describe("standardDrinks: per country", () => {
  const s = finishedAbv(NEGRONI, "stirred");
  it.each([
    ["CA", 13.45],
    ["IT", 12],
    ["DK", 12],
    ["SE", 12],
    ["DE", 10],
    ["CH", 10],
    ["IE", 10],
    ["NZ", 10],
    ["FR", 10],
    ["ES", 10],
    ["PL", 10],
  ])("%s counts %s g per standard drink", (country, grams) => {
    expect(standardDrinks(s, country)).toMatchObject({ measure: "standard drinks" });
    expect(standardDrinks(s, country).value).toBeCloseTo(s.ethanolGrams / grams, 9);
  });

  it.each(["JP", "ZZ", "BR"])("%s gets grams of alcohol, not drinks", (country) => {
    expect(standardDrinks(s, country)).toMatchObject({ measure: "grams", value: s.ethanolGrams });
  });
});

describe("finishedAbv: properties", () => {
  const measured = fc.record({
    ml: fc.double({ min: 0.1, max: 20_000, noNaN: true }),
    abv: fc.double({ min: 0, max: 100, noNaN: true }),
  });
  const counted = fc.record({
    value: fc.double({ min: 0, max: 10, noNaN: true }),
    unit: fc.constantFrom<Unit>("dash", "barspoon", "drop", "piece", "top"),
    abv: fc.double({ min: 0, max: 100, noNaN: true }),
  });
  type Measured = { ml: number; abv: number };
  type Counted = { value: number; unit: Unit; abv: number };
  const recipe = fc.record({
    measured: fc.array(measured, { minLength: 1, maxLength: 8 }),
    counted: fc.array(counted, { maxLength: 4 }),
    method: fc.constantFrom(...METHODS),
  });
  const lines = (r: { measured: Measured[]; counted: Counted[] }, k = 1) => [
    ...r.measured.map((m) => line(m.ml * k, "ml", m.abv)),
    ...r.counted.map((c) => line(c.value, c.unit, c.abv)),
  ];

  it("0% in → 0% out and 0 standard drinks, every method", () => {
    fc.assert(
      fc.property(recipe, (r) => {
        const zero = lines(r).map((l) => ({ ...l, abv: 0 }));
        const s = finishedAbv(zero, r.method);
        return s.abv === 0 && standardDrinks(s, "GB").value === 0;
      }),
    );
  });

  it("scaling every measured line by k keeps the ABV and multiplies the volume by k", () => {
    fc.assert(
      fc.property(
        fc.record({ measured: recipe.map((r) => r.measured), method: recipe.map((r) => r.method) }),
        fc.double({ min: 0.25, max: 40, noNaN: true }),
        (r, k) => {
          const one = finishedAbv(lines({ ...r, counted: [] }), r.method);
          const many = finishedAbv(lines({ ...r, counted: [] }, k), r.method);
          return (
            Math.abs(many.abv - one.abv) < 1e-9 * Math.max(1, one.abv) &&
            Math.abs(many.volumeMl - one.volumeMl * k) < 1e-9 * many.volumeMl
          );
        },
      ),
    );
  });

  it("the finished ABV is finite and lies between 0 and the strongest line", () => {
    fc.assert(
      fc.property(recipe, (r) => {
        const all = lines(r);
        const s = finishedAbv(all, r.method);
        const strongest = Math.max(...all.map((l) => l.abv));
        return Number.isFinite(s.volumeMl) && s.abv >= 0 && s.abv <= strongest + 1e-9;
      }),
    );
  });
});
