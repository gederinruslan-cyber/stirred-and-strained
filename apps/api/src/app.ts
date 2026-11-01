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
import { landingRoutes } from "./landing.ts";
import { legalRoutes } from "./legal/routes.ts";

const MUTATING = new Set(["POST", "PUT", "PATCH", "DELETE"]);

export type AppOptions = {
  pool: Pool;
  /** The web origin; the only Origin a mutating request may carry. */
  publicOrigin: string;
};

export function buildApp({ pool, publicOrigin }: AppOptions) {
  const app = Fastify({ logger: false }).withTypeProvider<ZodTypeProvider>();
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
    landingRoutes(routes);
    legalRoutes(routes);
  });

  return app;
}
