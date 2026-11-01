import { randomUUID } from "node:crypto";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { createPool, importSeed, readSeed } from "@stirred/db";
import { buildApp } from "../src/app.ts";
import { memoryMailer } from "../src/auth/mailer.ts";
import { house } from "./house.ts";

const url = process.env.DATABASE_URL;
const migratorUrl = process.env.MIGRATION_DATABASE_URL;
if (!url || !migratorUrl) throw new Error("DATABASE_URL and MIGRATION_DATABASE_URL are required");
const pool = createPool(url);
beforeAll(() =>
  importSeed(migratorUrl, readSeed(new URL("../../../data/seed", import.meta.url).pathname)),
);
afterAll(() => pool.end());

const mailer = memoryMailer();
const app = buildApp({ pool, publicOrigin: "http://127.0.0.1:3300", library: house, mailer });
const call = (
  method: "GET" | "POST" | "PUT" | "DELETE",
  path: string,
  session?: string,
  payload?: object,
) =>
  app.inject({
    method,
    url: path,
    ...(payload ? { payload } : {}),
    headers: session ? { authorization: `Bearer ${session}` } : {},
  });
async function account() {
  const email = `${randomUUID()}@example.test`;
  const password = "negroni-1919";
  await call("POST", "/auth/sign-up", undefined, { email, password });
  const token = /token=([A-Za-z0-9_-]{43})/.exec(
    mailer.sent.filter((m) => m.to === email).at(-1)!.text,
  )![1];
  return (await call("POST", "/auth/confirm", undefined, { token, password })).json()
    .session as string;
}

const negroni = {
  name: "Ana's Negroni",
  method: "built",
  glass: "Lowball",
  lines: [
    { ingredient: "gin", amount: { value: 1, unit: "oz" }, optional: false },
    { ingredient: "campari", amount: { value: 30, unit: "ml" }, optional: false },
    { ingredient: "sweet-vermouth", amount: { value: 3, unit: "cl" }, optional: false },
    { ingredient: "orange", amount: { value: 1, unit: "piece" }, optional: true },
  ],
};
const create = async (session: string, body: object = negroni) => {
  const res = await call("POST", "/my/recipes", session, body);
  expect(res.statusCode).toBe(201);
  return res.json().id as string;
};

