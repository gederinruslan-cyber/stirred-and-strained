// Zod types shared by api and web; the source of the API contract.
import { z } from "zod";

export const HealthResponse = z.object({
  status: z.enum(["ok", "degraded"]),
  db: z.enum(["up", "down"]),
});
export type HealthResponse = z.infer<typeof HealthResponse>;

export const ErrorBody = z.object({ error: z.string() });
export type ErrorBody = z.infer<typeof ErrorBody>;

// House recipes (M1-07). Amounts are canonical: ml or a counted unit. Strength is derived by
// ADR 0004 for the visitor's country; never stored.
export const Amount = z.object({
  value: z.number().nonnegative(),
  unit: z.enum(["ml", "dash", "barspoon", "drop", "piece", "top"]),
});
export const IngredientRef = z.object({ id: z.string(), name: z.string() });

export const RecipeLine = z.object({
  ingredient: IngredientRef,
  amount: Amount.optional(),
  /** The top of a range ("2–3 dashes"), in the amount's unit. */
  max: z.number().nonnegative().optional(),
  optional: z.boolean(),
});

export const Strength = z.object({
  /** Finished ABV in %, after the method's dilution. */
  abv: z.number().nonnegative(),
  volumeMl: z.number().positive(),
  drinks: z.object({
    measure: z.enum(["standard drinks", "units", "grams"]),
    value: z.number().nonnegative(),
    source: z.string(),
  }),
});

export const RecipeSummary = z.object({
  id: z.string(),
  name: z.string(),
  method: z.string(),
  zeroProof: z.boolean(),
  abv: z.number().nonnegative(),
});

export const RecipeDetail = RecipeSummary.omit({ abv: true }).extend({
  glass: z.string().optional(),
  steps: z.string().optional(),
  source: z.string(),
  credit: z.string(),
  licence: z.string(),
  strength: Strength,
  lines: z.array(RecipeLine),
});
export type RecipeDetail = z.infer<typeof RecipeDetail>;

/** ISO 3166 country for standard drinks; anything unknown shows grams of alcohol. */
const Country = z
  .string()
  .regex(/^[A-Z]{2}$/)
  .optional();
export const RecipeQuery = z.object({ country: Country });
export const RecipeParams = z.object({ id: z.string().max(120) });
export const RecipeListQuery = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(24),
});
export const RecipeList = z.object({
  items: z.array(RecipeSummary),
  page: z.number().int(),
  pageSize: z.number().int(),
  total: z.number().int(),
});

// Landing page and demo (M0-08), over the house library.
export const DemoQuery = z.object({
  bottle: z.union([z.string(), z.array(z.string())]).optional(),
  basics: z.enum(["true", "false"]).optional(),
  zero: z.enum(["true", "false"]).optional(),
});
const DemoRecipe = RecipeSummary.omit({ abv: true });
export const DemoResult = z.object({
  makeNow: z.array(
    DemoRecipe.extend({ swaps: z.array(z.object({ for: z.string(), using: z.string() })) }),
  ),
  oneAway: z.array(DemoRecipe.extend({ missing: IngredientRef })),
});
export type DemoResult = z.infer<typeof DemoResult>;

export const LandingQuery = RecipeQuery;
export const LandingResponse = z.object({
  bottles: z.array(IngredientRef.extend({ zeroProof: z.boolean() })),
  basics: z.array(IngredientRef),
  featured: z.array(RecipeDetail),
  daiquiri: RecipeDetail,
  zeroBand: z.array(RecipeDetail),
  buyNext: z.object({
    bar: z.array(z.string()),
    rows: z.array(
      z.object({
        ingredient: IngredientRef,
        count: z.number().int(),
        recipes: z.array(z.string()),
      }),
    ),
  }),
});
export type LandingResponse = z.infer<typeof LandingResponse>;

// Age gate (M1-11).
export const AgeRulesQuery = z.object({ country: z.string().max(8).optional() });
export const AgeRule = z.object({
  country: z.string(),
  name: z.string(),
  age: z.number().int(),
  help: z.object({ name: z.string(), phone: z.string().optional(), url: z.string() }),
});
export const AgeRulesResponse = z.object({
  rule: AgeRule,
  countries: z.array(z.object({ country: z.string(), name: z.string() })),
});
export type AgeRulesResponse = z.infer<typeof AgeRulesResponse>;
