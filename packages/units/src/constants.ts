// Every conversion constant lives here, with its source.

/**
 * Millilitres in one US fluid ounce, exact by definition: 1 US fl oz = 1/128 US gallon =
 * 231/128 cubic inches, and 1 cubic inch = 16.387064 ml. Source: NIST Handbook 44 (2024),
 * Appendix C, "Units of volume".
 */
export const ML_PER_US_FL_OZ = 29.5735295625;

/** Millilitres in one centilitre (SI prefixes). */
export const ML_PER_CL = 10;

/** US teaspoon = 1/6 US fl oz and tablespoon = 1/2 US fl oz (NIST Handbook 44, Appendix C). */
export const ML_PER_US_TSP = ML_PER_US_FL_OZ / 6;
export const ML_PER_US_TBSP = ML_PER_US_FL_OZ / 2;

/**
 * Millilitres a counted unit stands for when working out strength (ADR 0004); display keeps the
 * counted unit. dash: measured 0.73–1.0 ml for standard bitters bottles (Don Lee, via
 * bar-vademecum.eu/the-dash/). barspoon: 1/6 oz (Difford's Guide, "Measures and measuring").
 * drop: the metric drop, 20 per ml. top: assumption, a typical highball top-up of 0% mixer.
 * piece: excluded — solids and garnish carry no alcohol and negligible volume.
 */
export const STRENGTH_ML = { dash: 0.8, barspoon: 5, drop: 0.05, top: 90, piece: 0 } as const;

/** Density of ethanol at 20 °C, g/ml (EU Reg. 2870/2000 annex; OIML R22). */
export const ETHANOL_G_PER_ML = 0.78924;
