import { describe, expect, it } from "vitest";
import type { Pool } from "@stirred/db";
import { buildApp } from "../src/app.ts";
import { house } from "./house.ts";

const app = buildApp({ pool: {} as Pool, publicOrigin: "http://127.0.0.1:3300", library: house });
const get = async (url: string) => {
  const res = await app.inject({ method: "GET", url });
  return { status: res.statusCode, body: res.json() };
};
const names = (rs: { name: string }[]) => rs.map((r) => r.name);

describe("GET /demo", () => {
  it("runs the default shelf on the engine over the house library", async () => {
    const { status, body } = await get(
      "/demo?bottle=gin&bottle=sweet-vermouth&bottle=campari&basics=true",
    );
    expect(status).toBe(200);
    // IBA classics first, then by name.
    expect(names(body.makeNow).slice(0, 3)).toEqual(["Americano", "John Collins", "Negroni"]);
    expect(body.oneAway[0]).toEqual(
      expect.objectContaining({
        name: "Boulevardier",
        missing: { id: "bourbon-whiskey", name: "Bourbon Whiskey" },
      }),
    );
  });

  it("makes a Daiquiri from light rum and the usual", async () => {
    const { body } = await get("/demo?bottle=light-rum&basics=true");
    expect(names(body.makeNow)).toContain("Daiquiri");
  });

  it("lists only zero-proof recipes in zero-proof mode", async () => {
    const { body } = await get(
      "/demo?bottle=ginger-beer&bottle=grenadine-syrup&bottle=gin&basics=true&zero=true",
    );
    expect(names(body.makeNow)).toContain("Shirley Temple");
    expect(body.makeNow.every((r: { zeroProof: boolean }) => r.zeroProof)).toBe(true);
  });

  it("answers an empty demo with empty lists, and an unknown bottle with 400", async () => {
    expect((await get("/demo?basics=false")).body).toEqual({ makeNow: [], oneAway: [] });
    expect((await get("/demo?bottle=unicorn-tears")).status).toBe(400);
  });
});

describe("GET /landing", () => {
  it("serves house recipes with provenance and strength for the visitor's country", async () => {
    const { status, body } = await get("/landing?country=US");
    expect(status).toBe(200);
    expect(body.bottles).toHaveLength(12);
    expect(names(body.featured)).toEqual([
      "Negroni",
      "Old Fashioned",
      "Margarita",
      "Temperance Grapefruit Collins",
    ]);
    expect(body.featured[3]).toMatchObject({ zeroProof: true, strength: { abv: 0 } });
    expect(body.featured[0].credit).toBe("Spec via iba-world.com");
    expect(body.featured[0].strength.drinks.measure).toBe("standard drinks");
    expect(body.daiquiri.name).toBe("Daiquiri");
    expect(names(body.zeroBand)).toEqual(["Shirley Temple", "Neruda"]);
    expect(body.zeroBand.every((r: { zeroProof: boolean }) => r.zeroProof)).toBe(true);
    expect(body.buyNext.rows.length).toBe(4);
    expect(body.buyNext.rows[0].count).toBeGreaterThanOrEqual(body.buyNext.rows.at(-1).count);
  });
});
