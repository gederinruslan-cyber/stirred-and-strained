// Finished strength and standard drinks, by the model in ADR 0004. Pure; rounding is the
// display's job. Zero-proof drinks go through the same functions.
import { ETHANOL_G_PER_ML, STRENGTH_ML } from "./constants.ts";
import type { Quantity } from "./quantity.ts";

export const METHODS = ["shaken", "stirred", "built", "blended", "muddled", "layered"] as const;
export type Method = (typeof METHODS)[number];

/** A recipe line as strength sees it: a canonical quantity and the ingredient's ABV in %. */
export type StrengthLine = { readonly quantity: Quantity; readonly abv: number };

export type Strength = {
  /** Water from ice, as a fraction of the volume before dilution. */
  readonly dilution: number;
  readonly volumeMl: number;
  readonly ethanolMl: number;
  readonly ethanolGrams: number;
  /** Finished ABV in %. */
  readonly abv: number;
};

/** Shaken: D. Arnold, Liquid Intelligence (2014) p. 123, sign erratum per M. McDonald (2020). */
const shaken = (abv0: number) => -1.567 * abv0 ** 2 + 1.742 * abv0 + 0.203;
/** Stirred: D. Arnold, Liquid Intelligence (2014) p. 123. */
const stirred = (abv0: number) => -1.21 * abv0 ** 2 + 1.246 * abv0 + 0.145;

/** Built and muddled as stirred, blended as shaken (assumptions, ADR 0004); layered: no ice. */
const DILUTION: Record<Method, (abv0: number) => number> = {
  shaken,
  stirred,
  built: stirred,
  blended: shaken,
  muddled: stirred,
  layered: () => 0,
};

const ml = (q: Quantity) => (q.unit === "ml" ? q.value : q.value * STRENGTH_ML[q.unit]);

/** Finished volume and ABV after the method's dilution. Refuses a recipe with no volume. */
export function finishedAbv(lines: readonly StrengthLine[], method: Method): Strength {
  const v0 = lines.reduce((sum, l) => sum + ml(l.quantity), 0);
  if (!(v0 > 0)) throw new RangeError("strength needs at least one line with volume");
  const ethanolMl = lines.reduce((sum, l) => sum + (ml(l.quantity) * l.abv) / 100, 0);
  const dilution = DILUTION[method](ethanolMl / v0);
  const volumeMl = v0 * (1 + dilution);
  return {
    dilution,
    volumeMl,
    ethanolMl,
    ethanolGrams: ethanolMl * ETHANOL_G_PER_ML,
    abv: (ethanolMl / volumeMl) * 100,
  };
}

export type DrinkCount = {
  readonly measure: "standard drinks" | "units" | "grams";
  readonly value: number;
  readonly source: string;
};

/**
 * Grams of ethanol in one standard drink, as each government states it (ADR 0004). Values
 * re-read 2026-11-01: US, CA, ES, IT and DE from the page itself; IE, AU, NZ, FR, PL, DK, SE and
 * CH from the official site's search result (the page refused automated reads).
 */
const GRAMS_PER_DRINK: Record<string, { grams: number; source: string }> = {
  US: {
    grams: 14,
    source: "https://www.niaaa.nih.gov/alcohols-effects-health/what-standard-drink",
  },
  CA: {
    grams: 13.45,
    source:
      "https://www.canada.ca/en/health-canada/services/substance-use/alcohol/low-risk-alcohol-drinking-guidelines.html",
  },
  IE: {
    grams: 10,
    source: "https://www2.hse.ie/living-well/alcohol/weekly-low-risk-alcohol-guidelines/",
  },
  AU: {
    grams: 10,
    source: "https://www.health.gov.au/topics/alcohol/about-alcohol/standard-drinks-guide",
  },
  NZ: {
    grams: 10,
    source: "https://www.alcohol.org.nz/help-advice/standard-drinks/whats-a-standard-drink",
  },
  FR: {
    grams: 10,
    source: "https://www.alcool-info-service.fr/alcool/boissons-alcoolisees/verre-alcool",
  },
  ES: { grams: 10, source: "https://www.sanidad.gob.es/campannas/campanas07/alcoholmenores9.htm" },
  PL: { grams: 10, source: "https://kcpu.gov.pl/" },
  IT: { grams: 12, source: "https://www.epicentro.iss.it/passi/indicatori/alcol" },
  DK: { grams: 12, source: "https://www.sst.dk/" },
  SE: { grams: 12, source: "https://www.1177.se/" },
  // The government states 10–12 g; 10 g signed off (NH-4).
  DE: { grams: 10, source: "https://www.kenn-dein-limit.de/haeufige-fragen-zum-thema-alkohol/" },
  CH: { grams: 10, source: "https://www.bag.admin.ch/" },
};

/** One UK unit is 10 ml of pure ethanol. */
const UK_UNIT = {
  ml: 10,
  source: "https://www.nhs.uk/live-well/alcohol-advice/calculating-alcohol-units/",
};

/**
 * Standard drinks for an ISO country code; elsewhere grams of alcohol. Japan defines no drink unit
 * and counts grams (MHLW 2024, https://www.mhlw.go.jp/stf/newpage_38541.html).
 */
export function standardDrinks(strength: Strength, country: string): DrinkCount {
  if (country === "GB") {
    return { measure: "units", value: strength.ethanolMl / UK_UNIT.ml, source: UK_UNIT.source };
  }
  const rule = GRAMS_PER_DRINK[country];
  if (!rule) {
    return { measure: "grams", value: strength.ethanolGrams, source: "ADR 0004" };
  }
  return {
    measure: "standard drinks",
    value: strength.ethanolGrams / rule.grams,
    source: rule.source,
  };
}
