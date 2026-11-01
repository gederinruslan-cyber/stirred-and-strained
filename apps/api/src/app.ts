import Fastify from "fastify";
import type { Pool } from "@stirred/db";

export function buildApp({ pool }: { pool: Pool }) {
  const app = Fastify({ logger: false });

  app.get("/health", async (_req, reply) => {
    try {
      await pool.query("select 1");
      return { status: "ok", db: "up" };
    } catch {
      return reply.code(503).send({ status: "degraded", db: "down" });
    }
  });

  return app;
}
