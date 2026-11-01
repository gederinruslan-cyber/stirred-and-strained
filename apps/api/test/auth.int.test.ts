import { randomUUID } from "node:crypto";
import { afterAll, describe, expect, it } from "vitest";
import { createPool } from "@stirred/db";
import { buildApp } from "../src/app.ts";
import { memoryMailer } from "../src/auth/mailer.ts";
import { house } from "./house.ts";

const url = process.env.DATABASE_URL;
const migratorUrl = process.env.MIGRATION_DATABASE_URL;
if (!url || !migratorUrl) throw new Error("DATABASE_URL and MIGRATION_DATABASE_URL are required");
const pool = createPool(url);
const owner = createPool(migratorUrl);
afterAll(() => Promise.all([pool.end(), owner.end()]));

/** A fresh api (its own rate limits) with an in-memory outbox. */
function api() {
  const mailer = memoryMailer();
  const app = buildApp({ pool, publicOrigin: "http://127.0.0.1:3300", library: house, mailer });
  const post = (path: string, payload?: object, session?: string) =>
    app.inject({
      method: "POST",
      url: path,
      ...(payload ? { payload } : {}),
      headers: session ? { authorization: `Bearer ${session}` } : {},
    });
  const me = (session: string) =>
    app.inject({ method: "GET", url: "/auth/me", headers: { authorization: `Bearer ${session}` } });
  const linkIn = (to: string) => {
    const mail = mailer.sent.filter((m) => m.to === to).at(-1);
    return /token=([A-Za-z0-9_-]{43})/.exec(mail?.text ?? "")?.[1] ?? "";
  };
  /** Signs up and confirms; returns the session. */
  const account = async (email: string, password: string) => {
    await post("/auth/sign-up", { email, password });
    return (await post("/auth/confirm", { token: linkIn(email), password })).json()
      .session as string;
  };
  /** Asks for a reset and waits for its mail (sent after the answer); returns the link token. */
  const resetLink = async (email: string) => {
    const before = mailer.sent.length;
    await post("/auth/reset", { email });
    for (let i = 0; i < 200 && mailer.sent.length === before; i++) await sleep(10);
    return linkIn(email);
  };
  return { mailer, post, me, linkIn, account, resetLink };
}

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));
const fresh = () => `${randomUUID()}@example.test`;
/** Runs SQL as the table owner (past expiry dates; the api role cannot do this). */
async function asOwner(sql: string, params: unknown[]) {
  const client = await owner.connect();
  try {
    await client.query("begin");
    await client.query("set local role stirred_owner");
    const result = await client.query(sql, params);
    await client.query("commit");
    return result;
  } finally {
    client.release();
  }
}

