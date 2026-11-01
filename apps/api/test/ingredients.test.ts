import { describe, expect, it } from "vitest";
import type { Pool } from "@stirred/db";
import { buildApp } from "../src/app.ts";
import { house } from "./house.ts";

const app = buildApp({ pool: {} as Pool, publicOrigin: "http://127.0.0.1:3300", library: house });
const ids = async (q: string) => {
  const res = await app.inject({ method: "GET", url: `/ingredients?q=${encodeURIComponent(q)}` });
  expect(res.statusCode).toBe(200);
  return (res.json().items as { id: string }[]).map((i) => i.id);
};

describe("GET /ingredients for My Bar (M2-03)", () => {
  it("gives each ingredient its kind and its path, category first", async () => {
    const items = (await app.inject({ method: "GET", url: "/ingredients" })).json().items;
    expect(items).toContainEqual({
      id: "bourbon-whiskey",
      name: "Bourbon Whiskey",
      kind: "type",
      path: ["Spirits", "Whiskey"],
    });
    expect(items).toContainEqual({ id: "spirits", name: "Spirits", kind: "category", path: [] });
  });

  it("suggests the name itself, then names with the word, then what sits under a match", async () => {
    const found = await ids("whiskey");
    expect(found[0]).toBe("whiskey");
    expect(found).toEqual(expect.arrayContaining(["bourbon-whiskey", "rye-whiskey"]));
    // "Blended Scotch Whisky" does not name the word; it sits under Scotch whiskey.
    expect(found.indexOf("blended-scotch-whisky")).toBeGreaterThan(found.indexOf("rye-whiskey"));
    expect(found.length).toBeLessThanOrEqual(20);
  });

  it("matches any word, any case, without accents", async () => {
    expect(await ids("RYE")).toContain("rye-whiskey");
    expect(await ids("creme de mure")).toContain("creme-de-mure");
    expect(await ids("no such bottle")).toEqual([]);
  });
});
