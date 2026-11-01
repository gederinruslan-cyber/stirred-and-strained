import { describe, expect, it } from "vitest";
import { hashPassword, verifyPassword } from "../src/auth/password.ts";
import { rateLimiter } from "../src/auth/limiter.ts";
import { newToken, tokenHash } from "../src/auth/tokens.ts";

describe("passwords (ADR 0005)", () => {
  it("hashes with scrypt N=2^16 r=8 p=1 and a fresh salt, and verifies only the right password", async () => {
    const a = await hashPassword("negroni-1919");
    const b = await hashPassword("negroni-1919");
    expect(a).toMatch(/^scrypt\$65536\$8\$1\$[A-Za-z0-9_-]{22}\$[A-Za-z0-9_-]{43}$/);
    expect(a).not.toBe(b);
    expect(await verifyPassword("negroni-1919", a)).toBe(true);
    expect(await verifyPassword("negroni-1920", a)).toBe(false);
  });

  it("refuses a malformed stored hash instead of matching it", async () => {
    expect(await verifyPassword("anything", "plain-text")).toBe(false);
  });
});

describe("tokens", () => {
  it("are 32 random bytes in base64url, stored as their SHA-256", () => {
    const t = newToken();
    expect(t).toMatch(/^[A-Za-z0-9_-]{43}$/);
    expect(newToken()).not.toBe(t);
    expect(tokenHash(t)).toHaveLength(32);
    expect(tokenHash(t).equals(tokenHash(t))).toBe(true);
  });
});

describe("rate limiter", () => {
  it("allows the limit inside a window, refuses the next, and opens again after it", () => {
    let now = 0;
    const take = rateLimiter(10, 15 * 60_000, () => now);
    for (let i = 0; i < 10; i++) expect(take("ana@example.test")).toBe(true);
    expect(take("ana@example.test")).toBe(false);
    expect(take("bob@example.test")).toBe(true);
    now = 15 * 60_000;
    expect(take("ana@example.test")).toBe(true);
  });
});
