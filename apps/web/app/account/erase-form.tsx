"use client";
// Delete your account (docs/design/account.md): a plain form to a server action, so it works
// before JavaScript loads. Focus goes to the first control to fix after a failed submit.
import { Button } from "@stirred/ui";
import { useActionState, useEffect, useRef } from "react";
import { eraseAccount, type EraseState } from "./actions.ts";

export function EraseForm() {
  const [state, action, pending] = useActionState<EraseState, FormData>(eraseAccount, {});
  const failed = Boolean(state.password || state.understand || state.form);
  const focus = state.password || !state.understand ? "password" : "understand";
  const form = useRef<HTMLFormElement>(null);
  useEffect(() => {
    if (failed) (form.current?.elements.namedItem(focus) as HTMLInputElement | null)?.focus();
  }, [state, failed, focus]);
  const passwordBy = ["delete-what", "password-help", state.password && "password-error"]
    .concat(state.form && focus === "password" ? ["form-error"] : [])
    .filter(Boolean)
    .join(" ");
  return (
    <form ref={form} action={action} noValidate className="form-page__form">
      {state.form && (
        <div id="form-error" role="alert" className="form-error">
          {state.form}
        </div>
      )}
      <div>
        <label className="field">
          <span>Your password</span>
          <input
            name="password"
            type="password"
            autoComplete="current-password"
            required
            aria-describedby={passwordBy}
            {...(state.password ? { "aria-invalid": true } : {})}
          />
        </label>
        <p id="password-help" className="field__help">
          So no one else can do this from a screen you left signed in.
        </p>
        {state.password && (
          <p id="password-error" className="field__error">
            {state.password}
          </p>
        )}
      </div>
      <div>
        <label className="account__tick">
          <input
            type="checkbox"
            name="understand"
            value="yes"
            required
            defaultChecked={state.ticked}
            {...(state.understand
              ? { "aria-invalid": true, "aria-describedby": "understand-error" }
              : {})}
          />
          I understand my account and everything in it will be deleted for good.
        </label>
        {state.understand && (
          <p id="understand-error" className="field__error">
            {state.understand}
          </p>
        )}
      </div>
      <Button type="submit" variant="danger" disabled={pending}>
        Delete my account
      </Button>
    </form>
  );
}
