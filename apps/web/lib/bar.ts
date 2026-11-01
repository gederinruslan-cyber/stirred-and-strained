// My Bar (M2-03) for server code: a signed-in visitor's bar lives in the api; a signed-out
// visitor's (or a session the api no longer knows) on the shelf cookie.
import "server-only";
import type { BarMatches, IngredientEntry, Substitution } from "@stirred/schema";
import { api } from "./api.ts";
import { apiHeaders } from "./session.ts";
import { readShelf } from "./shelf.ts";

export type Bar = { signedIn: boolean; ids: string[] };

/** The api's answer, or "down" when it cannot be reached. */
export async function ask<T>(call: Promise<T>): Promise<T | "down"> {
  try {
    return await call;
  } catch {
    return "down";
  }
}

export async function currentBar(): Promise<Bar | "down"> {
  const headers = await apiHeaders();
  if (headers.authorization) {
    const res = await ask(api.GET("/bar", { headers }));
    if (res === "down") return "down";
    if (res.data) return { signedIn: true, ids: res.data.items.map((i) => i.id) };
    if (res.response.status !== 401) return "down";
  }
  return { signedIn: false, ids: await readShelf() };
}

/** What the bar makes (M2-04): the api runs the engine over the account's bar or these ids. */
export async function barMatches(bar: Bar): Promise<BarMatches | "down"> {
  const res = await ask(
    bar.signedIn
      ? api.GET("/bar/matches", { headers: await apiHeaders() })
      : api.GET("/shelf/matches", { params: { query: { ingredient: bar.ids } } }),
  );
  return res === "down" || !res.data ? "down" : res.data;
}

/** The house swaps (M2-05) with the signed-in user's on or off; signed out, every one is on. */
export async function barSwaps(bar: Bar): Promise<Substitution[] | "down"> {
  const res = await ask(
    api.GET("/substitutions", bar.signedIn ? { headers: await apiHeaders() } : {}),
  );
  return res === "down" || !res.data ? "down" : res.data.items;
}

export async function allIngredients(): Promise<IngredientEntry[]> {
  const { data } = await api.GET("/ingredients");
  if (!data) throw new Error("the api did not answer /ingredients");
  return data.items;
}

/** Case, accents and spacing ignored, as the search page compares names. */
export const fold = (s: string) => s.normalize("NFKD").replace(/[̀-ͯ]/g, "").toLowerCase().trim();
