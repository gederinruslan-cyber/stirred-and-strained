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
const call = (method: "GET" | "POST" | "PATCH", path: string, session?: string, payload?: object) =>
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
const ownNegroni = async (session: string) =>
  (
    await call("POST", "/my/recipes", session, {
      name: "Ana's Negroni",
      method: "built",
      lines: [{ ingredient: "gin", amount: { value: 30, unit: "ml" }, optional: false }],
    })
  ).json().id as string;
const mark = (session: string, id: string, body: object) =>
  call("PATCH", `/my/marks/${id}`, session, body);

describe("favourites, ratings and notes api (M2-07)", () => {
  it("keeps a favourite, a rating and a note, and lists and filters them", async () => {
    const ana = await account();
    expect((await mark(ana, "negroni", { favourite: true })).json()).toEqual({
      noteChanged: false,
    });
    const saved = await mark(ana, "negroni", {
      rating: 4,
      note: "  Less Campari next time, 25 ml ",
    });
    expect(saved.json()).toEqual({ noteChanged: true });
    await mark(ana, "daiquiri", { rating: 3 });
    expect((await call("GET", "/my/marks/negroni", ana)).json()).toEqual({
      favourite: true,
      rating: 4,
      note: "Less Campari next time, 25 ml",
    });
    expect((await call("GET", "/my/marks/margarita", ana)).json()).toEqual({ favourite: false });

    const list = (await call("GET", "/my/marks", ana)).json();
    expect(list.items.map((i: { id: string }) => i.id).sort()).toEqual(["daiquiri", "negroni"]);
    expect(list.items.find((i: { id: string }) => i.id === "negroni")).toMatchObject({
      name: "Negroni",
      mark: { favourite: true, rating: 4 },
    });

    const rated = (await call("GET", "/recipes?mark=rated4&pageSize=100", ana)).json();
    expect(rated.items.map((i: { id: string }) => i.id)).toEqual(["negroni"]);
    expect(rated.items[0]).toMatchObject({ favourite: true, rating: 4 });
    const all = (await call("GET", "/recipes?q=daiquiri", ana)).json();
    expect(all.items.find((i: { id: string }) => i.id === "daiquiri")).toMatchObject({ rating: 3 });
    expect(all.facets.mark).toEqual([]);
    const both = (await call("GET", "/recipes?mark=favourite&mark=rated4", ana)).json();
    expect(both.facets.mark).toEqual([
      { value: "favourite", label: "Favourites", count: 1 },
      { value: "rated4", label: "Rated 4+", count: 1 },
    ]);
  });

  it("refuses a rating outside 1–5 and a note over 1000 characters", async () => {
    const ana = await account();
    expect((await mark(ana, "negroni", { rating: 6 })).statusCode).toBe(400);
    expect((await mark(ana, "negroni", { note: "x".repeat(1001) })).statusCode).toBe(400);
  });

  it("puts back a cleared note", async () => {
    const ana = await account();
    await mark(ana, "negroni", { note: "Less Campari" });
    expect((await mark(ana, "negroni", { note: "" })).json()).toEqual({ noteChanged: true });
    expect((await call("GET", "/my/marks/negroni", ana)).json()).toEqual({ favourite: false });
    expect((await call("POST", "/my/marks/negroni/undo-note", ana)).statusCode).toBe(204);
    expect((await call("GET", "/my/marks/negroni", ana)).json()).toMatchObject({
      note: "Less Campari",
    });
    expect((await call("POST", "/my/marks/daiquiri/undo-note", ana)).statusCode).toBe(404);
  });

  it("keeps an own recipe's mark while it is deleted and brings it back on restore", async () => {
    const ana = await account();
    const id = await ownNegroni(ana);
    await mark(ana, id, { favourite: true, rating: 5, note: "my house spec" });
    expect((await call("GET", "/recipes?mark=favourite", ana)).json().total).toBe(1);
    await app.inject({
      method: "DELETE",
      url: `/my/recipes/${id}`,
      headers: { authorization: `Bearer ${ana}` },
    });
    expect((await call("GET", "/my/marks", ana)).json().items).toEqual([]);
    expect((await call("GET", "/recipes?mark=favourite", ana)).json().total).toBe(0);
    await call("POST", `/my/recipes/${id}/restore`, ana);
    expect((await call("GET", "/my/marks", ana)).json().items).toEqual([
      expect.objectContaining({
        id,
        yours: true,
        mark: { favourite: true, rating: 5, note: "my house spec" },
      }),
    ]);
  });

  it("keeps marks to their owner (ADR 0003)", async () => {
    const [ana, bob] = [await account(), await account()];
    const id = await ownNegroni(ana);
    await mark(ana, "negroni", { favourite: true, note: "Ana's secret" });
    expect((await call("GET", "/my/marks/negroni", bob)).json()).toEqual({ favourite: false });
    expect((await call("GET", "/my/marks", bob)).json().items).toEqual([]);
    const search = (await call("GET", "/recipes?q=negroni", bob)).json();
    expect(search.items.find((i: { id: string }) => i.id === "negroni").favourite).toBeUndefined();
    expect(search.facets.mark).toEqual([]);
    expect((await mark(bob, id, { favourite: true })).statusCode).toBe(404);
    expect((await call("GET", `/my/marks/${id}`, bob)).statusCode).toBe(404);
    expect((await call("POST", `/my/marks/${id}/undo-note`, bob)).statusCode).toBe(404);
    expect((await call("GET", "/my/marks", ana)).json().items).toHaveLength(1);
  });

  it("answers 401 signed out and 404 for an unknown recipe; search ignores marks signed out", async () => {
    const ana = await account();
    expect((await call("GET", "/my/marks")).statusCode).toBe(401);
    expect((await call("GET", "/my/marks/negroni")).statusCode).toBe(401);
    expect((await mark("", "negroni", { favourite: true })).statusCode).toBe(401);
    expect((await mark(ana, "no-such-drink", { favourite: true })).statusCode).toBe(404);
    expect((await mark(ana, randomUUID(), { favourite: true })).statusCode).toBe(404);
    const out = (await call("GET", "/recipes?mark=favourite&q=negroni")).json();
    expect(out.total).toBeGreaterThan(0);
    expect(out.facets.mark).toBeUndefined();
  });
});
