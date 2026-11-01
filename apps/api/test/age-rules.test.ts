import { describe, expect, it } from "vitest";
import type { Pool } from "@stirred/db";
import { buildApp } from "../src/app.ts";
import { house } from "./house.ts";

const app = buildApp({ pool: {} as Pool, publicOrigin: "http://127.0.0.1:3300", library: house });
const rule = async (q: string) =>
  (await app.inject({ method: "GET", url: `/age-rules${q}` })).json();

describe("GET /age-rules", () => {
  it("answers the country's age and government help line", async () => {
    expect((await rule("?country=GB")).rule).toMatchObject({
      age: 18,
      name: "the United Kingdom",
      help: { phone: "0300 123 1110" },
    });
    expect((await rule("?country=us")).rule).toMatchObject({ age: 21, country: "US" });
    expect((await rule("?country=JP")).rule.age).toBe(20);
  });

  it("uses the highest age where it varies inside a country, and 21 for anywhere unlisted", async () => {
    expect((await rule("?country=CA")).rule.age).toBe(19);
    expect((await rule("?country=IN")).rule.age).toBe(25);
    expect((await rule("?country=XX")).rule).toMatchObject({
      age: 21,
      country: "ZZ",
      help: { url: expect.stringContaining("findahelpline") },
    });
    expect((await rule("")).rule.age).toBe(21);
  });

  it("lists the countries for the picker", async () => {
    const { countries } = await rule("");
    expect(countries).toContainEqual({ country: "GB", name: "the United Kingdom" });
    expect(countries.length).toBe(17);
  });
});
