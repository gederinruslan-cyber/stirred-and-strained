"use server";
// Custom recipes' forms (M2-06, docs/design/custom-recipes.md). Each posts to the api as the
// signed-in visitor and redirects with what happened, so everything works without JavaScript.
// Ingredient names resolve to ids here, as the search page does; the api checks them again.
import { redirect } from "next/navigation";
import { api } from "../../lib/api.ts";
import { allIngredients, ask, fold } from "../../lib/bar.ts";
import { apiHeaders } from "../../lib/session.ts";
import {
  METHOD_OPTIONS,
  UNIT_OPTIONS,
  type FieldError,
  type LineValues,
  type RecipeFormState,
  type RecipeValues,
} from "./form-state.ts";

type Unit = "ml" | "cl" | "oz" | "dash" | "barspoon" | "drop" | "piece" | "top";
type Input = {
  name: string;
  method: "shaken" | "stirred" | "built" | "blended" | "muddled" | "layered";
  glass?: string;
  steps?: string;
  lines: { ingredient: string; amount: { value: number; unit: Unit }; optional: boolean }[];
};

const NO_VOLUME = "Add at least one line in ml, cl or oz so we can work out how strong it is.";
const text = (form: FormData, key: string) => String(form.get(key) ?? "");

function readValues(form: FormData): RecipeValues {
  const rows = Math.min(Number(text(form, "rows")) || 0, 30);
  const lines: LineValues[] = [];
  for (let n = 1; n <= rows; n++) {
    lines.push({
      ingredient: text(form, `line-${n}-ingredient`).trim(),
      amount: text(form, `line-${n}-amount`).trim(),
      unit: text(form, `line-${n}-unit`),
      optional: form.get(`line-${n}-optional`) !== null,
    });
  }
  return {
    name: text(form, "name").trim(),
    method: text(form, "method"),
    glass: text(form, "glass"),
    steps: text(form, "steps"),
    lines,
  };
}

/** The api's input, or the errors to show (every typed value is kept for the re-render). */
async function toInput(v: RecipeValues): Promise<Input | FieldError[]> {
  const errors: FieldError[] = [];
  if (!v.name) errors.push({ field: "name", text: "Give it a name." });
  else if (v.name.length > 80)
    errors.push({ field: "name", text: "Keep the name to 80 characters or fewer." });
  if (!METHOD_OPTIONS.includes(v.method))
    errors.push({ field: "method", text: "Choose a method." });
  const list = await allIngredients();
  const lines: Input["lines"] = [];
  v.lines.forEach((l, i) => {
    const n = i + 1;
    if (!l.ingredient && !l.amount) return;
    const hit = list.find((x) => fold(x.name) === fold(l.ingredient));
    if (!hit) {
      errors.push({
        field: `line-${n}-ingredient`,
        text: l.ingredient
          ? `We don't know “${l.ingredient}”. Pick one from the list.`
          : "Pick an ingredient for this line.",
      });
      return;
    }
    const unit = UNIT_OPTIONS.includes(l.unit) ? l.unit : "ml";
    if (!l.amount && unit !== "top") {
      errors.push({ field: `line-${n}-amount`, text: `Give an amount for ${hit.name}.` });
      return;
    }
    const value = l.amount ? Number(l.amount.replace(",", ".")) : 1;
    if (!Number.isFinite(value) || value <= 0 || value > 10000) {
      errors.push({ field: `line-${n}-amount`, text: "Use a number above 0, like 30 or 0.75." });
      return;
    }
    lines.push({
      ingredient: hit.id,
      amount: { value, unit: unit as Unit },
      optional: l.optional,
    });
  });
  if (
    !errors.some((e) => e.field.startsWith("line-")) &&
    !lines.some((l) => l.amount.unit !== "piece")
  )
    errors.push({ field: "lines", text: NO_VOLUME });
  if (errors.length > 0) return errors;
  return {
    name: v.name,
    method: v.method as Input["method"],
    ...(v.glass ? { glass: v.glass } : {}),
    ...(v.steps.trim() ? { steps: v.steps } : {}),
    lines,
  };
}

/** Saves a new recipe (no `id`) or changes one; lands on its page. */
export async function saveRecipe(_prev: RecipeFormState, form: FormData): Promise<RecipeFormState> {
  const id = text(form, "id");
  const values = readValues(form);
  const input = await toInput(values);
  if (Array.isArray(input)) return { values, errors: input };
  const headers = await apiHeaders();
  const res = id
    ? await ask(api.PUT("/my/recipes/{id}", { params: { path: { id } }, body: input, headers }))
    : await ask(api.POST("/my/recipes", { body: input, headers }));
  if (res === "down") return { values, down: true };
  const status = res.response.status;
  const created = !id && res.data ? (res.data as { id: string }).id : undefined;
  if (status === 401)
    redirect(
      `/sign-in?back=${encodeURIComponent(id ? `/my-recipes/${id}/edit` : "/my-recipes/new")}`,
    );
  if (status === 404) redirect(`/my-recipes/${id}`);
  if (status === 400) {
    const error = (res.error as { error?: string } | undefined)?.error;
    if (error === "no_volume") return { values, errors: [{ field: "lines", text: NO_VOLUME }] };
    if (error === "unknown_glass")
      return { values, errors: [{ field: "glass", text: "Choose a glass from the list." }] };
    return { values, down: true };
  }
  if (!res.response.ok) return { values, down: true };
  const saved = id || created;
  if (!saved) return { values, down: true };
  redirect(`/my-recipes/${saved}?saved=${id ? "edit" : "new"}`);
}

export async function deleteRecipe(form: FormData) {
  const id = text(form, "id");
  const res = await ask(
    api.DELETE("/my/recipes/{id}", { params: { path: { id } }, headers: await apiHeaders() }),
  );
  if (res === "down" || res.response.status >= 500) redirect(`/my-recipes/${id}?error=down`);
  if (res.response.status === 401)
    redirect(`/sign-in?back=${encodeURIComponent(`/my-recipes/${id}`)}`);
  redirect(`/my-recipes?deleted=${encodeURIComponent(id)}`);
}

/** Restores a deleted recipe: "undo" from the list's status line, "restore" anywhere else. */
export async function restoreRecipe(form: FormData) {
  const id = text(form, "id");
  const how = text(form, "how");
  const res = await ask(
    api.POST("/my/recipes/{id}/restore", { params: { path: { id } }, headers: await apiHeaders() }),
  );
  if (res === "down" || res.response.status >= 500) redirect(`/my-recipes?error=down`);
  if (res.response.status === 401) redirect(`/sign-in?back=/my-recipes`);
  if (how === "page") redirect(`/my-recipes/${id}?restored=1`);
  redirect(`/my-recipes?${how === "undo" ? "undone" : "restored"}=${encodeURIComponent(id)}`);
}
