import { ML_PER_CL, ML_PER_US_FL_OZ } from "./constants.ts";
import type { CountedUnit, Quantity } from "./quantity.ts";

export const DISPLAY_UNITS = ["ml", "cl", "oz"] as const;
export type DisplayUnit = (typeof DISPLAY_UNITS)[number];

const PLURAL: Record<Exclude<CountedUnit, "top">, string> = {
  dash: "dashes",
  barspoon: "barspoons",
  drop: "drops",
  piece: "pieces",
};

/** 1.75 → "1¾", 0.5 → "½", 2 → "2". Expects a multiple of ¼. */
function quarters(n: number): string {
  const whole = Math.floor(n);
  const frac = ["", "¼", "½", "¾"][Math.round((n - whole) * 4)];
  return whole === 0 && frac ? frac : `${whole}${frac}`;
}

/**
 * The single display step for amounts. Rounding happens here and only here: ml to the whole
 * ml, cl to 0.1 cl, oz to the nearest ¼ oz, counted units to the nearest ½. A non-zero amount
 * never displays as zero: below the smallest step it reads "< 1 ml", "< 0.1 cl", "< ¼ oz" or
 * "½ dash". Counted units ignore the display unit.
 */
export function formatQuantity(q: Quantity, display: DisplayUnit): string {
  if (q.unit === "top") return "top up";

  if (q.unit !== "ml") {
    const halves = Math.round(q.value * 2) / 2;
    const n = q.value > 0 ? Math.max(halves, 0.5) : 0;
    return `${quarters(n)} ${n > 1 || n === 0 ? PLURAL[q.unit] : q.unit}`;
  }

  const v = q.value;
  switch (display) {
    case "ml": {
      const n = Math.round(v);
      return v > 0 && n === 0 ? "< 1 ml" : `${n} ml`;
    }
    case "cl": {
      const n = Math.round(v) / ML_PER_CL;
      return v > 0 && n === 0 ? "< 0.1 cl" : `${n} cl`;
    }
    case "oz": {
      const n = Math.round((v / ML_PER_US_FL_OZ) * 4) / 4;
      return v > 0 && n === 0 ? "< ¼ oz" : `${quarters(n)} oz`;
    }
  }
}
