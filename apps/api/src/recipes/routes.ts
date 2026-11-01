// House recipes: list and get, with provenance and derived strength. Read-only, no user data.
import {
  ErrorBody,
  IngredientList,
  RecipeDetail,
  RecipeList,
  RecipeListQuery,
  RecipeParams,
  RecipeQuery,
} from "@stirred/schema";
import type { FastifyInstance } from "fastify";
import type { ZodTypeProvider } from "fastify-type-provider-zod";
import { detail, summary, type Library } from "./library.ts";
import { search } from "./search.ts";

const many = (v: string | string[] | undefined) => [v ?? []].flat();

export function recipeRoutes(app: FastifyInstance, lib: Library) {
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
      const { rows, facets } = search(lib, {
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
        zero: req.query.zero === "true",
      });
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
    .map((n) => ({ id: n.id, name: n.name }))
    .sort((a, b) => a.name.localeCompare(b.name) || (a.id < b.id ? -1 : 1));
  r.get(
    "/ingredients",
    { schema: { operationId: "listIngredients", response: { 200: IngredientList } } },
    async () => ({ items: ingredients }),
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
