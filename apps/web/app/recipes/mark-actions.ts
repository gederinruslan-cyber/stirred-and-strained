"use server";
// Favourites, ratings and notes (M2-07, docs/design/marks.md). Each posts to the api as the
// signed-in visitor and comes back to the recipe's "Your take" panel with what happened, so it
// works without JavaScript. A note never goes into a URL.
import { redirect } from "next/navigation";
import { api } from "../../lib/api.ts";
import { ask } from "../../lib/bar.ts";
import { apiHeaders } from "../../lib/session.ts";
import { NOTE_MAX, type TakeState } from "./mark-state.ts";

const text = (form: FormData, key: string) => String(form.get(key) ?? "");

/** The recipe's page: a house recipe's or the visitor's own. */
function pageOf(form: FormData) {
  const id = text(form, "id");
  return { id, page: `/${text(form, "own") ? "my-recipes" : "recipes"}/${encodeURIComponent(id)}` };
}

function landed(page: string, status: number, marked: string): never {
  if (status === 401) redirect(`/sign-in?back=${encodeURIComponent(page)}`);
  redirect(`${page}?marked=${status === 404 || status >= 500 ? "down" : marked}#marks-h`);
}

export async function setFavourite(form: FormData) {
  const { id, page } = pageOf(form);
  const favourite = text(form, "favourite") === "true";
  const res = await ask(
    api.PATCH("/my/marks/{id}", {
      params: { path: { id } },
      body: { favourite },
      headers: await apiHeaders(),
    }),
  );
  landed(page, res === "down" ? 500 : res.response.status, favourite ? "fav-on" : "fav-off");
}

export async function saveTake(_prev: TakeState, form: FormData): Promise<TakeState> {
  const { id, page } = pageOf(form);
  const values = { rating: text(form, "rating"), note: text(form, "note") };
  if (values.note.trim().length > NOTE_MAX) return { values, tooLong: true };
  const rating = Number(values.rating);
  const res = await ask(
    api.PATCH("/my/marks/{id}", {
      params: { path: { id } },
      body: {
        rating: Number.isInteger(rating) && rating >= 1 && rating <= 5 ? rating : null,
        note: values.note.trim() || null,
      },
      headers: await apiHeaders(),
    }),
  );
  if (res === "down" || res.response.status >= 500 || res.response.status === 400)
    return { values, down: true };
  landed(page, res.response.status, res.data?.noteChanged ? "saved-note" : "saved");
}

export async function undoNote(form: FormData) {
  const { id, page } = pageOf(form);
  const res = await ask(
    api.POST("/my/marks/{id}/undo-note", {
      params: { path: { id } },
      headers: await apiHeaders(),
    }),
  );
  landed(page, res === "down" ? 500 : res.response.status, "undone");
}
