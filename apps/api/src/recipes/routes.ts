// House recipes: list and get, with provenance and derived strength. Read-only, no user data.
import {
  ErrorBody,
  RecipeDetail,
  RecipeList,
  RecipeListQuery,
  RecipeParams,
  RecipeQuery,
} from "@stirred/schema";
import type { FastifyInstance } from "fastify";
import type { ZodTypeProvider } from "fastify-type-provider-zod";
import { detail, summary, type Library } from "./library.ts";

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
    async (req) => {
      const { page, pageSize } = req.query;
      const start = (page - 1) * pageSize;
      return {
        items: lib.recipes.slice(start, start + pageSize).map((rc) => summary(lib, rc)),
        page,
        pageSize,
        total: lib.recipes.length,
      };
    },
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
