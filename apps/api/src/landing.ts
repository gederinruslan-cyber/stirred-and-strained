// The landing page's data and demo: the engine over the sample library (M1-07 switches to the
// house library). No user data; read-only.
import { buyNext, createTaxonomy, makeNow, oneAway } from "@stirred/engine";
import {
  DemoQuery,
  DemoResult,
  ErrorBody,
  LandingResponse,
  type RecipeDetail,
} from "@stirred/schema";
import type { FastifyInstance } from "fastify";
import type { ZodTypeProvider } from "fastify-type-provider-zod";
import {
  ALWAYS,
  BASICS,
  DEMO_BOTTLES,
  SAMPLE_NODES,
  SAMPLE_RECIPES,
  SAMPLE_SUBSTITUTIONS,
  isZeroProof,
  type SampleRecipe,
} from "./sample/library.ts";

const tax = createTaxonomy(SAMPLE_NODES, SAMPLE_SUBSTITUTIONS);
const nameOf = (id: string) => tax.nodes.get(id)?.name ?? id;
const ref = (id: string) => ({ id, name: nameOf(id) });
const byId = new Map(SAMPLE_RECIPES.map((r) => [r.id, r]));
const recipe = (id: string) => byId.get(id)!;

function detail(r: SampleRecipe): RecipeDetail {
  return {
    id: r.id,
    name: r.name,
    method: r.method,
    zeroProof: isZeroProof(r),
    ...(r.steps ? { steps: r.steps } : {}),
    ...(r.source ? { source: r.source } : {}),
    lines: r.lines.map((l) => ({
      ingredient: ref(l.ingredient),
      label: l.label ?? nameOf(l.ingredient),
      ...(l.amount ? { amount: l.amount } : {}),
      ...(l.text ? { text: l.text } : {}),
    })),
  };
}
const summary = (r: SampleRecipe) => ({
  id: r.id,
  name: r.name,
  method: r.method,
  zeroProof: isZeroProof(r),
});

/** The example bar in the "buy next" table: gin, bourbon, sweet vermouth, Angostura and the usual. */
const EXAMPLE_BAR = ["london-dry-gin", "bourbon", "sweet-vermouth", "angostura"];

const landing = {
  bottles: DEMO_BOTTLES.map((id) => ({
    ...ref(id),
    zeroProof: SAMPLE_NODES.find((n) => n.id === id)?.abv === 0,
  })),
  basics: BASICS.map(ref),
  featured: ["negroni", "old-fashioned", "margarita", "zero-proof-gin-buck"].map((id) =>
    detail(recipe(id)),
  ),
  daiquiri: detail(recipe("daiquiri")),
  ginBucks: ["gin-buck", "zero-proof-gin-buck"].map((id) => detail(recipe(id))),
  buyNext: {
    bar: EXAMPLE_BAR.map(nameOf),
    rows: buyNext(tax, [...EXAMPLE_BAR, ...BASICS, ...ALWAYS], SAMPLE_RECIPES)
      .slice(0, 4)
      .map((b) => ({
        ingredient: ref(b.ingredient.id),
        count: b.unlocks.length,
        recipes: b.unlocks.map((r) => r.name),
      })),
  },
};

export function landingRoutes(app: FastifyInstance) {
  const r = app.withTypeProvider<ZodTypeProvider>();

  r.get(
    "/landing",
    { schema: { operationId: "getLanding", response: { 200: LandingResponse } } },
    async () => landing,
  );

  r.get(
    "/demo",
    {
      schema: {
        operationId: "getDemo",
        querystring: DemoQuery,
        response: { 200: DemoResult, 400: ErrorBody },
      },
    },
    async (req, reply) => {
      const bottles = [req.query.bottle ?? []].flat();
      if (bottles.some((b) => !DEMO_BOTTLES.includes(b)))
        return reply.code(400).send({ error: "unknown_bottle" });
      const bar = [...bottles, ...(req.query.basics === "false" ? [] : BASICS), ...ALWAYS];
      const recipes =
        req.query.zero === "true" ? SAMPLE_RECIPES.filter(isZeroProof) : SAMPLE_RECIPES;
      return {
        makeNow: makeNow(tax, bar, recipes).map(({ recipe: rc, swaps }) => ({
          ...summary(rc),
          swaps: swaps.map((s) => ({ for: nameOf(s.line.ingredient), using: nameOf(s.using) })),
        })),
        oneAway: oneAway(tax, bar, recipes).map(({ recipe: rc, missing }) => ({
          ...summary(rc),
          missing: ref(missing.ingredient),
        })),
      };
    },
  );
}
