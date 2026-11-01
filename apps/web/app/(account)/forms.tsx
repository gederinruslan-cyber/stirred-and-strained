"use client";
// The account forms (docs/design/auth-screens.md). Each posts to a server action, so it works
// before JavaScript loads; results replace the form in the same card.
import { Button, ButtonLink } from "@stirred/ui";
import { useActionState, useEffect, useRef, type ReactNode } from "react";
import { confirm, forgot, reset, signIn, signUp } from "./actions.ts";
import type { FormState } from "./copy.ts";

type Name = "email" | "password";
const PASSWORD_HELP = "10 to 128 characters. A few words you'll remember work well.";

/** After a failed submit: the field to fix, else the password, else the first field. */
const focusOn = (state: FormState, fields: Name[]): Name | undefined =>
  state.error && (state.error.field ?? (fields.includes("password") ? "password" : fields[0]));

/** One form with its state; focus moves to the field to fix after a failed submit. */
function useForm(action: (s: FormState, f: FormData) => Promise<FormState>, fields: Name[]) {
  const [state, formAction, pending] = useActionState(action, {});
  const form = useRef<HTMLFormElement>(null);
  const focus = focusOn(state, fields);
  useEffect(() => {
    if (focus) (form.current?.elements.namedItem(focus) as HTMLInputElement | null)?.focus();
  }, [state, focus]);
  return { state, formAction, pending, form, focus };
}

function Field({
  name,
  label,
  type,
  autoComplete,
  help,
  state,
  focus,
}: {
  name: Name;
  label: string;
  type: "email" | "password";
  autoComplete: string;
  help?: string;
  state: FormState;
  focus: Name | undefined;
}) {
  const error = state.error?.field === name ? state.error.text : undefined;
  const formLevel = focus === name && state.error && !state.error.field;
  const describedBy = [help && `${name}-help`, error && `${name}-error`, formLevel && "form-error"]
    .filter(Boolean)
    .join(" ");
  return (
    <div>
      <label className="field">
        <span>{label}</span>
        <input
          name={name}
          type={type}
          autoComplete={autoComplete}
          required
          defaultValue={name === "email" ? state.email : undefined}
          autoFocus={focus === name}
          aria-describedby={describedBy || undefined}
          {...(error ? { "aria-invalid": true } : {})}
        />
      </label>
      {help && (
        <p id={`${name}-help`} className="field__help">
          {help}
        </p>
      )}
      {error && (
        <p id={`${name}-error`} className="field__error">
          {error}
        </p>
      )}
    </div>
  );
}

function FormError({ state }: { state: FormState }) {
  if (!state.error || state.error.field) return null;
  return (
    <div id="form-error" role="alert" className="form-error">
      {state.error.text}
    </div>
  );
}

function Head({
  aside,
  title,
  lead,
  focus,
}: {
  aside: string;
  title: string;
  lead: ReactNode;
  focus?: boolean;
}) {
  return (
    <>
      <p className="hand form-page__aside" aria-hidden="true">
        {aside}
      </p>
      <h1 className="h2" {...(focus ? { tabIndex: -1, autoFocus: true } : {})}>
        {title}
      </h1>
      <p className="form-page__lead">{lead}</p>
    </>
  );
}

const Links = ({ children }: { children: ReactNode }) => (
  <p className="form-page__links">{children}</p>
);

export function SignInForm({ back }: { back: string }) {
  const { state, formAction, pending, form, focus } = useForm(signIn, ["email", "password"]);
  return (
    <>
      <Head
        aside="welcome back"
        title="Sign in"
        lead="Sign in to keep your bar and your own recipes with you."
      />
      <form ref={form} action={formAction} noValidate className="form-page__form">
        <FormError state={state} />
        <input type="hidden" name="back" value={back} />
        <Field
          name="email"
          label="Email"
          type="email"
          autoComplete="username"
          {...{ state, focus }}
        />
        <div>
          <Field
            name="password"
            label="Password"
            type="password"
            autoComplete="current-password"
            {...{ state, focus }}
          />
          <p className="form-page__links">
            <a href="/forgot">Forgot your password?</a>
          </p>
        </div>
        <Button type="submit" disabled={pending}>
          Sign in
        </Button>
      </form>
      <Links>
        New here? <a href={`/sign-up?back=${encodeURIComponent(back)}`}>Create an account</a>
      </Links>
    </>
  );
}

