// Export and erase (M2-08): everything a signed-in user owns, as JSON or Markdown, and its
// removal after the password and an explicit tick. Every query runs scoped (ADR 0003).
import {
  createDb,
  eraseUser,
  exportUser,
  findUser,
  userEmail,
  withUser,
  type Pool,
} from "@stirred/db";
import { AccountExport, EraseBody, ErrorBody } from "@stirred/schema";
import type { FastifyInstance, FastifyReply } from "fastify";
import type { ZodTypeProvider } from "fastify-type-provider-zod";
import { z } from "zod";
import { rateLimiter } from "../auth/limiter.ts";
import { verifyPassword } from "../auth/password.ts";
import { requestUser } from "../auth/routes.ts";
import type { Library } from "../recipes/library.ts";
import { exportFor } from "./export.ts";
import { markdown } from "./markdown.ts";

const signedOut = (reply: FastifyReply) => reply.code(401).send({ error: "signed_out" });

export function accountRoutes(app: FastifyInstance, { pool, lib }: { pool: Pool; lib: Library }) {
  const db = createDb(pool);
  const r = app.withTypeProvider<ZodTypeProvider>();
  // Per signed-in user: a stolen session cannot guess the password through erase.
  const guesses = rateLimiter(10, 15 * 60_000);
  const load = async (userId: string) => exportFor(lib, await withUser(db, userId, exportUser));

  r.get(
    "/account/export",
    {
      schema: {
        operationId: "exportAccount",
        response: { 200: AccountExport, 401: ErrorBody },
      },
    },
    async (req, reply) => {
      const userId = await requestUser(db, req);
      if (!userId) return signedOut(reply);
      return load(userId);
    },
  );

  r.get(
    "/account/export/markdown",
    {
      schema: {
        operationId: "exportAccountMarkdown",
        produces: ["text/markdown"],
        response: { 200: z.string(), 401: ErrorBody },
      },
    },
    async (req, reply) => {
      const userId = await requestUser(db, req);
      if (!userId) return signedOut(reply);
      return reply.type("text/markdown; charset=utf-8").send(markdown(await load(userId)));
    },
  );

  r.post(
    "/account/erase",
    {
      schema: {
        operationId: "eraseAccount",
        body: EraseBody,
        response: { 204: z.null(), 400: ErrorBody, 401: ErrorBody, 429: ErrorBody },
      },
    },
    async (req, reply) => {
      const userId = await requestUser(db, req);
      if (!userId) return signedOut(reply);
      if (!guesses(userId)) return reply.code(429).send({ error: "rate_limited" });
      const email = await withUser(db, userId, userEmail);
      const user = email ? await findUser(db, email) : null;
      if (!user || !(await verifyPassword(req.body.password, user.passwordHash))) {
        return reply.code(401).send({ error: "invalid_credentials" });
      }
      await withUser(db, userId, eraseUser);
      return reply.code(204).send(null);
    },
  );
}
