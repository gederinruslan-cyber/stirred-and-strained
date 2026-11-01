// My Bar (M2-03): list, add, remove the ingredients a signed-in user keeps. Every query runs
// scoped to that user (ADR 0003); an item the user does not keep answers 404. What it makes
// (M2-04) is the engine over that bar, or over a signed-out shelf's ids. House swaps (M2-05)
// count until the signed-in user turns one off; a signed-out shelf gets them all.
import {
  addToBar,
  createDb,
  listBar,
  listRefusals,
  removeFromBar,
  setSwapAllowed,
  withUser,
  type Pool,
} from "@stirred/db";
import { buyNext, makeNow, oneAway, refuse, type Taxonomy } from "@stirred/engine";
import {
  BarAddBody,
  BarItemParams,
  BarMatches,
  BarResponse,
  ErrorBody,
  ShelfMatchesQuery,
  SubstitutionList,
  SwapBody,
  SwapParams,
} from "@stirred/schema";
import type { FastifyInstance, FastifyReply } from "fastify";
import type { ZodTypeProvider } from "fastify-type-provider-zod";
import { z } from "zod";
import { requestUser } from "../auth/routes.ts";
import { entry } from "../ingredients.ts";
import { nameOf, ref, summary, type Library, type Spec } from "../recipes/library.ts";
import { liveRecipes } from "../recipes/mine.ts";

/** Water is always assumed, as in the landing demo. */
const ALWAYS = ["water"];
const BUY_NEXT = 10;

/** The engine over a bar; `own` adds a signed-in user's recipes (M2-06) to the house ones. */
function matches(
  lib: Library,
  ids: string[],
  tax: Taxonomy = lib.tax,
  own: readonly Spec[] = [],
): BarMatches {
  if (ids.length === 0) return { makeNow: [], oneAway: [], buyNext: [] };
  const bar = [...ids, ...ALWAYS];
  const recipes: readonly Spec[] = own.length === 0 ? lib.recipes : [...lib.recipes, ...own];
  const used = (swaps: { line: { ingredient: string }; using: string }[]) =>
    swaps.map((s) => ({ for: nameOf(lib, s.line.ingredient), using: nameOf(lib, s.using) }));
  return {
    makeNow: makeNow(tax, bar, recipes).map(({ recipe, swaps }) => ({
      ...summary(lib, recipe),
      swaps: used(swaps),
    })),
    oneAway: oneAway(tax, bar, recipes).map(({ recipe, missing, swaps }) => ({
      id: recipe.id,
      name: recipe.name,
      method: recipe.method,
      ...(recipe.glass ? { glass: summary(lib, recipe).glass } : {}),
      ...(recipe.yours ? { yours: true as const } : {}),
      missing: ref(lib, missing.ingredient),
      swaps: used(swaps),
    })),
    buyNext: buyNext(tax, bar, recipes)
      .slice(0, BUY_NEXT)
      .map((b) => ({
        ingredient: ref(lib, b.ingredient.id),
        count: b.unlocks.length,
        recipes: b.unlocks.map((r) => ({
          id: r.id,
          name: r.name,
          ...(r.yours ? { yours: true as const } : {}),
        })),
      })),
  };
}

