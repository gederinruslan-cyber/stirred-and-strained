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
type Method = "GET" | "POST" | "PATCH" | "PUT" | "DELETE";
const call = (method: Method, path: string, session?: string, payload?: object) =>
  app.inject({
    method,
    url: path,
    ...(payload ? { payload } : {}),
    headers: session ? { authorization: `Bearer ${session}` } : {},
  });
const PASSWORD = "negroni-1919";
async function account() {
  const email = `${randomUUID()}@example.test`;
  await call("POST", "/auth/sign-up", undefined, { email, password: PASSWORD });
  const token = /token=([A-Za-z0-9_-]{43})/.exec(
    mailer.sent.filter((m) => m.to === email).at(-1)!.text,
  )![1];
  const session = (
    await call("POST", "/auth/confirm", undefined, { token, password: PASSWORD })
  ).json().session as string;
  return { email, session };
}
/** Ana's evening: a bar, a refused swap, a recipe edited then deleted, a marked Negroni. */
async function stocked(session: string) {
  await call("POST", "/bar/items", session, { ingredients: ["gin", "campari"] });
  await call("PUT", "/substitutions/rye-whiskey/bourbon-whiskey", session, { allowed: false });
  const body = (campari: number) => ({
    name: "Ana's *Negroni*",
    method: "built",
    steps: "Stir over ice.\n# Twist of orange",
    lines: [
      { ingredient: "gin", amount: { value: 30, unit: "ml" } },
      { ingredient: "campari", amount: { value: campari, unit: "oz" } },
    ],
  });
  const { id } = (await call("POST", "/my/recipes", session, body(1))).json();
  await call("PUT", `/my/recipes/${id}`, session, body(0.75));
  await call("DELETE", `/my/recipes/${id}`, session);
  await call("PATCH", "/my/marks/negroni", session, { favourite: true, rating: 4, note: "More" });
  await call("PATCH", "/my/marks/negroni", session, { note: "Less Campari" });
  return id as string;
}

describe("export and erase api (M2-08)", () => {
  it("exports everything Ana owns as JSON, and nothing of Ben's", async () => {
    const ana = await account();
    const ben = await account();
    const recipeId = await stocked(ana.session);
    await stocked(ben.session);

    const res = await call("GET", "/account/export", ana.session);
    expect(res.statusCode).toBe(200);
    const data = res.json();
    expect(data.format).toBe("stirred-and-strained-export/1");
    expect(data.account.email).toBe(ana.email);
    expect(JSON.stringify(data)).not.toContain(ben.email);
    expect(JSON.stringify(data)).not.toContain(ana.session);
    expect(data.sessions).toHaveLength(1);
    expect(data.bar.map((b: { ingredient: { name: string } }) => b.ingredient.name)).toEqual([
      "Campari",
      "Gin",
    ]);
    expect(data.swapsTurnedOff).toMatchObject([
      { substitute: { id: "rye-whiskey" }, replaces: { id: "bourbon-whiskey" } },
    ]);
    expect(data.recipes).toHaveLength(1);
    const recipe = data.recipes[0];
    expect(recipe).toMatchObject({ id: recipeId, name: "Ana's *Negroni*" });
    expect(recipe.deletedAt).toEqual(expect.any(String));
    expect(recipe.lines[1]).toEqual({
      ingredient: { id: "campari", name: "Campari" },
      amount: { value: 0.75 * 29.5735295625, unit: "ml" },
      entered: "oz",
      optional: false,
    });
    expect(recipe.history.map((h: { kind: string }) => h.kind)).toEqual([
      "created",
      "edited",
      "deleted",
    ]);
    expect(recipe.history[0].spec.lines[1].amount.value).toBe(29.5735295625);
    expect(data.marks).toEqual([
      {
        recipe: { id: "negroni", name: "Negroni", yours: false },
        favourite: true,
        rating: 4,
        note: "Less Campari",
        noteBefore: "More",
        updatedAt: expect.any(String),
      },
    ]);
  });

  it("exports the same as readable Markdown", async () => {
    const ana = await account();
    await stocked(ana.session);
    const res = await call("GET", "/account/export/markdown", ana.session);
    expect(res.statusCode).toBe(200);
    expect(res.headers["content-type"]).toMatch(/^text\/markdown/);
    const md = res.body;
    expect(md).toContain(`# Your Stirred & Strained data`);
    expect(md).toContain(ana.email);
    expect(md).toMatch(/## Your bar \(2\)\n\n- Campari\n- Gin/);
    expect(md).toContain("- Rye whiskey for Bourbon Whiskey");
    expect(md).toContain("### Ana's \\*Negroni\\* (deleted");
    expect(md).toContain("- ¾ oz Campari");
    expect(md).toContain("\\# Twist of orange");
    expect(md).toContain("### Negroni");
    expect(md).toContain("Less Campari");
  });

  it("answers 401 to a signed-out visitor", async () => {
    for (const path of ["/account/export", "/account/export/markdown"]) {
      expect((await call("GET", path)).statusCode).toBe(401);
    }
    expect(
      (await call("POST", "/account/erase", undefined, { password: PASSWORD, understood: true }))
        .statusCode,
    ).toBe(401);
  });

  it("erases only with the right password, then the account is gone", async () => {
    const ana = await account();
    const ben = await account();
    await stocked(ana.session);
    await stocked(ben.session);
    const erase = (password: string) =>
      call("POST", "/account/erase", ana.session, { password, understood: true });

    expect((await erase("not-my-password")).statusCode).toBe(401);
    expect((await call("GET", "/account/export", ana.session)).statusCode).toBe(200);
    expect(
      (await call("POST", "/account/erase", ana.session, { password: PASSWORD })).statusCode,
    ).toBe(400);

    expect((await erase(PASSWORD)).statusCode).toBe(204);
    expect((await call("GET", "/auth/me", ana.session)).statusCode).toBe(401);
    const signIn = await call("POST", "/auth/sign-in", undefined, {
      email: ana.email,
      password: PASSWORD,
    });
    expect(signIn.statusCode).toBe(401);
    const bens = (await call("GET", "/account/export", ben.session)).json();
    expect(bens.bar).toHaveLength(2);
    expect(bens.recipes).toHaveLength(1);
    expect(bens.marks).toHaveLength(1);
  });

  it("stops guessing the password after 10 tries in 15 minutes", async () => {
    const ana = await account();
    const tries = [];
    for (let i = 0; i < 11; i++) {
      tries.push(
        (await call("POST", "/account/erase", ana.session, { password: "wrong", understood: true }))
          .statusCode,
      );
    }
    expect(tries.slice(0, 10).every((s) => s === 401)).toBe(true);
    expect(tries[10]).toBe(429);
    expect((await call("GET", "/auth/me", ana.session)).statusCode).toBe(200);
  });
});
