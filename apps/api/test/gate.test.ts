import { z } from "zod";
import { describe, expect, it } from "vitest";
import type { Pool } from "@stirred/db";
import { buildApp } from "../src/app.ts";

const WEB = "http://127.0.0.1:3300";
const neverConnects = {} as Pool;

function appWithProbe() {
  const app = buildApp({ pool: neverConnects, publicOrigin: WEB });
  app.post("/probe", async () => ({ ok: true }));
  app.get(
    "/wrong-shape",
    { schema: { response: { 200: z.object({ n: z.number() }) } } },
    async () => ({ n: "x" }) as never,
  );
  return app;
}
const json = { "content-type": "application/json" };

describe("mutating-route gate", () => {
  it.each(["POST", "PUT", "PATCH", "DELETE"] as const)(
    "refuses %s without a JSON body type (415)",
    async (method) => {
      const res = await appWithProbe().inject({
        method,
        url: "/probe",
        headers: { "content-type": "text/plain" },
        payload: "x",
      });
      expect(res.statusCode).toBe(415);
    },
  );

  it("refuses a foreign Origin (403) and accepts the web origin or none", async () => {
    const app = appWithProbe();
    const send = (origin?: string) =>
      app.inject({
        method: "POST",
        url: "/probe",
        headers: origin ? { ...json, origin } : json,
        payload: "{}",
      });
    expect((await send("https://evil.example")).statusCode).toBe(403);
    expect((await send(WEB)).statusCode).toBe(200);
    expect((await send()).statusCode).toBe(200);
  });

  it("never gates GET", async () => {
    const res = await appWithProbe().inject({
      method: "GET",
      url: "/wrong-shape",
      headers: { origin: "https://evil.example" },
    });
    expect(res.statusCode).not.toBe(403);
  });
});

describe("response validation", () => {
  it("fails a response that does not match its schema instead of sending it", async () => {
    const res = await appWithProbe().inject({ method: "GET", url: "/wrong-shape" });
    expect(res.statusCode).toBe(500);
    expect(res.body).not.toContain('"x"');
  });
});
