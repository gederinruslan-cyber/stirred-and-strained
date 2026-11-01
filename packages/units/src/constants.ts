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
