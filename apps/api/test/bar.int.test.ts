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
// Bar items name house ingredients, so the house taxonomy must be in the database.
beforeAll(() =>
  importSeed(migratorUrl, readSeed(new URL("../../../data/seed", import.meta.url).pathname)),
);
afterAll(() => pool.end());

const mailer = memoryMailer();
const app = buildApp({ pool, publicOrigin: "http://127.0.0.1:3300", library: house, mailer });
const call = (
  method: "GET" | "POST" | "DELETE",
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
const barIds = async (session: string) =>
  ((await call("GET", "/bar", session)).json().items as { id: string }[]).map((i) => i.id);

describe("My Bar api (M2-03)", () => {
  it("adds without duplicates, lists with paths, removes", async () => {
    const ana = await account();
    expect(await barIds(ana)).toEqual([]);
    const added = await call("POST", "/bar/items", ana, { ingredients: ["gin", "campari", "gin"] });
    expect(added.statusCode).toBe(200);
    await call("POST", "/bar/items", ana, { ingredients: ["campari", "bourbon-whiskey"] });
    const { items } = (await call("GET", "/bar", ana)).json();
    expect(items.map((i: { id: string }) => i.id).sort()).toEqual([
      "bourbon-whiskey",
      "campari",
      "gin",
    ]);
    expect(items).toContainEqual({
      id: "bourbon-whiskey",
      name: "Bourbon Whiskey",
      kind: "type",
      path: ["Spirits", "Whiskey"],
    });
    expect((await call("DELETE", "/bar/items/gin", ana)).statusCode).toBe(204);
    expect((await call("DELETE", "/bar/items/gin", ana)).statusCode).toBe(404);
    expect((await barIds(ana)).sort()).toEqual(["bourbon-whiskey", "campari"]);
  });

  it("keeps each bar to its owner: another user's item answers 404", async () => {
    const [ana, bob] = [await account(), await account()];
    await call("POST", "/bar/items", ana, { ingredients: ["gin"] });
    expect(await barIds(bob)).toEqual([]);
    expect((await call("DELETE", "/bar/items/gin", bob)).statusCode).toBe(404);
    expect(await barIds(ana)).toEqual(["gin"]);
  });

  it("refuses a visitor without a session and an unknown ingredient", async () => {
    expect((await call("GET", "/bar")).statusCode).toBe(401);
    expect((await call("POST", "/bar/items", undefined, { ingredients: ["gin"] })).statusCode).toBe(
      401,
    );
    expect((await call("DELETE", "/bar/items/gin")).statusCode).toBe(401);
    const ana = await account();
    const bad = await call("POST", "/bar/items", ana, { ingredients: ["gin", "unobtainium"] });
    expect(bad.statusCode).toBe(400);
    expect(bad.json()).toEqual({ error: "unknown_ingredient" });
    expect(await barIds(ana)).toEqual([]);
  });
});

describe("what you can make from your bar (M2-04)", () => {
  const BASICS = ["lemon-juice", "lime-juice", "sugar", "simple-syrup", "club-soda"];
  const makes = async (session?: string) => {
    const res = await call("GET", "/bar/matches", session);
    return { status: res.statusCode, body: res.json() };
  };

  it("matches the caller's own bar, the same as the shelf would", async () => {
    const ana = await account();
    await call("POST", "/bar/items", ana, {
      ingredients: ["gin", "sweet-vermouth", "campari", ...BASICS],
    });
    const mine = await makes(ana);
    expect(mine.status).toBe(200);
    const q = new URLSearchParams(
      ["gin", "sweet-vermouth", "campari", ...BASICS].map((id): [string, string] => [
        "ingredient",
        id,
      ]),
    );
    expect(mine.body).toEqual((await call("GET", `/shelf/matches?${q}`)).json());
    expect(mine.body.makeNow.map((r: { id: string }) => r.id)).toContain("negroni");
  });

  it("never shows another user's bar, and never answers without a session", async () => {
    const [ana, bob] = [await account(), await account()];
    await call("POST", "/bar/items", ana, { ingredients: ["gin", "sweet-vermouth", "campari"] });
    await call("POST", "/bar/items", bob, { ingredients: ["light-rum", ...BASICS] });
    const ids = (await makes(bob)).body.makeNow.map((r: { id: string }) => r.id);
    expect(ids).toContain("daiquiri");
    expect(ids).not.toContain("negroni");
    expect((await makes()).status).toBe(401);
  });
});
