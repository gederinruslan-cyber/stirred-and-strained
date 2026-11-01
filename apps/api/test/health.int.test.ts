import { afterAll, describe, expect, it } from "vitest";
import { createPool } from "@stirred/db";
import { buildApp } from "../src/app.ts";

const url = process.env.DATABASE_URL;
if (!url) throw new Error("DATABASE_URL is required for integration tests");

describe("GET /health", () => {
  const up = createPool(url);
  // A port nothing listens on: the database is unreachable.
  const down = createPool("postgres://nobody:nothing@127.0.0.1:1/none");
  afterAll(async () => {
    await Promise.all([up.end(), down.end()]);
  });

  it("answers 200 with db up when Postgres is reachable", async () => {
    const res = await buildApp({ pool: up }).inject({ method: "GET", url: "/health" });
    expect(res.statusCode).toBe(200);
    expect(res.json()).toEqual({ status: "ok", db: "up" });
  });

  it("answers 503 with db down, and no connection details, when Postgres is unreachable", async () => {
    const res = await buildApp({ pool: down }).inject({ method: "GET", url: "/health" });
    expect(res.statusCode).toBe(503);
    expect(res.json()).toEqual({ status: "degraded", db: "down" });
  });
});
