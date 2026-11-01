# M2-08 export-and-erase — plan

Acceptance: export everything a user owns as JSON and Markdown; account erase removes all user
rows after confirmation; tests prove both. Specs: `specs/auth`, `specs/bar`, `specs/my-recipes`,
`specs/marks`. ADR 0003 (isolation), 0005 (accounts). One migration (0008: a security definer
function that drops the scoped user's pending links); no new table, no new dependency.

## Scenarios
- **Export, JSON.** Given Ana is signed in with Gin and Campari on her bar, the swap Rye whiskey →
  Bourbon Whiskey turned off, "Ana's Negroni" (30 ml gin, 1 oz Campari as typed) created, edited
  and then deleted, and the house Negroni marked favourite, 4/5, note "Less Campari" (changed once,
  so the earlier note is kept for undo); when she downloads her data as JSON, then the file holds
  her email and account date, both bar items with names, the refused swap, the deleted recipe
  with its lines (canonical ml plus the unit she typed), `deletedAt` and all three history events
  with their saved specs, the mark with its earlier note, and her live sessions' dates (never a
  token). `GET /account/export`; the file is `stirred-and-strained-<date>.json`.
- **Export, Markdown.** The same data as a readable file: headed sections, amounts through
  `formatQuantity` in the unit she typed ("1 oz Campari"), the deleted recipe labelled deleted,
  her own text escaped so it reads as typed. `GET /account/export/markdown` (text/markdown).
- **Isolation.** Ben's bar, recipes and marks never appear in Ana's export; signed out, both
  export calls answer 401 and `/account` sends the visitor to sign in and back.
- **Erase, refused.** A wrong password answers 401 and removes nothing; without the "I
  understand" tick the form says so and nothing is sent; 10 wrong passwords in 15 minutes per
  user answer 429.
- **Erase.** Given Ana and Ben both have rows in every user-owned table and Ana has a pending
  reset link; when Ana confirms with her password and the tick, then no row for her remains in any
  table with a `user_id` column, nor in `app_user`, nor a link for her address in `auth_token`;
  her session ends (the cookie goes too) and the page says the account is gone; signing in with
  her old password fails; every one of Ben's rows is still there.
- **No table forgotten.** Every table with a `user_id` column references `app_user` with
  `on delete cascade` (read from the catalog), so a future user table cannot escape erase.
- **Rate-limit state** is per process, in memory, a count per address for at most an hour; it is
  never stored, so erase has nothing to remove there (stated in the spec).
- **Privacy.** The api logger stays off; no email, note or token is logged.

## Screens (ui-ux-designer pass inside Bar Napkin)
`/account`: signed-in email, "Take your data with you" (two download links), "Delete your
account" (password, tick, danger button), works without JavaScript. `/account/deleted`: one napkin
card. Header: "Account" beside "Sign out" when signed in. Footer "The app": "Your account".

## Tests
- db int: erase empties every user table for Ana and keeps Ben's (tables from the catalog);
  catalog check for cascades; pending links dropped.
- api int: export JSON and Markdown contents; isolation; 401 signed out; erase wrong password,
  429, success then sign-in fails.
- e2e: sign up, add a bottle, `/account`, download JSON (holds the email and the bottle), erase,
  signed out with the notice, sign-in fails; axe light/dark at 1440 and 360.
