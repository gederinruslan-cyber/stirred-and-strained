// House recipes: list and get, with provenance and derived strength. Read-only; a signed-in
// search also finds the caller's own recipes (M2-06).
import { createDb, type Pool } from "@stirred/db";
import {
  ErrorBody,
  IngredientList,
  IngredientQuery,
  RecipeDetail,
  RecipeList,
  RecipeListQuery,
  RecipeParams,
  RecipeQuery,
} from "@stirred/schema";
import type { FastifyInstance } from "fastify";
import type { ZodTypeProvider } from "fastify-type-provider-zod";
import { requestUser } from "../auth/routes.ts";
import { entry, suggest } from "../ingredients.ts";
import { detail, summary, type Library } from "./library.ts";
import { liveRecipes } from "./mine.ts";
import { search } from "./search.ts";

const many = (v: string | string[] | undefined) => [v ?? []].flat();

export function recipeRoutes(app: FastifyInstance, { pool, lib }: { pool: Pool; lib: Library }) {
  const db = createDb(pool);
  const r = app.withTypeProvider<ZodTypeProvider>();

  r.get(
    "/recipes",
    {
      schema: {
        operationId: "listRecipes",
        querystring: RecipeListQuery,
        response: { 200: RecipeList, 400: ErrorBody },
      },
    },
    async (req, reply) => {
      const { page, pageSize, q, abvMin, abvMax } = req.query;
      const include = many(req.query.include);
      const exclude = many(req.query.exclude);
      if ([...include, ...exclude].some((id) => !lib.tax.nodes.has(id)))
        return reply.code(400).send({ error: "unknown_ingredient" });
      const own = req.headers.authorization
        ? await liveRecipes(db, await requestUser(db, req))
        : [];
      const { rows, facets } = search(
        lib,
        {
          ...(q ? { q } : {}),
          include,
          exclude,
          base: many(req.query.base),
          method: many(req.query.method),
          glass: many(req.query.glass),
          family: many(req.query.family),
          flavour: many(req.query.flavour),
          ...(abvMin === undefined ? {} : { abvMin }),
          ...(abvMax === undefined ? {} : { abvMax }),
        },
        own,
      );
      const start = (page - 1) * pageSize;
      return {
        items: rows.slice(start, start + pageSize).map((e) => ({
          ...summary(lib, e.r),
          ...(e.family[0] ? { family: e.family[0] } : {}),
        })),
        page,
        pageSize,
        total: rows.length,
        facets,
      };
    },
  );

  const ingredients = [...lib.tax.nodes.values()]
    .sort((a, b) => a.name.localeCompare(b.name) || (a.id < b.id ? -1 : 1))
    .map((n) => entry(lib, n.id));
  r.get(
    "/ingredients",
    {
      schema: {
        operationId: "listIngredients",
        querystring: IngredientQuery,
        response: { 200: IngredientList },
      },
    },
    async (req) => ({ items: req.query.q ? suggest(lib, req.query.q) : ingredients }),
  );

  r.get(
    "/recipes/:id",
    {
      schema: {
        operationId: "getRecipe",
        params: RecipeParams,
        querystring: RecipeQuery,
        response: { 200: RecipeDetail, 404: ErrorBody },
      },
    },
    async (req, reply) => {
      const rc = lib.byId.get(req.params.id);
      if (!rc) return reply.code(404).send({ error: "not_found" });
      return detail(lib, rc, req.query.country);
    },
  );
}
