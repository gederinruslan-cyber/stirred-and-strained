"use client";
// The recipe form (M2-06, Line rows + Error summary patterns). It posts to a server action, so it
// works before JavaScript loads; a failed save re-renders with every value kept and the error
// summary focused.
import type { IngredientEntry } from "@stirred/schema";
import { ButtonLink } from "@stirred/ui";
import { useActionState, useEffect, useRef } from "react";
import { saveRecipe } from "./actions.ts";
import {
  METHOD_OPTIONS,
  UNIT_OPTIONS,
  withBlanks,
  type RecipeFormState,
  type RecipeValues,
} from "./form-state.ts";

export function RecipeForm({
  id,
  title,
  initial,
  ingredients,
  glasses,
  cancel,
}: {
  id?: string;
  title: string;
  initial: RecipeValues;
  ingredients: IngredientEntry[];
  glasses: { id: string; name: string }[];
  cancel: string;
}) {
  const [state, action, pending] = useActionState<RecipeFormState, FormData>(saveRecipe, {});
  const values = state.values ?? initial;
  const errors = state.errors ?? [];
  const summary = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (state.errors?.length || state.down) summary.current?.focus();
  }, [state]);
  const errorOf = (field: string) => errors.find((e) => e.field === field)?.text;
  const invalid = (field: string) =>
    errorOf(field) ? { "aria-invalid": true as const, "aria-describedby": `${field}-error` } : {};
  const fieldError = (field: string) =>
    errorOf(field) && (
      <p id={`${field}-error`} className="field__error">
        {errorOf(field)}
      </p>
    );
  const rows = withBlanks(values.lines.filter((l) => l.ingredient || l.amount));
  // A key per render so a re-render after a failed save shows the values it returned.
  const key = JSON.stringify(state);

  return (
    <form action={action} noValidate className="recipe-form napkin" key={key}>
      <div className="tape" aria-hidden="true" />
      <h1 className="recipe__title">{title}</h1>
      {(errors.length > 0 || state.down) && (
        <div
          ref={summary}
          className="form-error error-summary"
          role="alert"
          tabIndex={-1}
          autoFocus
        >
          {state.down ? (
            <p>Something went wrong on our side. Nothing was saved. Try again in a minute.</p>
          ) : (
            <>
              <p>
                {errors.length === 1
                  ? "Fix this before saving:"
                  : `Fix ${errors.length} things before saving:`}
              </p>
              <ul>
                {errors.map((e) => (
                  <li key={e.field}>
                    <a href={`#${e.field}`}>{e.text}</a>
                  </li>
                ))}
              </ul>
            </>
          )}
        </div>
      )}
      {id && <input type="hidden" name="id" value={id} />}
      <input type="hidden" name="rows" value={rows.length} />

      <div className="recipe-form__name">
        <label className="field" htmlFor="name">
          <span>Name</span>
        </label>
        <input
          className="input"
          id="name"
          name="name"
          defaultValue={values.name}
          maxLength={120}
          autoComplete="off"
          {...invalid("name")}
        />
        {fieldError("name")}
      </div>

      <div className="recipe-form__row">
        <div className="select">
          <label htmlFor="method">Method</label>
          <select id="method" name="method" defaultValue={values.method} {...invalid("method")}>
            <option value="">Choose a method</option>
            {METHOD_OPTIONS.map((m) => (
              <option key={m} value={m}>
                {m}
              </option>
            ))}
          </select>
          {fieldError("method")}
        </div>
        <div className="select">
          <label htmlFor="glass">Glass</label>
          <select id="glass" name="glass" defaultValue={values.glass} {...invalid("glass")}>
            <option value="">No glass in particular</option>
            {glasses.map((g) => (
              <option key={g.id} value={g.id}>
                {g.name}
              </option>
            ))}
          </select>
          {fieldError("glass")}
        </div>
      </div>

      <fieldset className="line-rows" id="lines" tabIndex={-1} aria-describedby="lines-help">
        <legend className="recipe__h2">What goes in</legend>
        <p id="lines-help" className="field__help">
          One ingredient per row. Leave the rest blank; we skip empty rows.
        </p>
        {fieldError("lines")}
        <datalist id="ingredient-paths">
          {ingredients.map((i) => (
            <option key={i.id} value={i.name} label={[...i.path, i.name].join(" › ")} />
          ))}
        </datalist>
        <div className="line-rows__head" aria-hidden="true">
          <span>Ingredient</span>
          <span>Amount</span>
          <span>Unit</span>
          <span>Optional</span>
        </div>
        <ol className="line-rows__list">
          {rows.map((l, i) => {
            const n = i + 1;
            const f = (part: string) => `line-${n}-${part}`;
            return (
              <li key={n} className="line-row">
                <span className="line-row__num" aria-hidden="true">
                  Line {n}
                </span>
                <div className="line-row__ingredient">
                  <label htmlFor={f("ingredient")}>
                    <span className="line-row__label">Ingredient</span>
                    <span className="vh"> {n}</span>
                  </label>
                  <input
                    className="input"
                    id={f("ingredient")}
                    name={f("ingredient")}
                    list="ingredient-paths"
                    defaultValue={l.ingredient}
                    autoComplete="off"
                    {...invalid(f("ingredient"))}
                  />
                </div>
                <div className="line-row__amount">
                  <label htmlFor={f("amount")}>
                    <span className="line-row__label">Amount</span>
                    <span className="vh"> {n}</span>
                  </label>
                  <input
                    className="input"
                    id={f("amount")}
                    name={f("amount")}
                    inputMode="decimal"
                    defaultValue={l.amount}
                    autoComplete="off"
                    {...invalid(f("amount"))}
                  />
                </div>
                <div className="line-row__unit select">
                  <label htmlFor={f("unit")}>
                    <span className="line-row__label">Unit</span>
                    <span className="vh"> {n}</span>
                  </label>
                  <select id={f("unit")} name={f("unit")} defaultValue={l.unit}>
                    {UNIT_OPTIONS.map((u) => (
                      <option key={u} value={u}>
                        {u}
                      </option>
                    ))}
                  </select>
                </div>
                <label className="check line-row__optional">
                  <input type="checkbox" name={f("optional")} defaultChecked={l.optional} />
                  <span className="line-row__label">Optional</span>
                  <span className="vh"> {n}</span>
                </label>
                {fieldError(f("ingredient"))}
                {fieldError(f("amount"))}
              </li>
            );
          })}
        </ol>
      </fieldset>

      <div className="recipe-form__steps">
        <label className="field" htmlFor="steps">
          <span>How to make it</span>
        </label>
        <textarea
          className="textarea"
          id="steps"
          name="steps"
          rows={6}
          defaultValue={values.steps}
          aria-describedby="steps-help"
        />
        <p id="steps-help" className="field__help">
          One step per line. Leave it empty and we&apos;ll write the steps from the method and
          glass.
        </p>
      </div>

      <div className="recipe-form__actions">
        <button type="submit" className="btn btn--primary" disabled={pending}>
          Save recipe
        </button>
        <ButtonLink href={cancel} variant="secondary">
          Cancel
        </ButtonLink>
      </div>
    </form>
  );
}
