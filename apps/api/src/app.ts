import swagger from "@fastify/swagger";
import Fastify from "fastify";
import {
  jsonSchemaTransform,
  serializerCompiler,
  validatorCompiler,
  type ZodTypeProvider,
} from "fastify-type-provider-zod";
import type { Pool } from "@stirred/db";
import { ErrorBody, HealthResponse } from "@stirred/schema";
import { authRoutes } from "./auth/routes.ts";
import { noMailer, type Mailer } from "./auth/mailer.ts";
import { landingRoutes } from "./landing.ts";
import { legalRoutes } from "./legal/routes.ts";
import type { Library } from "./recipes/library.ts";
import { recipeRoutes } from "./recipes/routes.ts";

const MUTATING = new Set(["POST", "PUT", "PATCH", "DELETE"]);

export type AppOptions = {
  pool: Pool;
  /** The web origin; the only Origin a mutating request may carry. */
  publicOrigin: string;
  /** The house library, loaded once at start. */
  library: Library;
  /** Confirm and reset links go out through it (ADR 0005). */
  mailer?: Mailer;
};

export function buildApp({ pool, publicOrigin, library, mailer = noMailer }: AppOptions) {
  // Behind web (one hop): the client address comes from its X-Forwarded-For (rate limits only).
  const app = Fastify({
    logger: false,
    trustProxy: (_address: string, hop: number) => hop === 0,
  }).withTypeProvider<ZodTypeProvider>();
  app.setValidatorCompiler(validatorCompiler);
  // Responses are checked against their schema; a mismatch is a 500, never an unchecked body.
  app.setSerializerCompiler(serializerCompiler);

  // Never echo internals: 5xx bodies are generic.
  app.setErrorHandler((error: { statusCode?: number; code?: string }, _req, reply) => {
    const status = error.statusCode ?? 500;
    return reply
      .code(status)
      .send({ error: status >= 500 ? "internal_error" : (error.code ?? "bad_request") });
  });

  // Every mutating route: the browser's Origin, if any, must be the web's; a body must be JSON.
  app.addHook("onRequest", async (req, reply) => {
    if (!MUTATING.has(req.method)) return;
    const origin = req.headers.origin;
    if (origin !== undefined && origin !== publicOrigin) {
      return reply.code(403).send({ error: "forbidden_origin" });
    }
    const hasBody =
      Number(req.headers["content-length"] ?? 0) > 0 ||
      req.headers["transfer-encoding"] !== undefined;
    const type = req.headers["content-type"]?.split(";")[0]?.trim().toLowerCase();
    if (hasBody && type !== "application/json") {
      return reply.code(415).send({ error: "unsupported_media_type" });
    }
  });

  app.register(swagger, {
    openapi: { openapi: "3.1.0", info: { title: "Stirred & Strained API", version: "0.0.0" } },
    transform: jsonSchemaTransform,
  });

  app.register(async (routes) => {
    const r = routes.withTypeProvider<ZodTypeProvider>();
    r.get(
      "/health",
      {
        schema: {
          operationId: "getHealth",
          response: { 200: HealthResponse, 503: HealthResponse, 500: ErrorBody },
        },
      },
      async (_req, reply) => {
        try {
          await pool.query("select 1");
          return { status: "ok" as const, db: "up" as const };
        } catch {
          return reply.code(503).send({ status: "degraded", db: "down" });
        }
      },
    );
    landingRoutes(routes, library);
    recipeRoutes(routes, library);
    legalRoutes(routes);
    authRoutes(routes, { pool, mailer, publicOrigin });
  });

  return app;
}
