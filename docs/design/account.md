# Your account: export and delete — design spec (M2-08)

*Bar Napkin, both themes. `/account`, `/account/deleted`, the header's signed-in state and the
footer. Downloads are plain links; delete is one POST server action; all of it works without JS.
New pattern (`patterns.md`): Danger button. [BRACKETS] come from the account. Example: Ana,
`ana@example.test`.*

## /account (signed in only; signed out → `/sign-in?back=/account`)
- `<title>` "Your account · Stirred & Strained". `main` > `div.container.account` (max 1040, 16 px
  gutters, padding 64 top, 112 bottom). Head: `p.hand.form-page__aside[aria-hidden]` "your stuff"
  (hidden below 900 px) · `h1.h2` "Your account" · `p.account__email` "Signed in as
  **[ana@example.test]**." (DM Sans 18/28, email 700, `overflow-wrap: anywhere` for long addresses).
- Then `div.account__grid`: ≥900 two columns (`minmax(0,1fr) minmax(0,1fr)`, gap 48, `align-items:
  start`), export left so it is read first; below 900 one column in the same order, gap 32.
- **Export** `section.account__export[aria-labelledby=export-h]` in `NapkinCard tilt={-0.6}` (none
  below 900 px). `h2#export-h.account__h2` (Fraunces 600 28/34) "Take your data with you".
  `p` "Everything you've put in: your bar, the swaps you turned off, your recipes (deleted ones
  too, with their history), your favourites, ratings and notes, and your email and sign-ins."
  `ul.account__downloads` (flex, wrap, gap 12; full width below 900): two `a.btn.btn--secondary`
  with `download`, 44 px: "Download as JSON" → `/account/export`, `aria-describedby=json-help`;
  "Download as Markdown" → `/account/export/markdown`, `aria-describedby=md-help`. Under each,
  `p.field__help`: `#json-help` "For a backup or another app." · `#md-help` "To read or print."
  No status after a download: the browser shows it. Plain `a`, not `ButtonLink` (it takes no `download`).
- **Delete** `section.account__danger[aria-labelledby=delete-h]`: a flat `--card` panel (6 px
  radius, card shadow, 32 padding, 24 below 600 px), no tape, no tilt, no aside: nothing playful
  around a deletion. `h2#delete-h.account__h2` "Delete your account". `p#delete-what` "This
  deletes your account and everything above: your bar, swaps, recipes and their history,
  favourites, ratings and notes. It can't be undone, and we can't bring it back." `p` "Want a
  copy? " link "Download your data first" → `#export-h` "."
- `form.form-page__form` (POST, `noValidate`): Form-level error slot first · Text field "Your
  password" `type=password name=password autocomplete=current-password required`, help
  `p.field__help#password-help` "So no one else can do this from a screen you left signed in."
  · `label.account__tick` (flex, gap 12, min height 44, 16/24 `--ink`): `input[type=checkbox]
  name=understand value=yes required` (24 × 24, `accent-color: var(--ink)`, focus ring as
  everywhere) + "I understand my account and everything in it will be deleted for good." ·
  `Button type=submit` class `btn--danger` "Delete my account" (44 px, left; full width below
  900 px), `disabled` while pending. Success → 303 to `/account/deleted`, cookie cleared.
- **Errors** (re-render; password always empty, the tick kept as sent):
  - Empty password: field "Enter your password." · Wrong: field "That's not your password.
    Nothing was deleted." (field-level: the form has one credential, so it is that field's fault.)
  - No tick: `aria-invalid` on the checkbox + `p.field__error#understand-error` under the row
    "Tick the box to confirm. Nothing was deleted." Checked before anything is sent.
  - Form-level (`div.form-error#form-error[role=alert]`): 429 "Too many tries. Wait a few
    minutes and try again. Nothing was deleted." · api down "Something went wrong on our side.
    Nothing was deleted. Try again in a minute."
  - Focus after a failed submit, as auth-screens: `autoFocus` on the first invalid control
    (password, then checkbox), else on the password; its `aria-describedby` lists help, then
    its error, then `form-error` when present. Both errors at once: both shown, focus on password.
- Password `aria-describedby` also lists `delete-what`, so a screen-reader user who tabs
  straight into the form hears what goes.

## /account/deleted (one napkin card)
- Form page shape (`FormPage`, napkin card, tape, -0.8°, none below 900 px). No aside. `<title>`
  "Your account is deleted · Stirred & Strained"; `robots: noindex`. Header shows "Sign in".
- `h1.h2` "Your account is deleted". `p.form-page__lead` "We've deleted your account and
  everything in it, and signed you out on every device." `p` "You can still look up any recipe
  without an account." `ButtonLink` "Back to the start" → `/`.
- A signed-in visitor here is sent to `/account` (the page never tells a live account it is gone).

## Header and footer
- Signed in: `.site-header__actions` = theme · `span.site-header__account` (inline-flex, gap 16,
  `white-space: nowrap`) > `a.site-header__link` "Account" → `/account` (`aria-current="page"` on
  /account) + the "Sign out" form · "Start my bar". Never the email in the header. Below 400 px
  the actions row gets gap 12 and wraps; "Account" and "Sign out" stay together, 44 px each.
- Footer "The app" list, third item: "Your account" → `/account` (signed out it goes via sign-in).

## Classes and accessibility
- New: `.account` `__email` `__grid` `__export` `__h2` `__downloads` `__danger` `__tick`,
  `.site-header__account` (web); `.btn--danger` (`@stirred/ui`, `Button variant="danger"`).
  Reuse: `.form-page__aside` `__form`, `.field*`, `.form-error`, `.btn--secondary`, `.hand`.
- One `h1`; sections labelled by their `h2`; every control has a visible label; targets 44 px
  (≥24 always); axe 2.2 AA light and dark at 1440 and 360: page, both field errors, form-level
  error, deleted page. No horizontal scroll at 360. Colour never the only signal: the danger
  button says "Delete", the errors say "Nothing was deleted".
