import { describe, expect, it } from "vitest";
import type { Pool } from "@stirred/db";
import { buildApp } from "../src/app.ts";
import { detail, loadLibrary } from "../src/recipes/library.ts";
import { house } from "./house.ts";

const app = buildApp({ pool: {} as Pool, publicOrigin: "http://127.0.0.1:3300", library: house });
const get = async (url: string) => {
  const res = await app.inject({ method: "GET", url });
  return { status: res.statusCode, body: res.json() };
};

describe("GET /recipes/:id", () => {
  it("serves a recipe with its lines, provenance and derived strength", async () => {
    const { status, body } = await get("/recipes/negroni?country=US");
    expect(status).toBe(200);
    expect(body.lines.map((l: { ingredient: { id: string } }) => l.ingredient.id)).toEqual([
      "gin",
      "campari",
      "sweet-vermouth",
    ]);
    expect(body.lines[0]).toEqual({
      ingredient: { id: "gin", name: "Gin" },
      amount: { value: 30, unit: "ml" },
      optional: false,
    });
    expect(body).toMatchObject({ method: "built", credit: "Spec via iba-world.com" });
    expect(body.source).toMatch(/^https:\/\/iba-world\.com\//);
    expect(body.licence).toBeTruthy();
    // 30 ml each at 40%, 25% and 18%, built = stirred dilution (ADR 0004): 24.9 ml ethanol, 19.7 g.
    expect(body.strength.abv).toBeCloseTo(19.8, 1);
    expect(body.strength.drinks).toMatchObject({ measure: "standard drinks" });
    expect(body.strength.drinks.value).toBeCloseTo(1.4, 2);
  });

  it("counts UK units in the UK and grams where no standard drink is known", async () => {
    const uk = (await get("/recipes/negroni?country=GB")).body.strength.drinks;
    expect(uk.measure).toBe("units");
    expect(uk.value).toBeCloseTo(2.49, 2);
    expect((await get("/recipes/negroni")).body.strength.drinks.measure).toBe("grams");
  });

  it("answers an unknown recipe with 404", async () => {
    expect(await get("/recipes/no-such-drink")).toEqual({
      status: 404,
      body: { error: "not_found" },
    });
  });
});

describe("GET /recipes", () => {
  it("pages through every house recipe, ordered by name then id", async () => {
    const { status, body } = await get("/recipes?page=2&pageSize=24");
    expect(status).toBe(200);
    expect(body).toMatchObject({ page: 2, pageSize: 24, total: house.recipes.length });
    expect(body.items).toHaveLength(24);
    expect(body.items[0].id).toBe(house.recipes[24]!.id);
    expect((await get("/recipes?pageSize=101")).status).toBe(400);
    expect((await get("/recipes?page=0")).status).toBe(400);
  });
});

describe("every house recipe", () => {
  it("has a derived strength, and a zero-proof one is 0% and 0 drinks", () => {
    for (const r of house.recipes) {
      const d = detail(house, r, "US");
      expect(Number.isFinite(d.strength.abv), r.id).toBe(true);
      if (d.zeroProof) expect([d.strength.abv, d.strength.drinks.value], r.id).toEqual([0, 0]);
    }
    expect(detail(house, house.byId.get("shirley-temple")!).zeroProof).toBe(true);
  });
});

describe("start-up", () => {
  it("refuses an unseeded database and says to run the seed", async () => {
    const empty = { query: async () => ({ rows: [], fields: [] }) } as unknown as Pool;
    await expect(loadLibrary(empty)).rejects.toThrow("run `pnpm db:seed`");
  });
});
