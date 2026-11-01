# Auth screens — design spec (M2-02)

*Bar Napkin, both themes, `/sign-in` `/sign-up` `/confirm` `/forgot` `/reset` and the header's
signed-in state. Every form is a POST to a server action that works without JS. New patterns
(`patterns.md`): Form page, Form-level error, Header account control; Text field moves to
`@stirred/ui`. [BRACKETS] are what the visitor typed, echoed back; never anything from an account.*

## Page shape (all five)
- Normal header and footer. `main` > `div.container.form-page` (max 608 incl. gutters, so the card
  is ~560; padding 64 top, 112 bottom) > `NapkinCard tilt={-0.8}` (none below 900 px). Inside:
  `p.hand.form-page__aside[aria-hidden]` (Caveat, ≤4 words) · `h1.h2` · `p.form-page__lead` ·
  `form.form-page__form` (`method="post"`, `noValidate`, column, gap 16; hidden `back` where named) ·
  `p.form-page__links.small` (secondary links, ` · ` between). Fields are full width; the primary
  `Button type="submit"` sits last in the form, full width below 900 px, 44 px.
- `noValidate` + `required`: the server checks and our words show, never the browser's bubble.
  No `maxlength` (it truncates silently); length is a server error.
- States replace the form inside the same card (same URL). A new state's `h1` has
  `tabIndex={-1}` and `autoFocus`, so focus never drops to `body` (2.4.3) and the heading is read.
- `<title>` "[h1] · Stirred & Strained". `/sign-in` and `/sign-up` redirect a signed-in visitor to `/`.

## Errors (shared)
- **Field:** `aria-invalid="true"`, `p.field__error#<name>-error` under the input, input
  `aria-describedby` lists help then error. Empty email: "Enter your email address." Not an
  address: "That doesn't look like an email address. It needs an @, like ana@example.test."
  Empty password: "Enter your password." Wrong length: "Use 10 to 128 characters."
- **Form-level** (`div.form-error#form-error[role=alert]`, first child of the form, above the
  fields): "That email and password don't match." · "Too many tries. Wait a few minutes and try
  again." · api unreachable: "Something went wrong on our side. Try again in a minute."
- **Focus after a failed submit** (no JS: page load; JS: re-render): `autoFocus` on the first
  invalid field, else on the password. That field's `aria-describedby` also lists `form-error`, so
  focus reads label + the sentence. Why `role=alert` and not a linked summary: forms have one or
  two fields, a list of links to them adds nothing; the alert covers the JS re-render, the focused
  field's description covers the full page load (an alert on load is not reliably announced).
- After any error the email stays filled in; every password field comes back empty.

## /sign-in — aside "welcome back"
- `h1` "Sign in". Lead: "Sign in to keep your bar and your own recipes with you."
- "Email" `type=email name=email autocomplete=username`; "Password" `type=password
  name=password autocomplete=current-password`, then `p.small` link "Forgot your password?" → `/forgot`.
- Button "Sign in". Links: "New here? Create an account" → `/sign-up?back=`. Success → `back` (local only).

## /sign-up — aside "new here"
- `h1` "Create an account". Lead: "An email and a password. We'll send a link to check the
  address is yours."
- "Email" (`autocomplete=username`); "Password" `autocomplete=new-password`, help
  `p.field__help#password-help` "10 to 128 characters. A few words you'll remember work well."
- Button "Create account". Links: "Already have an account? Sign in" → `/sign-in?back=`.
- **Check your email** (same for any address): aside "nearly there", `h1` "Check your email".
  "We sent a link to **[email]**." `ul.form-page__rules`: "It works once, for 24 hours." · "Open
  it on any device and type the same password you just chose." Then `p.small.muted` "Nothing
  after a few minutes? Check your spam folder, or " link "sign up again" " for a new link."

## /confirm?token — aside "last step"
- `h1` "Confirm your account". Lead: "Type the password you chose when you signed up. This link
  works once, so check it before you press the button."
- Hidden `token`; "Password" `autocomplete=current-password`. Button "Confirm and sign in".
  Success → `/` signed in. No token in the URL: the bad-link state at once.
- **Bad link** (wrong password, used, expired; one answer): `h1` "That link didn't work". "A
  confirm link works once, for 24 hours, and needs the password you chose when you signed up.
  This one can't be used again." `ButtonLink` "Sign up again" → `/sign-up`. Link "Already
  confirmed? Sign in". The `<title>` follows the `h1`.

## /forgot — aside "it happens"
- `h1` "Forgot your password?". Lead: "Tell us your email and we'll send a link to choose a new one."
- "Email" (`autocomplete=username`). Button "Send the link". Links: "Remembered it? Sign in".
- **Check your email** (same for any address, same speed): `h1` "Check your email". "If
  **[email]** has an account, we've sent it a link to choose a new password. It works once, for
  one hour." `p.small.muted` "Nothing after a few minutes? Check your spam folder, or " link "ask again" "."

## /reset?token — aside "fresh start"
- `h1` "Choose a new password". Lead: "Saving it signs you out on every other device."
- Hidden `token`; "New password" `autocomplete=new-password`, help as sign-up. Button "Save and
  sign in". Success → `/` signed in. Length error keeps the link usable (checked before sending).
- **Bad link**: `h1` "That link didn't work". "A reset link works once, for one hour. This one
  has been used or has run out." `ButtonLink` "Ask for a new link" → `/forgot`.

## Header (signed in and out)
- Order unchanged: wordmark · nav · search · `div.site-header__actions` (flex, gap 16, centre):
  theme button · account control · `ButtonLink` "Start my bar". The wrapper keeps the three on
  one line so "Sign out" never wraps alone.
- Signed out: link "Sign in" → `/sign-in?back=<path>` (`aria-current="page"` on /sign-in).
- Signed in: `form.inline-form[method=post]` (sign-out action, hidden `back`) >
  `button.site-header__link` "Sign out": looks like the link (no border or fill, `--ink`, 500 16,
  underline on hover), 44 px min height. No email or name in the header (shared screens, logs).
- 360 px: the header wraps as today; `.site-header__actions` takes its own full row,
  `justify-content: space-between` (theme left, "Start my bar" right). No hidden menu.

## Classes and accessibility
- New: `.form-page` `__aside` `__lead` `__form` `__links` `__rules`, `.form-error`,
  `.field__help`, `.site-header__actions`; `.field` / `.field__error` move from `search.css` to
  `packages/ui/src/styles.css` unchanged. Tokens only.
- axe 2.2 AA on every screen and state, light and dark, at 1440 and 360; one `h1` per page; every
  input has a visible label; target size ≥ 24 px (44 used).