describe("sign-up and confirm", () => {
  it("answers the same 202 for a new and an existing address, and mails a link each time", async () => {
    const { post, mailer, account } = api();
    const taken = fresh();
    await account(taken, "negroni-1919");
    const a = await post("/auth/sign-up", { email: fresh(), password: "negroni-1919" });
    const b = await post("/auth/sign-up", { email: taken, password: "negroni-1919" });
    expect([a.statusCode, b.statusCode]).toEqual([202, 202]);
    expect(a.body).toBe(b.body);
    expect(a.json()).toEqual({ status: "check-email" });
    expect(mailer.sent.filter((m) => m.to === taken)).toHaveLength(2);
    expect(mailer.sent.at(-1)!.text).toMatch(/^http:\/\/127\.0\.0\.1:3300\/confirm\?token=/m);
  });

  it("signs in on confirm; the link works once and not after 24 hours", async () => {
    const { post, me, linkIn } = api();
    const email = fresh();
    await post("/auth/sign-up", { email, password: "negroni-1919" });
    const token = linkIn(email);
    const confirmed = await post("/auth/confirm", { token, password: "negroni-1919" });
    expect(confirmed.statusCode).toBe(200);
    expect((await me(confirmed.json().session)).json()).toEqual({ email });
    const again = await post("/auth/confirm", { token, password: "negroni-1919" });
    expect(again.json()).toEqual({ error: "invalid_token" });

    const late = fresh();
    await post("/auth/sign-up", { email: late, password: "negroni-1919" });
    await asOwner(
      "update auth_token set expires_at = now() - interval '1 second' where email = $1",
      [late],
    );
    const expired = await post("/auth/confirm", { token: linkIn(late), password: "negroni-1919" });
    expect(expired.statusCode).toBe(400);
  });

  it("needs the password typed at that sign-up, so someone else's link claims nothing", async () => {
    const { post, linkIn, account } = api();
    // No account yet: Bob signs up with Ana's address; Ana opens his link with her password.
    const ana = fresh();
    await post("/auth/sign-up", { email: ana, password: "bobs-password" });
    const bobs = await post("/auth/confirm", { token: linkIn(ana), password: "anas-password" });
    expect(bobs.json()).toEqual({ error: "invalid_token" });
    expect(
      (await post("/auth/sign-in", { email: ana, password: "bobs-password" })).statusCode,
    ).toBe(401);

    // An account already: Mallory's sign-up link cannot change Ana's password or sessions.
    const cara = fresh();
    await account(cara, "caras-password");
    await post("/auth/sign-up", { email: cara, password: "mallorys-pass1" });
    await post("/auth/confirm", { token: linkIn(cara), password: "caras-password" });
    expect(
      (await post("/auth/sign-in", { email: cara, password: "mallorys-pass1" })).statusCode,
    ).toBe(401);
    expect(
      (await post("/auth/sign-in", { email: cara, password: "caras-password" })).statusCode,
    ).toBe(200);
  });

  it("takes 10 to 128 characters", async () => {
    const { post } = api();
    const status = async (password: string) =>
      (await post("/auth/sign-up", { email: fresh(), password })).statusCode;
    expect(await status("x".repeat(9))).toBe(400);
    expect(await status("x".repeat(10))).toBe(202);
    expect(await status("x".repeat(129))).toBe(400);
  });
});

describe("sign-in and sign-out", () => {
  it("signs in case-insensitively and answers one 401 for every wrong case", async () => {
    const { post, account } = api();
    const email = fresh();
    await account(email, "negroni-1919");
    const ok = await post("/auth/sign-in", {
      email: email.toUpperCase(),
      password: "negroni-1919",
    });
    expect(ok.statusCode).toBe(200);
    expect(ok.json()).toEqual({
      session: expect.stringMatching(/^[\w-]{43}$/),
      expiresAt: expect.any(String),
    });

    const unconfirmed = fresh();
    await post("/auth/sign-up", { email: unconfirmed, password: "negroni-1919" });
    const wrong = [
      await post("/auth/sign-in", { email, password: "negroni-1920" }),
      await post("/auth/sign-in", { email: fresh(), password: "negroni-1919" }),
      await post("/auth/sign-in", { email: unconfirmed, password: "negroni-1919" }),
    ];
    for (const res of wrong) {
      expect(res.statusCode).toBe(401);
      expect(res.json()).toEqual({ error: "invalid_credentials" });
    }
  });

  it("ends only the session it is given", async () => {
    const { post, me, account } = api();
    const email = fresh();
    const first = await account(email, "negroni-1919");
    const second = (await post("/auth/sign-in", { email, password: "negroni-1919" })).json()
      .session;
    expect((await post("/auth/sign-out", undefined, first)).statusCode).toBe(204);
    expect((await me(first)).statusCode).toBe(401);
    expect((await me(second)).statusCode).toBe(200);
    expect((await post("/auth/sign-out", undefined, first)).statusCode).toBe(401);
  });

  it("refuses an expired session", async () => {
    const { me, account } = api();
    const email = fresh();
    const session = await account(email, "negroni-1919");
    await asOwner(
      "update session set expires_at = now() - interval '1 second' where user_id = (select id from app_user where email = $1)",
      [email],
    );
    expect((await me(session)).statusCode).toBe(401);
  });
});

