import { describe, expect, it } from "vitest";
import type { Pool } from "@stirred/db";
import { buildApp } from "../src/app.ts";

const app = buildApp({ pool: {} as Pool, publicOrigin: "http://127.0.0.1:3300" });
const get = async (url: string) => {
  const res = await app.inject({ method: "GET", url });
  return { status: res.statusCode, body: res.json() };
};
const names = (rs: { name: string }[]) => rs.map((r) => r.name);

describe("GET /demo", () => {
  it("runs the default demo bar on the engine", async () => {
    const { status, body } = await get(
      "/demo?bottle=london-dry-gin&bottle=sweet-vermouth&bottle=bitter-aperitivo&basics=true",
    );
    expect(status).toBe(200);
    expect(names(body.makeNow)).toEqual(
      expect.arrayContaining(["Negroni", "Americano", "Gimlet", "Tom Collins"]),
    );
    expect(body.oneAway).toContainEqual(
      expect.objectContaining({
        name: "Boulevardier",
        missing: { id: "bourbon", name: "Bourbon" },
      }),
    );
  });

  it("names the swaps a recipe relies on", async () => {
    const { body } = await get(
      "/demo?bottle=rye&bottle=sweet-vermouth&bottle=bitter-aperitivo&basics=false",
    );
    expect(body.makeNow).toContainEqual(
      expect.objectContaining({
        name: "Boulevardier",
        swaps: [{ for: "Bourbon", using: "Rye whiskey" }],
      }),
    );
  });

  it("lists only zero-proof recipes in zero-proof mode", async () => {
    const { body } = await get(
      "/demo?bottle=zero-proof-gin&bottle=london-dry-gin&basics=true&zero=true",
    );
    expect(names(body.makeNow)).toEqual(["Zero-proof Gin Sour"]);
    expect(body.makeNow.every((r: { zeroProof: boolean }) => r.zeroProof)).toBe(true);
  });

  it("answers an empty demo with empty lists, and an unknown bottle with 400", async () => {
    expect((await get("/demo?basics=false")).body).toEqual({ makeNow: [], oneAway: [] });
    expect((await get("/demo?bottle=unicorn-tears")).status).toBe(400);
  });
});

describe("GET /landing", () => {
  it("serves the chips, featured recipes and the buy-next example from the sample library", async () => {
    const { status, body } = await get("/landing");
    expect(status).toBe(200);
    expect(body.bottles).toHaveLength(12);
    expect(names(body.featured)).toEqual([
      "Negroni",
      "Old Fashioned",
      "Margarita",
      "Zero-proof Gin Buck",
    ]);
    expect(body.featured[0].lines[0]).toEqual({
      ingredient: { id: "gin", name: "Gin" },
      label: "London dry gin",
      amount: { value: 30, unit: "ml" },
    });
    expect(body.featured[3].zeroProof).toBe(true);
    expect(body.daiquiri.name).toBe("Daiquiri");
    expect(names(body.ginBucks)).toEqual(["Gin Buck", "Zero-proof Gin Buck"]);
    expect(body.buyNext.rows.length).toBeLessThanOrEqual(4);
    expect(body.buyNext.rows[0].count).toBeGreaterThanOrEqual(body.buyNext.rows.at(-1).count);
  });
});