export function SignUpForm({ back }: { back: string }) {
  const { state, formAction, pending, form, focus } = useForm(signUp, ["email", "password"]);
  if (state.sent) {
    return (
      <>
        <Head
          aside="nearly there"
          title="Check your email"
          focus
          lead={
            <>
              We sent a link to <strong>{state.sent}</strong>.
            </>
          }
        />
        <ul className="form-page__rules">
          <li>It works once, for 24 hours.</li>
          <li>Open it on any device and type the same password you just chose.</li>
        </ul>
        <p className="form-page__links muted">
          Nothing after a few minutes? Check your spam folder, or{" "}
          <a href="/sign-up">sign up again</a> for a new link.
        </p>
      </>
    );
  }
  return (
    <>
      <Head
        aside="new here"
        title="Create an account"
        lead="An email and a password. We'll send a link to check the address is yours."
      />
      <form ref={form} action={formAction} noValidate className="form-page__form">
        <FormError state={state} />
        <Field
          name="email"
          label="Email"
          type="email"
          autoComplete="username"
          {...{ state, focus }}
        />
        <Field
          name="password"
          label="Password"
          type="password"
          autoComplete="new-password"
          help={PASSWORD_HELP}
          {...{ state, focus }}
        />
        <Button type="submit" disabled={pending}>
          Create account
        </Button>
      </form>
      <Links>
        Already have an account? <a href={`/sign-in?back=${encodeURIComponent(back)}`}>Sign in</a>
      </Links>
    </>
  );
}

function BadConfirmLink({ focus = false }: { focus?: boolean }) {
  return (
    <>
      <Head
        aside="hmm"
        title="That link didn't work"
        focus={focus}
        lead="A confirm link works once, for 24 hours, and needs the password you chose when you signed up. This one can't be used again."
      />
      <ButtonLink href="/sign-up">Sign up again</ButtonLink>
      <Links>
        Already confirmed? <a href="/sign-in">Sign in</a>
      </Links>
    </>
  );
}

export function ConfirmForm({ token }: { token: string | null }) {
  const { state, formAction, pending, form, focus } = useForm(confirm, ["password"]);
  if (!token) return <BadConfirmLink />;
  if (state.badLink) return <BadConfirmLink focus />;
  return (
    <>
      <Head
        aside="last step"
        title="Confirm your account"
        lead="Type the password you chose when you signed up. This link works once, so check it before you press the button."
      />
      <form ref={form} action={formAction} noValidate className="form-page__form">
        <FormError state={state} />
        <input type="hidden" name="token" value={token} />
        <Field
          name="password"
          label="Password"
          type="password"
          autoComplete="current-password"
          {...{ state, focus }}
        />
        <Button type="submit" disabled={pending}>
          Confirm and sign in
        </Button>
      </form>
    </>
  );
}

export function ForgotForm() {
  const { state, formAction, pending, form, focus } = useForm(forgot, ["email"]);
  if (state.sent) {
    return (
      <>
        <Head
          aside="on its way"
          title="Check your email"
          focus
          lead={
            <>
              If <strong>{state.sent}</strong> has an account, we&apos;ve sent it a link to choose a
              new password. It works once, for one hour.
            </>
          }
        />
        <p className="form-page__links muted">
          Nothing after a few minutes? Check your spam folder, or <a href="/forgot">ask again</a>.
        </p>
      </>
    );
  }
  return (
    <>
      <Head
        aside="it happens"
        title="Forgot your password?"
        lead="Tell us your email and we'll send a link to choose a new one."
      />
      <form ref={form} action={formAction} noValidate className="form-page__form">
        <FormError state={state} />
        <Field
          name="email"
          label="Email"
          type="email"
          autoComplete="username"
          {...{ state, focus }}
        />
        <Button type="submit" disabled={pending}>
          Send the link
        </Button>
      </form>
      <Links>
        Remembered it? <a href="/sign-in">Sign in</a>
      </Links>
    </>
  );
}

function BadResetLink({ focus = false }: { focus?: boolean }) {
  return (
    <>
      <Head
        aside="hmm"
        title="That link didn't work"
        focus={focus}
        lead="A reset link works once, for one hour. This one has been used or has run out."
      />
      <ButtonLink href="/forgot">Ask for a new link</ButtonLink>
    </>
  );
}

export function ResetForm({ token }: { token: string | null }) {
  const { state, formAction, pending, form, focus } = useForm(reset, ["password"]);
  if (!token) return <BadResetLink />;
  if (state.badLink) return <BadResetLink focus />;
  return (
    <>
      <Head
        aside="fresh start"
        title="Choose a new password"
        lead="Saving it signs you out on every other device."
      />
      <form ref={form} action={formAction} noValidate className="form-page__form">
        <FormError state={state} />
        <input type="hidden" name="token" value={token} />
        <Field
          name="password"
          label="New password"
          type="password"
          autoComplete="new-password"
          help={PASSWORD_HELP}
          {...{ state, focus }}
        />
        <Button type="submit" disabled={pending}>
          Save and sign in
        </Button>
      </form>
    </>
  );
}