export function barRoutes(app: FastifyInstance, { pool, lib }: { pool: Pool; lib: Library }) {
  const db = createDb(pool);
  const r = app.withTypeProvider<ZodTypeProvider>();
  const signedOut = (reply: FastifyReply) => reply.code(401).send({ error: "signed_out" });
  const bar = (ids: string[]) => ({
    items: ids
      .filter((id) => lib.tax.nodes.has(id))
      .map((id) => entry(lib, id))
      .sort((a, b) => a.name.localeCompare(b.name)),
  });

  r.get(
    "/bar",
    { schema: { operationId: "getBar", response: { 200: BarResponse, 401: ErrorBody } } },
    async (req, reply) => {
      const userId = await requestUser(db, req);
      if (!userId) return signedOut(reply);
      return bar(await withUser(db, userId, listBar));
    },
  );

  r.get(
    "/bar/matches",
    {
      schema: {
        operationId: "getBarMatches",
        response: { 200: BarMatches, 401: ErrorBody },
      },
    },
    async (req, reply) => {
      const userId = await requestUser(db, req);
      if (!userId) return signedOut(reply);
      const [ids, refused] = await withUser(db, userId, (s) =>
        Promise.all([listBar(s), listRefusals(s)]),
      );
      return matches(
        lib,
        ids.filter((id) => lib.tax.nodes.has(id)),
        refuse(lib.tax, refused),
        await liveRecipes(db, userId),
      );
    },
  );

  r.get(
    "/shelf/matches",
    {
      schema: {
        operationId: "getShelfMatches",
        querystring: ShelfMatchesQuery,
        response: { 200: BarMatches, 400: ErrorBody },
      },
    },
    async (req, reply) => {
      const ids = [...new Set([req.query.ingredient ?? []].flat())];
      if (ids.some((id) => !lib.tax.nodes.has(id))) {
        return reply.code(400).send({ error: "unknown_ingredient" });
      }
      return matches(lib, ids);
    },
  );

  r.post(
    "/bar/items",
    {
      schema: {
        operationId: "addToBar",
        body: BarAddBody,
        response: { 200: BarResponse, 400: ErrorBody, 401: ErrorBody },
      },
    },
    async (req, reply) => {
      const userId = await requestUser(db, req);
      if (!userId) return signedOut(reply);
      const ids = [...new Set(req.body.ingredients)];
      if (ids.some((id) => !lib.tax.nodes.has(id))) {
        return reply.code(400).send({ error: "unknown_ingredient" });
      }
      return bar(
        await withUser(db, userId, async (s) => {
          await addToBar(s, ids);
          return listBar(s);
        }),
      );
    },
  );

  r.delete(
    "/bar/items/:ingredientId",
    {
      schema: {
        operationId: "removeFromBar",
        params: BarItemParams,
        response: { 204: z.null(), 401: ErrorBody, 404: ErrorBody },
      },
    },
    async (req, reply) => {
      const userId = await requestUser(db, req);
      if (!userId) return signedOut(reply);
      const removed = await withUser(db, userId, (s) => removeFromBar(s, req.params.ingredientId));
      if (removed === 0) return reply.code(404).send({ error: "not_found" });
      return reply.code(204).send(null);
    },
  );

  r.get(
    "/substitutions",
    { schema: { operationId: "listSubstitutions", response: { 200: SubstitutionList } } },
    async (req) => {
      const userId = await requestUser(db, req);
      const refused = userId ? await withUser(db, userId, listRefusals) : [];
      const off = new Set(refused.map((e) => `${e.substitute}>${e.replaces}`));
      return {
        items: lib.substitutions
          .map((e) => ({
            substitute: ref(lib, e.substitute),
            replaces: ref(lib, e.replaces),
            reason: e.reason,
            allowed: !off.has(`${e.substitute}>${e.replaces}`),
          }))
          .sort(
            (a, b) =>
              a.replaces.name.localeCompare(b.replaces.name) ||
              a.substitute.name.localeCompare(b.substitute.name),
          ),
      };
    },
  );

  r.put(
    "/substitutions/:substitute/:replaces",
    {
      schema: {
        operationId: "setSubstitution",
        params: SwapParams,
        body: SwapBody,
        response: { 204: z.null(), 401: ErrorBody, 404: ErrorBody },
      },
    },
    async (req, reply) => {
      const userId = await requestUser(db, req);
      if (!userId) return signedOut(reply);
      const found = await withUser(db, userId, (s) =>
        setSwapAllowed(s, req.params, req.body.allowed),
      );
      if (!found) return reply.code(404).send({ error: "not_found" });
      return reply.code(204).send(null);
    },
  );
}
