"use client";
// Rating and note (M2-07, Star rating pattern): one form with its own Save, so it works before
// JavaScript loads; a refused note re-renders with the rating and every typed character kept.
import { useActionState } from "react";
import { saveTake } from "./mark-actions.ts";
import type { TakeState, TakeValues } from "./mark-state.ts";

export function TakeForm({ id, own, initial }: { id: string; own: boolean; initial: TakeValues }) {
  const [state, action, pending] = useActionState<TakeState, FormData>(saveTake, {});
  const values = state.values ?? initial;
  const describedBy = state.tooLong ? "note-help note-error" : "note-help";
  return (
    <form action={action} noValidate className="marks__form" key={JSON.stringify(state)}>
      {state.down && (
        <p className="form-error" role="alert">
          Something went wrong on our side. Nothing changed. Try again in a minute.
        </p>
      )}
      <input type="hidden" name="id" value={id} />
      {own && <input type="hidden" name="own" value="1" />}
      <fieldset className="stars">
        <legend>Your rating</legend>
        {["1", "2", "3", "4", "5", ""].map((v) => (
          <label key={v} className={v ? "stars__star" : "stars__star stars__none"}>
            <input type="radio" name="rating" value={v} defaultChecked={values.rating === v} />
            <span>
              <span className="stars__check" aria-hidden="true">
                ✓{" "}
              </span>
              {v ? (
                <>
                  {v}
                  <span aria-hidden="true">★</span>
                  <span className="vh">{v === "1" ? " star" : " stars"}</span>
                </>
              ) : (
                "No rating"
              )}
            </span>
          </label>
        ))}
      </fieldset>
      <label className="field marks__note">
        <span>Your note</span>
        <textarea
          className="textarea"
          name="note"
          rows={4}
          defaultValue={values.note}
          aria-describedby={describedBy}
          {...(state.tooLong ? { "aria-invalid": true, autoFocus: true } : {})}
        />
      </label>
      <p id="note-help" className="field__help">
        Only you can see this. Up to 1000 characters.
      </p>
      {state.tooLong && (
        <p id="note-error" className="field__error">
          Keep the note to 1000 characters or fewer.
        </p>
      )}
      <button type="submit" className="btn btn--primary marks__save" disabled={pending}>
        Save
      </button>
    </form>
  );
}
