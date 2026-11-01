import { describe, expect, it } from "vitest";
import type { Pool } from "@stirred/db";
import { buildApp } from "../src/app.ts";
import { house } from "./house.ts";

const app = buildApp({ pool: {} as Pool, publicOrigin: "http://127.0.0.1:3300", library: house });
const shelf = async (ids: string[]) => {
  const res = await app.inject({
    method: "GET",
    url: `/shelf/matches?${new URLSearchParams(ids.map((id): [string, string] => ["ingredient", id]))}`,
  });
  return { status: res.statusCode, body: res.json() };
};
const names = (rs: { name: string }[]) => rs.map((r) => r.name);
const BAR = ["gin", "sweet-vermouth", "campari", "lemon-juice", "lime-juice", "sugar"];
const BASICS = [...BAR, "simple-syrup", "club-soda"];

describe("GET /shelf/matches (M2-04)", () => {
  it("lists every recipe the shelf makes, by name, with its derived strength", async () => {
    const { status, body } = await shelf(BASICS);
    expect(status).toBe(200);
    expect(body.makeNow).toHaveLength(7);
    expect(names(body.makeNow)).toEqual([...names(body.makeNow)].sort((a, b) => (a < b ? -1 : 1)));
    expect(names(body.makeNow)).toEqual(
      expect.arrayContaining([
        "Americano",
        "Electric Current Fizz",
        "Gimlet",
        "John Collins",
        "Negroni",
      ]),
    );
    const negroni = body.makeNow.find((r: { id: string }) => r.id === "negroni");
    expect(negroni).toMatchObject({ method: "built", glass: "rocks glass", swaps: [] });
    // ADR 0004: 30 ml each at 40%, 25% and 18%, counted like stirred, as on its recipe page.
    expect(negroni.abv).toBeCloseTo(19.8, 1);
  });

  it("names the one missing bottle and ranks what to buy by drinks it completes", async () => {
    const { body } = await shelf(BASICS);
    expect(body.oneAway).toContainEqual(
      expect.objectContaining({
        id: "boulevardier",
        missing: { id: "bourbon-whiskey", name: "Bourbon Whiskey" },
      }),
    );
    expect(body.oneAway).toContainEqual(
      expect.objectContaining({ id: "daiquiri", missing: { id: "light-rum", name: "Light Rum" } }),
    );
    const counts = body.buyNext.map((b: { count: number }) => b.count);
    expect(counts).toEqual([...counts].sort((a, b) => b - a));
    expect(body.buyNext.length).toBeLessThanOrEqual(10);
    const top = body.buyNext[0];
    expect(top.recipes).toHaveLength(top.count);
    // Owning the top bottle moves every recipe it names into make now.
    const after = await shelf([...BASICS, top.ingredient.id]);
    expect(names(after.body.makeNow)).toEqual(expect.arrayContaining(names(top.recipes)));
  });

  it("lets a bottle count where a recipe asks for its kind, never the reverse", async () => {
    const asksForWhiskey = (await shelf(["bourbon-whiskey", ...BASICS])).body.makeNow;
    const onlyWhiskey = (await shelf(["whiskey", ...BASICS])).body.makeNow;
    expect(names(asksForWhiskey)).toContain("Boulevardier");
    expect(names(onlyWhiskey)).not.toContain("Boulevardier");
  });

  it("answers an empty shelf with empty lists and refuses an unknown ingredient", async () => {
    expect((await shelf([])).body).toEqual({ makeNow: [], oneAway: [], buyNext: [] });
    const bad = await shelf(["gin", "unobtainium"]);
    expect(bad.status).toBe(400);
    expect(bad.body).toEqual({ error: "unknown_ingredient" });
  });
});

describe("house swaps (M2-05)", () => {
  it("count by default and say which they used, in make now and one away", async () => {
    const { body } = await shelf(["rye-whiskey", "sweet-vermouth", "campari"]);
    expect(body.makeNow).toContainEqual(
      expect.objectContaining({
        id: "boulevardier",
        swaps: [{ for: "Bourbon Whiskey", using: "Rye whiskey" }],
      }),
    );
    const away = (await shelf(["rye-whiskey", "sweet-vermouth"])).body.oneAway;
    expect(away).toContainEqual(
      expect.objectContaining({
        id: "boulevardier",
        missing: { id: "campari", name: "Campari" },
        swaps: [{ for: "Bourbon Whiskey", using: "Rye whiskey" }],
      }),
    );
  });

  it("never stand in on a line the drink is named for", async () => {
    const { body } = await shelf([
      "rye-whiskey",
      "lemon-juice",
      "creme-de-cassis",
      "simple-syrup",
      "angostura-aromatic-bitters",
    ]);
    expect(body.makeNow.map((r: { id: string }) => r.id)).not.toContain("bourbon-renewal");
    expect(body.oneAway).toContainEqual(
      expect.objectContaining({
        id: "bourbon-renewal",
        missing: expect.objectContaining({ id: "bourbon-whiskey" }),
      }),
    );
  });

  it("are listed with their reasons, all on for a visitor", async () => {
    const res = await app.inject({ method: "GET", url: "/substitutions" });
    expect(res.statusCode).toBe(200);
    const { items } = res.json();
    expect(items).toHaveLength(21);
    expect(items).toContainEqual({
      substitute: { id: "rye-whiskey", name: "Rye whiskey" },
      replaces: { id: "bourbon-whiskey", name: "Bourbon Whiskey" },
      reason: "Both American whiskeys; rye makes it drier and spicier.",
      allowed: true,
    });
    const replaced = items.map((i: { replaces: { name: string } }) => i.replaces.name);
    expect(replaced).toEqual([...replaced].sort((a, b) => a.localeCompare(b)));
  });
});
