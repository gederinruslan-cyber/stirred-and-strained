// My Bar (M2-03): list, add, remove the ingredients a signed-in user keeps. Every query runs
// scoped to that user (ADR 0003); an item the user does not keep answers 404.
import { addToBar, createDb, listBar, removeFromBar, withUser, type Pool } from "@stirred/db";
import { BarAddBody, BarItemParams, BarResponse, ErrorBody } from "@stirred/schema";
import type { FastifyInstance, FastifyReply } from "fastify";
import type { ZodTypeProvider } from "fastify-type-provider-zod";
import { z } from "zod";
import { requestUser } from "../auth/routes.ts";
import { entry } from "../ingredients.ts";
import type { Library } from "../recipes/library.ts";

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
}
