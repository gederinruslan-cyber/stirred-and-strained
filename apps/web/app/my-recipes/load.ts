// Server-side loads for the custom recipe pages (M2-06): a signed-in visitor's recipe, or a
// redirect to sign in that comes back here; ingredients and glasses for the form.
import "server-only";
import { notFound, redirect } from "next/navigation";
import { api } from "../../lib/api.ts";
import { allIngredients } from "../../lib/bar.ts";
import { apiHeaders } from "../../lib/session.ts";

/** Session headers, or a redirect to sign in with `back`. */
export async function signedInHeaders(back: string) {
  const headers = await apiHeaders();
  if (!headers.authorization) redirect(`/sign-in?back=${encodeURIComponent(back)}`);
  return headers;
}

/** The visitor's recipe; another user's id or a bad one is the not-found page. */
export async function myRecipe(id: string, back: string, country?: string) {
  const headers = await signedInHeaders(back);
  const { data, response } = await api.GET("/my/recipes/{id}", {
    params: { path: { id }, query: country ? { country } : {} },
    headers,
  });
  if (response.status === 401) redirect(`/sign-in?back=${encodeURIComponent(back)}`);
  if (response.status === 404) notFound();
  if (!data) throw new Error(`the api did not answer /my/recipes/${id}`);
  return data;
}

export async function formOptions() {
  const [ingredients, glasses] = await Promise.all([allIngredients(), api.GET("/glasses")]);
  if (!glasses.data) throw new Error("the api did not answer /glasses");
  return { ingredients, glasses: glasses.data.items };
}
