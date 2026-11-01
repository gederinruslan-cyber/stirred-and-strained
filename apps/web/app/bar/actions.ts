"use server";
// My Bar's forms (M2-03, docs/design/my-bar.md). Each posts, changes the bar in the api (signed
// in) or on the shelf cookie (signed out), then redirects back to /bar with what happened in the
// query, so a reload never posts twice and everything works without JavaScript.
import { redirect } from "next/navigation";
import { api } from "../../lib/api.ts";
import { allIngredients, ask, currentBar, fold } from "../../lib/bar.ts";
import { apiHeaders } from "../../lib/session.ts";
import { writeShelf } from "../../lib/shelf.ts";

const back = (params: [string, string][]) => redirect(`/bar?${new URLSearchParams(params)}`);

/** Adds the ids; reports which were new and which were there already. */
async function keep(ids: string[]) {
  const bar = await currentBar();
  if (bar === "down") return back([["error", "down"]]);
  const already = ids.filter((id) => bar.ids.includes(id));
  const added = ids.filter((id) => !bar.ids.includes(id));
  if (bar.signedIn) {
    const res = await ask(
      api.POST("/bar/items", { body: { ingredients: ids }, headers: await apiHeaders() }),
    );
    if (res === "down" || !res.data) return back([["error", "down"]]);
  } else {
    await writeShelf([...bar.ids, ...added]);
  }
  back([
    ...added.map((id) => ["added", id] as [string, string]),
    ...already.map((id) => ["already", id] as [string, string]),
  ]);
}

export async function addByName(form: FormData) {
  const list = await allIngredients();
  const pick = String(form.get("pick") ?? "");
  if (pick) {
    if (!list.some((i) => i.id === pick)) return back([["error", "down"]]);
    return keep([pick]);
  }
  const name = String(form.get("name") ?? "").trim();
  if (!name) return back([["error", "empty"]]);
  const hits = list.filter((i) => fold(i.name) === fold(name));
  if (hits.length !== 1) return back([["name", name.slice(0, 60)]]);
  return keep([hits[0]!.id]);
}

export async function addTicked(form: FormData) {
  const known = new Set((await allIngredients()).map((i) => i.id));
  const ids = [...new Set(form.getAll("ingredients").map(String))].filter((id) => known.has(id));
  if (ids.length === 0) return back([["error", "ticks"]]);
  return keep(ids);
}

/** Turns a house swap on or off (M2-05). The button's name is the state wanted, so a stale tab
 * does what its label says. Only a signed-in bar has the form. */
export async function toggleSwap(form: FormData) {
  const on = form.get("on");
  const value = String(on ?? form.get("off") ?? "");
  const [substitute, replaces] = value.split(">");
  if (!substitute || !replaces) return back([["error", "swap"]]);
  const res = await ask(
    api.PUT("/substitutions/{substitute}/{replaces}", {
      params: { path: { substitute, replaces } },
      body: { allowed: on !== null },
      headers: await apiHeaders(),
    }),
  );
  if (res === "down") return back([["error", "swap"]]);
  if (res.response.status === 404) return back([["swap", "gone"]]);
  if (!res.response.ok) return back([["error", "swap"]]);
  return back([
    ["swap", value],
    ["turned", on !== null ? "on" : "off"],
  ]);
}

export async function removeItem(form: FormData) {
  const id = String(form.get("remove") ?? "");
  const bar = await currentBar();
  if (bar === "down") return back([["error", "down"]]);
  if (bar.signedIn) {
    const res = await ask(
      api.DELETE("/bar/items/{ingredientId}", {
        params: { path: { ingredientId: id } },
        headers: await apiHeaders(),
      }),
    );
    if (res === "down") return back([["error", "down"]]);
    if (res.response.status === 404) return back([["gone", id]]);
    if (!res.response.ok) return back([["error", "down"]]);
    return back([["removed", id]]);
  }
  if (!bar.ids.includes(id)) return back([["gone", id]]);
  await writeShelf(bar.ids.filter((i) => i !== id));
  return back([["removed", id]]);
}
