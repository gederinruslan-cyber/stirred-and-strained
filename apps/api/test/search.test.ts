import { describe, expect, it } from "vitest";
import type { Pool } from "@stirred/db";
import { buildApp } from "../src/app.ts";
import { house } from "./house.ts";

const app = buildApp({ pool: {} as Pool, publicOrigin: "http://127.0.0.1:3300", library: house });
const get = async (query: string) => {
  const res = await app.inject({ method: "GET", url: `/recipes?pageSize=100&${query}` });
  return { status: res.statusCode, body: res.json() };
};
const ids = (b: { items: { id: string }[] }) => b.items.map((r) => r.id);
const lines = (id: string) => house.byId.get(id)!.lines.map((l) => l.ingredient);

describe("GET /recipes: search", () => {
  it("finds by part of the name, case and accents ignored, in name order", async () => {
    const { body } = await get("q=NEGRONI");
    expect(ids(body)).toEqual(
      expect.arrayContaining(["negroni", "coffee-negroni", "negroni-sbagliato"]),
    );
    const names = body.items.map((r: { name: string }) => r.name);
    expect(names).toEqual([...names].sort((a, b) => (a < b ? -1 : a > b ? 1 : 0)));
    expect(ids((await get("q=frappe")).body)).toContain("absinthe-frappe");
  });

  it("includes through the hierarchy, never the reverse, and excludes", async () => {
    const whiskey = ids((await get("include=whiskey")).body);
    expect(whiskey).toEqual(expect.arrayContaining(["manhattan", "old-fashioned"]));
    const bourbon = ids((await get("include=bourbon-whiskey")).body);
    expect(bourbon).toContain("old-fashioned");
    expect(bourbon).not.toContain("manhattan"); // rye only
    const noCampari = (await get("q=negroni&exclude=campari")).body;
    expect(ids(noCampari).every((id: string) => !lines(id).includes("campari"))).toBe(true);
    expect(ids(noCampari)).not.toContain("negroni");
    expect((await get("include=unicorn-tears")).status).toBe(400);
  });

  it("ORs values within a facet, ANDs facets, and counts over the results", async () => {
    const { body } = await get("base=gin&method=shaken");
    expect(body.total).toBeGreaterThan(0);
    expect(body.facets.base).toEqual([{ value: "gin", label: "Gin", count: body.total }]);
    expect(body.facets.method).toEqual([{ value: "shaken", label: "shaken", count: body.total }]);
    const either = (await get("method=shaken&method=stirred")).body;
    const counts = Object.fromEntries(
      either.facets.method.map((f: { value: string; count: number }) => [f.value, f.count]),
    );
    expect(counts.shaken + counts.stirred).toBe(either.total);
  });

  it("filters by finished ABV, zero-proof at 0, and searches only zero-proof in that mode", async () => {
    const low = (await get("abvMin=0&abvMax=10")).body;
    expect(low.items.every((r: { abv: number }) => r.abv <= 10)).toBe(true);
    expect(ids((await get("q=shirley&abvMax=10")).body)).toEqual(["shirley-temple"]);
    const zero = (await get("zero=true")).body;
    expect(zero.items.every((r: { zeroProof: boolean }) => r.zeroProof)).toBe(true);
    expect(zero.total).toBe(9);
  });

  it("derives base spirit, family and flavour", async () => {
    const { body } = await get("q=negroni");
    const negroni = body.items.find((r: { id: string }) => r.id === "negroni");
    expect(negroni).toMatchObject({ family: "Negroni", glass: "rocks glass" });
    expect(body.facets.base.find((f: { value: string }) => f.value === "gin")).toBeTruthy();
    const daiquiri = (await get("q=daiquiri")).body.facets.base;
    expect(daiquiri[0]).toMatchObject({ value: "rum", label: "Rum" });
    const smoky = (await get("flavour=Smoky")).body;
    expect(smoky.total).toBeGreaterThan(0);
  });
});

describe("GET /ingredients", () => {
  it("lists every ingredient by name for the pickers", async () => {
    const res = await app.inject({ method: "GET", url: "/ingredients" });
    const items = res.json().items;
    expect(items).toHaveLength(house.tax.nodes.size);
    expect(items).toContainEqual({ id: "bourbon-whiskey", name: "Bourbon Whiskey" });
  });
});
