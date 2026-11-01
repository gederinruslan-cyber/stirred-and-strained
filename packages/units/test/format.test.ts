import fc from "fast-check";
import { describe, expect, it } from "vitest";
import {
  DISPLAY_UNITS,
  ML_PER_US_FL_OZ,
  formatQuantity,
  quantity,
  scaleQuantity,
  type CountedUnit,
} from "../src/index.ts";

const ml = (value: number) => quantity(value, "ml");

describe("formatQuantity: volumes", () => {
  it.each([
    [30, "30 ml", "3 cl", "1 oz"],
    [45, "45 ml", "4.5 cl", "1½ oz"],
    [22.5, "23 ml", "2.3 cl", "¾ oz"],
    [15, "15 ml", "1.5 cl", "½ oz"],
    [0, "0 ml", "0 cl", "0 oz"],
    [0.3, "< 1 ml", "< 0.1 cl", "< ¼ oz"],
    [3, "3 ml", "0.3 cl", "< ¼ oz"],
    [20000, "20000 ml", "2000 cl", "676¼ oz"],
  ])("%s ml → %s · %s · %s", (value, inMl, inCl, inOz) => {
    expect(formatQuantity(ml(value), "ml")).toBe(inMl);
    expect(formatQuantity(ml(value), "cl")).toBe(inCl);
    expect(formatQuantity(ml(value), "oz")).toBe(inOz);
  });
});

describe("formatQuantity: counted units ignore the display unit", () => {
  it.each<[number, CountedUnit, string]>([
    [2, "dash", "2 dashes"],
    [1, "dash", "1 dash"],
    [1, "barspoon", "1 barspoon"],
    [0.5, "barspoon", "½ barspoon"],
    [1.5, "barspoon", "1½ barspoons"],
    [3, "drop", "3 drops"],
    [1, "piece", "1 piece"],
    [0.1, "dash", "½ dash"],
    [1, "top", "top up"],
  ])("%s %s → %s", (value, unit, text) => {
    for (const display of DISPLAY_UNITS) {
      expect(formatQuantity(quantity(value, unit), display)).toBe(text);
    }
  });
});

describe("scaleQuantity", () => {
  it("scales canonical values and rounds once, at display", () => {
    expect(formatQuantity(scaleQuantity(ml(30), 4), "oz")).toBe("4 oz");
    // 20 ml rounds to ¾ oz on its own; three servings are 60 ml, which is 2 oz, not 2¼.
    expect(formatQuantity(scaleQuantity(ml(20), 3), "oz")).toBe("2 oz");
    expect(scaleQuantity(ml(22.5), 3)).toEqual(ml(67.5));
  });

  it("leaves top-ups as they are", () => {
    expect(scaleQuantity(quantity(1, "top"), 6)).toEqual(quantity(1, "top"));
  });
});

describe("quantity", () => {
  it.each([-1, Number.NaN, Number.POSITIVE_INFINITY])("refuses %s", (value) => {
    expect(() => quantity(value, "ml")).toThrow(RangeError);
  });
});

// Volumes from zero through tiny (under 1 ml) to large batches (20 litres).
const volume = fc.oneof(
  fc.constant(0),
  fc.double({ min: 0, max: 1, noNaN: true }),
  fc.double({ min: 0, max: 20_000, noNaN: true }),
);
const display = fc.constantFrom(...DISPLAY_UNITS);

/** The numeric value a volume display stands for ("< …" reads as zero, "1¾" as 1.75). */
function shown(text: string): number {
  const fractions: Record<string, number> = { "¼": 0.25, "½": 0.5, "¾": 0.75 };
  const m = /^(<\s)?(\d+(?:\.\d+)?)?([¼½¾])?\s(?:ml|cl|oz)$/.exec(text);
  if (!m) throw new Error(`unparseable display: ${text}`);
  if (m[1]) return 0;
  return Number(m[2] ?? 0) + (m[3] ? fractions[m[3]]! : 0);
}

describe("formatQuantity properties", () => {
  it("never shows a non-zero amount as zero", () => {
    fc.assert(
      fc.property(volume, display, (v, d) => {
        const text = formatQuantity(ml(v), d);
        if (v > 0) expect(text).not.toMatch(/^0 /);
        else expect(text).toMatch(/^0 /);
      }),
    );
  });

  it("stays within half a display step of the true value", () => {
    const halfStep = { ml: 0.5, cl: 0.05, oz: 0.125 } as const;
    const perUnit = { ml: 1, cl: 10, oz: ML_PER_US_FL_OZ } as const;
    fc.assert(
      fc.property(volume, display, (v, d) => {
        const text = formatQuantity(ml(v), d);
        if (text.startsWith("<")) return;
        expect(Math.abs(shown(text) - v / perUnit[d])).toBeLessThanOrEqual(halfStep[d] + 1e-9);
      }),
    );
  });

  it("scaling by a then b equals scaling by a·b before display", () => {
    const factor = fc.double({ min: 0.25, max: 40, noNaN: true });
    fc.assert(
      fc.property(fc.double({ min: 0, max: 500, noNaN: true }), factor, factor, (v, a, b) => {
        const stepwise = scaleQuantity(scaleQuantity(ml(v), a), b);
        const once = scaleQuantity(ml(v), a * b);
        expect(stepwise.value).toBeCloseTo(once.value, 6);
      }),
    );
  });
});
