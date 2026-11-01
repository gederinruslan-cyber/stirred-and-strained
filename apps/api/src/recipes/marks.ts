// Favourites, ratings and notes (M2-07): a signed-in user's own, on a house recipe or one of
// their own recipes. Scoped (ADR 0003); another user's recipe id answers 404. Notes are private
// plain text and never logged; a changed or cleared note can be put back.
import {
  canMark,
  createDb,
  getMark,
  listMarks,
  setMark,
  undoNote,
  withUser,
  type MarkRef,
  type Pool,
} from "@stirred/db";
import { ErrorBody, Mark, MarkList, MarkParams, MarkPatch, MarkSaved } from "@stirred/schema";
import type { FastifyInstance, FastifyReply } from "fastify";
import type { ZodTypeProvider } from "fastify-type-provider-zod";
import { z } from "zod";
import { requestUser } from "../auth/routes.ts";
import { summary, type Library } from "./library.ts";
import { liveRecipes } from "./mine.ts";

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/** A house recipe first, then one of the user's own; null for anything else. */
const refOf = (lib: Library, id: string): MarkRef | null =>
  lib.byId.has(id) ? { house: id } : UUID.test(id) ? { own: id.toLowerCase() } : null;

const shown = (m: { favourite: boolean; rating: number | null; note: string | null }): Mark => ({
  favourite: m.favourite,
  ...(m.rating !== null ? { rating: m.rating } : {}),
  ...(m.note !== null ? { note: m.note } : {}),
});

export function markRoutes(app: FastifyInstance, { pool, lib }: { pool: Pool; lib: Library }) {
  const db = createDb(pool);
  const r = app.withTypeProvider<ZodTypeProvider>();
  const signedOut = (reply: FastifyReply) => reply.code(401).send({ error: "signed_out" });
  const notFound = (reply: FastifyReply) => reply.code(404).send({ error: "not_found" });

  r.get(
    "/my/marks",
    { schema: { operationId: "listMyMarks", response: { 200: MarkList, 401: ErrorBody } } },
    async (req, reply) => {
      const userId = await requestUser(db, req);
      if (!userId) return signedOut(reply);
      const [marks, own] = await Promise.all([
        withUser(db, userId, listMarks),
        liveRecipes(db, userId),
      ]);
      const ownById = new Map(own.map((x) => [x.id, x]));
      return {
        items: marks.flatMap((m) => {
          const spec = m.house ? lib.byId.get(m.house) : ownById.get(m.own!);
          return spec ? [{ ...summary(lib, spec), mark: shown(m) }] : [];
        }),
      };
    },
  );

  r.get(
    "/my/marks/:id",
    {
      schema: {
        operationId: "getMyMark",
        params: MarkParams,
        response: { 200: Mark, 401: ErrorBody, 404: ErrorBody },
      },
    },
    async (req, reply) => {
      const userId = await requestUser(db, req);
      if (!userId) return signedOut(reply);
      const ref = refOf(lib, req.params.id);
      if (!ref) return notFound(reply);
      const found = await withUser(db, userId, async (s) =>
        (await canMark(s, ref)) ? ((await getMark(s, ref)) ?? undefined) : null,
      );
      if (found === null) return notFound(reply);
      return found ? shown(found) : { favourite: false };
    },
  );

  r.patch(
    "/my/marks/:id",
    {
      schema: {
        operationId: "updateMyMark",
        params: MarkParams,
        body: MarkPatch,
        response: { 200: MarkSaved, 401: ErrorBody, 404: ErrorBody },
      },
    },
    async (req, reply) => {
      const userId = await requestUser(db, req);
      if (!userId) return signedOut(reply);
      const ref = refOf(lib, req.params.id);
      if (!ref) return notFound(reply);
      const { favourite, rating, note } = req.body;
      const saved = await withUser(db, userId, (s) =>
        setMark(s, ref, {
          ...(favourite === undefined ? {} : { favourite }),
          ...(rating === undefined ? {} : { rating }),
          // Blank is no note.
          ...(note === undefined ? {} : { note: note?.trim() || null }),
        }),
      );
      return saved ?? notFound(reply);
    },
  );

  r.post(
    "/my/marks/:id/undo-note",
    {
      schema: {
        operationId: "undoMyNote",
        params: MarkParams,
        response: { 204: z.null(), 401: ErrorBody, 404: ErrorBody },
      },
    },
    async (req, reply) => {
      const userId = await requestUser(db, req);
      if (!userId) return signedOut(reply);
      const ref = refOf(lib, req.params.id);
      if (!ref) return notFound(reply);
      const undone = await withUser(db, userId, (s) => undoNote(s, ref));
      return undone ? reply.code(204).send(null) : notFound(reply);
    },
  );
}
