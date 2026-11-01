// Zod types shared by api and web; the source of the API contract.
import { z } from "zod";

export const HealthResponse = z.object({
  status: z.enum(["ok", "degraded"]),
  db: z.enum(["up", "down"]),
});
export type HealthResponse = z.infer<typeof HealthResponse>;

export const ErrorBody = z.object({ error: z.string() });
export type ErrorBody = z.infer<typeof ErrorBody>;

// Landing page and demo (M0-08). Amounts are canonical: ml or a counted unit.
export const Amount = z.object({
  value: z.number().nonnegative(),
  unit: z.enum(["ml", "dash", "barspoon", "drop", "piece", "top"]),
});
export const IngredientRef = z.object({ id: z.string(), name: z.string() });

export const RecipeLine = z.object({
  ingredient: IngredientRef,
  label: z.string(),
  amount: Amount.optional(),
  text: z.string().optional(),
});
export const RecipeDetail = z.object({
  id: z.string(),
  name: z.string(),
  method: z.string(),
  steps: z.string().optional(),
  source: z.string().optional(),
  zeroProof: z.boolean(),
  lines: z.array(RecipeLine),
});
export type RecipeDetail = z.infer<typeof RecipeDetail>;

const RecipeSummary = z.object({
  id: z.string(),
  name: z.string(),
  method: z.string(),
  zeroProof: z.boolean(),
});

export const DemoQuery = z.object({
  bottle: z.union([z.string(), z.array(z.string())]).optional(),
  basics: z.enum(["true", "false"]).optional(),
  zero: z.enum(["true", "false"]).optional(),
});
export const DemoResult = z.object({
  makeNow: z.array(
    RecipeSummary.extend({ swaps: z.array(z.object({ for: z.string(), using: z.string() })) }),
  ),
  oneAway: z.array(RecipeSummary.extend({ missing: IngredientRef })),
});
export type DemoResult = z.infer<typeof DemoResult>;

export const LandingResponse = z.object({
  bottles: z.array(IngredientRef.extend({ zeroProof: z.boolean() })),
  basics: z.array(IngredientRef),
  featured: z.array(RecipeDetail),
  daiquiri: RecipeDetail,
  ginBucks: z.array(RecipeDetail),
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
