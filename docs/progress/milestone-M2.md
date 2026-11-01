# Milestone M2 · My Bar

Tagged `m2`. Every M2 feature merged with green gates, a reviewer pass on each (one BLOCK in
M2-01, fixed before merge) and `pnpm verify:full` green on `main` after the last merge (97
integration and 70 e2e tests, incl. axe on every new screen in light and dark at 1440 and
360 px). The verifier walked the running app with two synthetic users: **VERIFIED**, no failures.

| ID | Feature | Merged |
|---|---|---|
| M2-01 | auth-core (ADR 0005) | `e60211c` |
| M2-02 | auth-screens | `4fe5126` |
| M2-03 | my-bar | `d7cf15b` |
| M2-04 | what-can-i-make | `84ce258` |
| M2-05 | substitutions (21 edges, 8 exact lines) | `98d70aa` |
| M2-06 | custom-recipes | `ee028fc` |
| M2-07 | favourites-ratings-notes | `7cf2f0d` |
| M2-08 | export-and-erase | `78d61c4` |
| — | after M1: demo links, a photo per recipe | `adb2f6d`, `b414c62` |

## Demo checklist

Start the stack with `docker compose up -d --build --wait`, open http://127.0.0.1:3300 in a
private window and answer the age question. Mail lands in Mailpit at http://127.0.0.1:8325.

1. **Shelf before sign-up.** On the landing demo tick a few bottles, follow "Start my bar with
   these"; on My Bar add a bottle by typing ("whisk" offers every whiskey) and bulk-add a category.
2. **What can I make.** Beside the shelf: every make-now recipe, one-away with the missing bottle
   and an Add button, buy next ranked by drinks unlocked. Add a bottle and watch the lists move.
3. **Sign up.** Sign up, open the confirm mail in Mailpit, confirm with your password; the shelf
   is now in your account. Sign out, sign in, then try "Forgot password" end to end.
4. **Substitutions.** With rye but no bourbon, Boulevardier says "using Rye whiskey for Bourbon
   Whiskey". Turn that swap off and it moves to one away. Champagne Cocktail shows "(this one,
   no swaps)" and is never made with sparkling wine. **Decide:** keep or drop the four loose
   swaps (brandy for cognac, sparkling wine for champagne and for prosecco, simple syrup for
   demerara syrup); the full list with reasons is in `data/seed/rules.json`.
5. **Custom recipe.** My recipes → new: amounts in oz, cl or ml, check its ABV and standard
   drinks, find it in search ("yours!") and in My Bar's results. Edit it, read History, delete
   it, Undo, delete again and Restore from Deleted.
6. **Your take.** On a house recipe: favourite, 4 stars, a note; change the note and Undo. See
   them in My recipes and the search "Yours" filter.
7. **Account.** Download JSON and Markdown and read them; delete the account (password + tick)
   and confirm you are signed out and the email can sign up again.
8. **Without JavaScript and at 360 px.** Repeat a sign-in, a bar add and a recipe save with
   JavaScript off; skim the bar and recipe form on a phone-width window in dark mode.

## Verifier (two synthetic users, running stack on `0f5e125`)

| Flow | Result |
|---|---|
| Sign-up, confirm, sign-in, reset (same answers for known and unknown emails; reused links refused) | PASS |
| Bar add, typeahead, bulk add, remove | PASS |
| Make now 17 / one away 73 / buy next 10 rows, recomputed independently in SQL | PASS |
| Parent/child, exact line, turning a swap off (14 / 68 recomputed) | PASS |
| Custom recipe strength by hand (19.956% ABV, 20.08 g; US 1.434, UK 2.544, AU 2.008) in ml/cl/oz | PASS |
| Custom recipe matching, owner-only search, edit, history, delete, undo, restore | PASS |
| Favourites, ratings, notes (escaped, undo, limits) | PASS |
| Export JSON and Markdown (own data only, no tokens) | PASS |
| Erase: zero rows left in every user table and auth links, other user untouched, nothing in `pg_dump` | PASS |
| Isolation: every user-owned endpoint with the other user's ids → 404; RLS as the app role | PASS |
| Rate limits, 30-day expiry, signed-out shelf merge, JavaScript/theme/360 px rendering | NOT CHECKED (no browser; covered by e2e) |

## Open
- NH-8: production email provider (money, privacy), decided before deploy (M3-04).
- Deploy notes from review: client address from X-Forwarded-For needs a trusted proxy; Secure
  cookie only when PUBLIC_ORIGIN is https; rate limits are per process (shared store before a
  second instance); erase does not clear in-memory rate-limit counts (expire within an hour).
- After confirming, a new account lands on `/`, not back on My Bar.
- Custom recipe form needs an amount on every line except "top"; History versions can be read,
  not restored; a note keeps only one Undo, not a history.
- Honeyed Coffee Gin & Tonic's honey line is not exact (named for an ingredient, not a bottle).
- `.linkish` and the textarea style live in page CSS instead of `@stirred/ui`.
- `next dev` regenerates an untracked `apps/web/AGENTS.md`.
