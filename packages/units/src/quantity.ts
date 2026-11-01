/** Units amounts are counted in instead of measured; they have no ml value here. */
export const COUNTED_UNITS = ["dash", "barspoon", "drop", "piece", "top"] as const;
export type CountedUnit = (typeof COUNTED_UNITS)[number];

/** Liquid volume is always canonical ml; oz and cl exist only at display. */
export type Unit = "ml" | CountedUnit;

export type Quantity = { readonly value: number; readonly unit: Unit };

/** The one way to make a quantity: refuses negative, NaN and infinite values. */
export function quantity(value: number, unit: Unit): Quantity {
  if (!Number.isFinite(value) || value < 0) {
    throw new RangeError(`a quantity needs a finite value of zero or more, got ${value}`);
  }
  return { value, unit };
}

/** Scales by servings or batch size on the canonical value; no rounding. A top-up stays one. */
export function scaleQuantity(q: Quantity, factor: number): Quantity {
  if (q.unit === "top") return q;
  return quantity(q.value * factor, q.unit);
}