describe("password reset", () => {
  it("answers 202 for any address and mails only a confirmed account", async () => {
    const { post, mailer, account } = api();
    const email = fresh();
    await account(email, "negroni-1919");
    const before = mailer.sent.length;
    const unknown = await post("/auth/reset", { email: fresh() });
    const known = await post("/auth/reset", { email });
    expect(known.body).toBe(unknown.body);
    expect(known.statusCode).toBe(202);
    for (let i = 0; i < 200 && mailer.sent.length === before; i++) await sleep(10);
    await sleep(50);
    expect(mailer.sent.length).toBe(before + 1);
    expect(mailer.sent.at(-1)!.text).toMatch(/^http:\/\/127\.0\.0\.1:3300\/reset\?token=/m);
  });

  it("sets the new password, ends every older session, signs in, and works once", async () => {
    const { post, me, account, resetLink } = api();
    const email = fresh();
    const old = await account(email, "negroni-1919");
    const token = await resetLink(email);
    const reset = await post("/auth/reset/confirm", { token, password: "boulevardier-1927" });
    expect(reset.statusCode).toBe(200);
    expect((await me(old)).statusCode).toBe(401);
    expect((await me(reset.json().session)).statusCode).toBe(200);
    expect((await post("/auth/sign-in", { email, password: "negroni-1919" })).statusCode).toBe(401);
    expect((await post("/auth/sign-in", { email, password: "boulevardier-1927" })).statusCode).toBe(
      200,
    );
    const again = await post("/auth/reset/confirm", { token, password: "manhattan-1880" });
    expect(again.json()).toEqual({ error: "invalid_token" });
  });

  it("refuses a link older than an hour", async () => {
    const { post, account, resetLink } = api();
    const email = fresh();
    await account(email, "negroni-1919");
    const token = await resetLink(email);
    await asOwner(
      "update auth_token set expires_at = now() - interval '1 second' where email = $1",
      [email],
    );
    const res = await post("/auth/reset/confirm", {
      token,
      password: "boulevardier-1927",
    });
    expect(res.statusCode).toBe(400);
  });
});

describe("rate limits", () => {
  it("refuses the 11th sign-in for one email in 15 minutes, even with the right password", async () => {
    const { post, account } = api();
    const email = fresh();
    await account(email, "negroni-1919");
    for (let i = 0; i < 10; i++) await post("/auth/sign-in", { email, password: "wrong-password" });
    const res = await post("/auth/sign-in", { email, password: "negroni-1919" });
    expect(res.statusCode).toBe(429);
    expect(res.json()).toEqual({ error: "rate_limited" });
  });

  it("refuses the 6th sign-up and the 6th reset for one email in an hour", async () => {
    const { post } = api();
    const email = fresh();
    for (let i = 0; i < 5; i++) {
      expect((await post("/auth/sign-up", { email, password: "negroni-1919" })).statusCode).toBe(
        202,
      );
      expect((await post("/auth/reset", { email })).statusCode).toBe(202);
    }
    expect((await post("/auth/sign-up", { email, password: "negroni-1919" })).statusCode).toBe(429);
    expect((await post("/auth/reset", { email })).statusCode).toBe(429);
  });
});

describe("nothing secret leaves the api", () => {
  it("never answers with a hash, and stores tokens only as SHA-256", async () => {
    const { post, account } = api();
    const email = fresh();
    const session = await account(email, "negroni-1919");
    const signIn = await post("/auth/sign-in", { email, password: "negroni-1919" });
    expect(signIn.body).not.toMatch(/scrypt|negroni-1919/);
    const { rows } = await asOwner(
      "select count(*)::int as n from session where token_hash = sha256(convert_to($1, 'UTF8'))",
      [session],
    );
    expect(rows[0].n).toBe(1);
    const raw = await asOwner(
      "select count(*)::int as n from session where encode(token_hash, 'escape') = $1",
      [session],
    );
    expect(raw.rows[0].n).toBe(0);
  });
});
