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
  /** The glass as a phrase ("rocks glass", "coupe"); absent when the source names none. */
  glass: z.string().optional(),
  abv: z.number().nonnegative(),
});

const RecipeRef = z.object({ id: z.string(), name: z.string() });

export const RecipeDetail = RecipeSummary.omit({ abv: true }).extend({
  /** How to make it, in our own words. */
  steps: z.array(z.string()).min(1),
  source: z.string(),
  credit: z.string(),
  licence: z.string(),
  strength: Strength,
  lines: z.array(RecipeLine),
  variations: z.array(RecipeRef),
  variationOf: RecipeRef.optional(),
});
export type RecipeDetail = z.infer<typeof RecipeDetail>;

/** ISO 3166 country for standard drinks; anything unknown shows grams of alcohol. */
const Country = z
  .string()
  .regex(/^[A-Z]{2}$/)
  .optional();
export const RecipeQuery = z.object({ country: Country });
export const RecipeParams = z.object({ id: z.string().max(120) });
const Many = z.union([z.string().max(120), z.array(z.string().max(120)).max(20)]).optional();
const Percent = z.coerce.number().min(0).max(100).optional();
export const RecipeListQuery = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(24),
  /** Part of the name, case and accents ignored. */
  q: z.string().max(100).optional(),
  /** Ingredient ids; a recipe matches through the hierarchy (whiskey takes bourbon). */
  include: Many,
  exclude: Many,
  base: Many,
  method: Many,
  glass: Many,
  family: Many,
  flavour: Many,
  abvMin: Percent,
  abvMax: Percent,
});
const Facet = z.array(z.object({ value: z.string(), label: z.string(), count: z.number().int() }));
export const RecipeList = z.object({
  items: z.array(RecipeSummary.extend({ family: z.string().optional() })),
  page: z.number().int(),
  pageSize: z.number().int(),
  total: z.number().int(),
  facets: z.object({
    base: Facet,
    method: Facet,
    glass: Facet,
    family: Facet,
    flavour: Facet,
  }),
});
export type RecipeList = z.infer<typeof RecipeList>;
export const IngredientList = z.object({ items: z.array(IngredientRef) });

// Landing page and demo (M0-08), over the house library.
export const DemoQuery = z.object({
  bottle: z.union([z.string(), z.array(z.string())]).optional(),
  basics: z.enum(["true", "false"]).optional(),
});
const DemoRecipe = RecipeSummary.omit({ abv: true, glass: true });
export const DemoResult = z.object({
  makeNow: z.array(
    DemoRecipe.extend({ swaps: z.array(z.object({ for: z.string(), using: z.string() })) }),
  ),
  oneAway: z.array(DemoRecipe.extend({ missing: IngredientRef })),
});
export type DemoResult = z.infer<typeof DemoResult>;

export const LandingQuery = RecipeQuery;
export const LandingResponse = z.object({
  bottles: z.array(IngredientRef),
  basics: z.array(IngredientRef),
  featured: z.array(RecipeDetail),
  daiquiri: RecipeDetail,
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

// Accounts (M2-01, ADR 0005). Answers never say whether an email has an account.
const Email = z.email().max(254);
/** 10 to 128 characters, no composition rules (NIST SP 800-63B). */
const Password = z.string().min(10).max(128);
const LinkToken = z.string().regex(/^[A-Za-z0-9_-]{43}$/);
export const SignUpBody = z.object({ email: Email, password: Password });
export const SignInBody = z.object({ email: Email, password: z.string().min(1).max(128) });
/** The password typed at sign-up comes back with the link (ADR 0005). */
export const ConfirmBody = z.object({ token: LinkToken, password: z.string().min(1).max(128) });
export const ResetBody = z.object({ email: Email });
export const ResetConfirmBody = z.object({ token: LinkToken, password: Password });
export const CheckEmail = z.object({ status: z.literal("check-email") });
/** A new session: the token goes into web's http-only cookie, never anywhere else. */
export const SessionResponse = z.object({ session: z.string(), expiresAt: z.iso.datetime() });
export type SessionResponse = z.infer<typeof SessionResponse>;
export const MeResponse = z.object({ email: z.string() });
export type MeResponse = z.infer<typeof MeResponse>;