describe("custom recipes api (M2-06)", () => {
  it("saves canonical amounts and derives strength like a house recipe", async () => {
    const ana = await account();
    const id = await create(ana);
    const r = (await call("GET", `/my/recipes/${id}?country=US`, ana)).json();
    expect(r).toMatchObject({ id, name: "Ana's Negroni", method: "built", glass: "rocks glass" });
    expect(r.yours).toBe(true);
    expect(r.lines[0]).toMatchObject({
      ingredient: { id: "gin", name: "Gin" },
      amount: { value: 29.5735295625, unit: "ml" },
      entered: { value: 1, unit: "oz" },
    });
    expect(r.lines[2].amount).toEqual({ value: 30, unit: "ml" });
    const houseNegroni = (await call("GET", "/recipes/negroni?country=US")).json();
    expect(r.strength.abv).toBeCloseTo(houseNegroni.strength.abv, 1);
    expect(r.strength.drinks.measure).toBe("standard drinks");
    expect(r.steps[0]).toBe("Fill a rocks glass with ice.");
    expect(r.history.map((h: { kind: string }) => h.kind)).toEqual(["created"]);
  });

  it("edits, keeps every save, deletes softly and restores", async () => {
    const ana = await account();
    const id = await create(ana);
    const lighter = {
      ...negroni,
      steps: "Stir.\n\n  <b>Garnish</b> with orange.  ",
      lines: [negroni.lines[0], { ...negroni.lines[1], amount: { value: 25, unit: "ml" } }],
    };
    expect((await call("PUT", `/my/recipes/${id}`, ana, lighter)).statusCode).toBe(204);
    const edited = (await call("GET", `/my/recipes/${id}`, ana)).json();
    expect(edited.lines).toHaveLength(2);
    expect(edited.steps).toEqual(["Stir.", "<b>Garnish</b> with orange."]);
    expect(edited.history.map((h: { kind: string }) => h.kind)).toEqual(["created", "edited"]);
    expect(edited.history[0].spec.lines[1].amount).toEqual({ value: 30, unit: "ml" });

    expect((await call("DELETE", `/my/recipes/${id}`, ana)).statusCode).toBe(204);
    const list = (await call("GET", "/my/recipes", ana)).json();
    expect(list.items).toEqual([]);
    expect(list.deleted).toMatchObject([{ id, name: "Ana's Negroni" }]);
    expect((await call("PUT", `/my/recipes/${id}`, ana, lighter)).statusCode).toBe(404);
    expect((await call("POST", `/my/recipes/${id}/restore`, ana)).statusCode).toBe(204);
    expect((await call("POST", `/my/recipes/${id}/restore`, ana)).statusCode).toBe(404);
    expect((await call("GET", "/my/recipes", ana)).json().items).toMatchObject([
      { id, yours: true, method: "built" },
    ]);
  });

  it("is searched and matched for its owner only", async () => {
    const [ana, bob] = [await account(), await account()];
    const id = await create(ana);
    const search = async (session?: string) =>
      (await call("GET", "/recipes?q=ana%27s", session)).json().items as { id: string }[];
    expect(await search(ana)).toMatchObject([{ id, yours: true }]);
    expect(await search(bob)).toEqual([]);
    expect(await search()).toEqual([]);

    await call("POST", "/bar/items", ana, { ingredients: ["gin", "campari", "sweet-vermouth"] });
    await call("POST", "/bar/items", bob, { ingredients: ["gin", "campari", "sweet-vermouth"] });
    const mine = (await call("GET", "/bar/matches", ana)).json();
    expect(mine.makeNow).toContainEqual(expect.objectContaining({ id, yours: true }));
    expect((await call("GET", "/bar/matches", bob)).json().makeNow).not.toContainEqual(
      expect.objectContaining({ id }),
    );
    await call("DELETE", "/bar/items/campari", ana);
    const away = (await call("GET", "/bar/matches", ana)).json();
    expect(away.oneAway).toContainEqual(
      expect.objectContaining({ id, yours: true, missing: { id: "campari", name: "Campari" } }),
    );
    await call("DELETE", `/my/recipes/${id}`, ana);
    expect(await search(ana)).toEqual([]);
    const gone = (await call("GET", "/bar/matches", ana)).json();
    expect(gone.oneAway).not.toContainEqual(expect.objectContaining({ id }));
  });

  it("keeps each recipe to its owner: another user's id answers 404", async () => {
    const [ana, bob] = [await account(), await account()];
    const id = await create(ana);
    expect((await call("GET", `/my/recipes/${id}`, bob)).statusCode).toBe(404);
    expect((await call("PUT", `/my/recipes/${id}`, bob, negroni)).statusCode).toBe(404);
    expect((await call("DELETE", `/my/recipes/${id}`, bob)).statusCode).toBe(404);
    expect((await call("POST", `/my/recipes/${id}/restore`, bob)).statusCode).toBe(404);
    expect((await call("GET", "/my/recipes", bob)).json()).toEqual({ items: [], deleted: [] });
    expect((await call("GET", `/my/recipes/${id}`, ana)).json().history).toHaveLength(1);
  });

  it("refuses a visitor, an unknown ingredient, a recipe with no volume and bad input", async () => {
    expect((await call("GET", "/my/recipes")).statusCode).toBe(401);
    expect((await call("POST", "/my/recipes", undefined, negroni)).statusCode).toBe(401);
    expect((await call("GET", `/my/recipes/${randomUUID()}`)).statusCode).toBe(401);
    const ana = await account();
    const bad = async (body: object) => {
      const res = await call("POST", "/my/recipes", ana, body);
      return { status: res.statusCode, error: res.json().error };
    };
    const line = (ingredient: string) => ({
      ...negroni,
      lines: [{ ...negroni.lines[0], ingredient }],
    });
    expect(await bad(line("unobtainium"))).toEqual({ status: 400, error: "unknown_ingredient" });
    expect(await bad({ ...negroni, lines: [negroni.lines[3]] })).toEqual({
      status: 400,
      error: "no_volume",
    });
    expect(await bad({ ...negroni, glass: "Boot" })).toEqual({
      status: 400,
      error: "unknown_glass",
    });
    expect((await bad({ ...negroni, name: "x".repeat(81) })).status).toBe(400);
    expect((await bad({ ...negroni, lines: Array(31).fill(negroni.lines[0]) })).status).toBe(400);
    expect((await call("GET", "/my/recipes", ana)).json().items).toEqual([]);
    expect((await call("GET", "/my/recipes/negroni", ana)).statusCode).toBe(404);
  });

  it("lists the glasses a recipe can name", async () => {
    const { items } = (await call("GET", "/glasses")).json();
    expect(items).toContainEqual({ id: "Lowball", name: "rocks glass" });
  });
});
