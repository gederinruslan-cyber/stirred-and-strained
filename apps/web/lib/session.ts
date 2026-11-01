// The signed-in session (ADR 0005). The api's token lives only in an http-only cookie and goes
// back to the api from server code as a bearer token; nothing else ever sees it.
import "server-only";
import type { SessionResponse } from "@stirred/schema";
import { cookies, headers } from "next/headers";
import { api } from "./api.ts";
import { readShelf, writeShelf } from "./shelf.ts";

const SESSION_COOKIE = "session";
const TOKEN = /^[A-Za-z0-9_-]{43}$/;
const secure = (process.env.PUBLIC_ORIGIN ?? "").startsWith("https://");

async function sessionToken(): Promise<string | null> {
  const value = (await cookies()).get(SESSION_COOKIE)?.value;
  return value && TOKEN.test(value) ? value : null;
}

/** Headers for an api call: this visitor's session, and their address for the api's limits. */
export async function apiHeaders(): Promise<Record<string, string>> {
  const token = await sessionToken();
  // The nearest hop's entry: Next fills it from the socket when no proxy sent one.
  const client = (await headers()).get("x-forwarded-for")?.split(",").at(-1)?.trim();
  return {
    ...(token ? { authorization: `Bearer ${token}` } : {}),
    ...(client ? { "x-forwarded-for": client } : {}),
  };
}

/** The signed-in visitor's email, or null (no cookie, or a session the api no longer knows). */
export async function signedInEmail(): Promise<string | null> {
  if (!(await sessionToken())) return null;
  const { data } = await api.GET("/auth/me", { headers: await apiHeaders() });
  return data?.email ?? null;
}

/**
 * In a server action: keep a new session until the api says it ends, and move the signed-out
 * shelf into the account (M2-03). Ids the taxonomy no longer knows are dropped; if the api
 * cannot take the shelf now, the cookie stays for the next sign-in.
 */
export async function keepSession(session: SessionResponse) {
  (await cookies()).set(SESSION_COOKIE, session.session, {
    path: "/",
    httpOnly: true,
    sameSite: "lax",
    secure,
    expires: new Date(session.expiresAt),
  });
  const shelf = await readShelf();
  if (shelf.length === 0) return;
  try {
    const list = (await api.GET("/ingredients")).data;
    if (!list) return;
    const known = new Set(list.items.map((i) => i.id));
    const ingredients = shelf.filter((id) => known.has(id));
    const moved =
      ingredients.length === 0 ||
      (
        await api.POST("/bar/items", {
          body: { ingredients },
          headers: { authorization: `Bearer ${session.session}` },
        })
      ).response.ok;
    if (moved) await writeShelf([]);
  } catch {
    // The api is down: the shelf waits in its cookie.
  }
}

/** In a server action: end this session in the api (if it still exists) and drop the cookie. */
export async function endSession() {
  if (await sessionToken()) await api.POST("/auth/sign-out", { headers: await apiHeaders() });
  (await cookies()).delete(SESSION_COOKIE);
}
