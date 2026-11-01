// Pure quantities: canonical ml, display units, scaling. No database, no HTTP.
export { ML_PER_CL, ML_PER_US_FL_OZ, ML_PER_US_TBSP, ML_PER_US_TSP } from "./constants.ts";
export { COUNTED_UNITS, quantity, scaleQuantity } from "./quantity.ts";
export type { CountedUnit, Quantity, Unit } from "./quantity.ts";
export { DISPLAY_UNITS, formatQuantity } from "./format.ts";
export type { DisplayUnit } from "./format.ts";
