// The landing page's data and demo: the engine over the house library. No user data; read-only.
import { buyNext, makeNow, oneAway } from "@stirred/engine";
import { DemoQuery, DemoResult, ErrorBody, LandingQuery, LandingResponse } from "@stirred/schema";
import type { FastifyInstance } from "fastify";
import type { ZodTypeProvider } from "fastify-type-provider-zod";
import { detail, nameOf, ref, type Library } from "./recipes/library.ts";

/** The demo's chips, in display order. */
const DEMO_BOTTLES = [
  "gin",
  "bourbon-whiskey",
  "rye-whiskey",
  "light-rum",
  "tequila-blanco",
  "sweet-vermouth",
  "dry-vermouth",
  "campari",
  "triple-sec",
  "angostura-aromatic-bitters",
  "ginger-beer",
  "grenadine-syrup",
];
/** "Plus the usual": lemons, limes, sugar, syrup, soda water. Water is always assumed. */
const BASICS = ["lemon-juice", "lime-juice", "sugar", "simple-syrup", "club-soda"];
const ALWAYS = ["water"];
const FEATURED = ["negroni", "old-fashioned", "margarita", "john-collins"];
/** The example bar in the "buy next" table: gin, bourbon, sweet vermouth, Angostura and the usual. */
const EXAMPLE_BAR = ["gin", "bourbon-whiskey", "sweet-vermouth", "angostura-aromatic-bitters"];

export function landingRoutes(app: FastifyInstance, lib: Library) {
  for (const id of [...DEMO_BOTTLES, ...BASICS, ...ALWAYS, ...EXAMPLE_BAR]) {
    if (!lib.tax.nodes.has(id)) throw new Error(`the house library has no ingredient "${id}"`);
  }
  const recipe = (id: string) => {
    const r = lib.byId.get(id);
    if (!r) throw new Error(`the house library has no recipe "${id}"`);
    return r;
  };
  const featured = FEATURED.map(recipe);
  const daiquiri = recipe("daiquiri");

  const bottles = DEMO_BOTTLES.map((id) => ref(lib, id));
  const basics = BASICS.map((id) => ref(lib, id));
  const buyNextTable = {
    bar: EXAMPLE_BAR.map((id) => nameOf(lib, id)),
    rows: buyNext(lib.tax, [...EXAMPLE_BAR, ...BASICS, ...ALWAYS], lib.recipes)
      .slice(0, 4)
      .map((b) => ({
        ingredient: ref(lib, b.ingredient.id),
        count: b.unlocks.length,
        recipes: b.unlocks.map((r) => r.name),
      })),
  };

  const r = app.withTypeProvider<ZodTypeProvider>();

  r.get(
    "/landing",
    {
      schema: {
        operationId: "getLanding",
        querystring: LandingQuery,
        response: { 200: LandingResponse },
      },
    },
    async (req) => {
      const country = req.query.country;
      return {
        bottles,
        basics,
        featured: featured.map((rc) => detail(lib, rc, country)),
        daiquiri: detail(lib, daiquiri, country),
        buyNext: buyNextTable,
      };
    },
  );

  // The demo lists IBA classics first, then the engine's order (name, then id).
  const iba = (rc: (typeof lib.recipes)[number]) => (rc.source.includes("iba-world.com") ? 0 : 1);
  const classicsFirst = <T extends { recipe: (typeof lib.recipes)[number] }>(rows: T[]) =>
    rows
      .map((row, i) => ({ row, i }))
      .sort((a, b) => iba(a.row.recipe) - iba(b.row.recipe) || a.i - b.i)
      .map((x) => x.row);

  const demoRecipe = (rc: (typeof lib.recipes)[number]) => ({
    id: rc.id,
    name: rc.name,
    method: rc.method,
  });

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
      const chosen = [req.query.bottle ?? []].flat();
      if (chosen.some((b) => !DEMO_BOTTLES.includes(b)))
        return reply.code(400).send({ error: "unknown_bottle" });
      const bar = [...chosen, ...(req.query.basics === "false" ? [] : BASICS), ...ALWAYS];
      return {
        makeNow: classicsFirst(makeNow(lib.tax, bar, lib.recipes)).map(({ recipe: rc, swaps }) => ({
          ...demoRecipe(rc),
          swaps: swaps.map((s) => ({
            for: nameOf(lib, s.line.ingredient),
            using: nameOf(lib, s.using),
          })),
        })),
        oneAway: classicsFirst(oneAway(lib.tax, bar, lib.recipes)).map(
          ({ recipe: rc, missing }) => ({
            ...demoRecipe(rc),
            missing: ref(lib, missing.ingredient),
          }),
        ),
      };
    },
  );
}
