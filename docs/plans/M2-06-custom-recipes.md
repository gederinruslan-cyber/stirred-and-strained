# M2-06 custom-recipes

A signed-in user writes their own recipes: lines from the taxonomy, canonical amounts, strength
derived like a house recipe, private, never lost (soft delete with undo, every save kept).

## Decisions
- **Three new tables** (migration 0006, RLS on each): `user_recipe` (uuid id, user_id, name,
  method, glass, steps, created/updated, `deleted_at`), `user_recipe_line` (user_id, recipe,
  position, ingredient → `ingredient_node` restrict, `amount_ml` double precision or a counted
  value, `unit`, `entered_unit` so an edit shows "1 oz" back, optional) and `user_recipe_event`
  (created · edited · deleted · restored, with the saved spec as jsonb on created/edited).
  Double precision, not numeric(9,3): an oz is stored as 29.5735295625 ml, rounded only at display.
- **Never lost:** delete sets `deleted_at`; the list keeps a "Deleted" section with Restore, and
  the page after a delete offers Undo. Nothing is purged (account erase is M2-08).
- **API under `/my/recipes`**, every call scoped (ADR 0003); another user's id is 404. Input
  amounts may be ml, cl, oz or a counted unit; the api converts cl/oz with `@stirred/units`
  constants. Unknown ingredient → 400 `unknown_ingredient`; no line with volume (strength needs
  one) → 400 `no_volume`.
- **Search and matching:** `GET /recipes` and `GET /bar/matches` add the caller's live custom
  recipes, flagged `yours: true` (summaries and buy-next refs). Strength uses the same
  `finished()` as house recipes. Signed out: house only.
- **Web:** `/my-recipes` (list, deleted, New), `/my-recipes/new`, `/my-recipes/[id]` (the spec
  in the recipe page's layout, "yours!" tag, Edit, Delete, History), `/my-recipes/[id]/edit`.
  Ingredient fields are `<input list>` over every ingredient with its path (native typeahead,
  no JS); names resolve to ids in web as the search page does. Rows: the lines plus 4 blanks
  (8 minimum); blank rows are ignored. Steps are the user's plain text, one per line; empty →
  derived from method and glass like house recipes. A photo placeholder (Bar Napkin, aria-hidden)
  stands in on the page and thumbnails. Header "My Bar" area links "My recipes".

## Scenarios
- **Create.** Given Ana is signed in, When she saves "Ana's Negroni" built in a rocks glass with
  1 oz Gin, 30 ml Campari, 3 cl Sweet Vermouth, Then its page shows the lines in her unit, the
  strength by the same model as the house Negroni (within 0.1% ABV for a US visitor) and the
  "yours!" tag; the stored gin is 29.5735295625 ml and the edit form shows "1" "oz".
- **Edit + history.** When she changes Campari to 25 ml, Then the page shows 25 ml and History
  lists "Created" and "Edited" with each saved spec readable.
- **Delete, undo, restore.** Delete → "/my-recipes" says "Deleted Ana's Negroni." with Undo; Undo
  brings it back; a deleted recipe stays in "Deleted" with Restore, and is out of search and
  matches until restored.
- **Search and match.** Searching "ana" finds it, tagged yours, linking to /my-recipes/<id>; with
  gin, Campari and sweet vermouth on her bar it is in "You can make"; with Campari removed it is
  one bottle away (+ Campari). Bob's search and matches never show it.
- **Isolation.** Each table passes `expectIsolated`; Bob's GET/PUT/DELETE/restore of Ana's id
  answer 404 and change nothing; signed out answers 401.
- **Refusals.** Unknown ingredient 400; a recipe of only garnish pieces 400 `no_volume`; a
  name over 80 or more than 30 lines 400. A re-seed that would delete an ingredient a recipe uses
  fails.
- **Text is text.** Steps "<b>stir</b>" show literally.

## End-to-end check
Sign up; create a recipe via the form (no JS run too): page shows strength and "yours!"; edit it;
history shows two entries; it appears in search and in My Bar's make-now; delete then Undo.
Axe light/dark at 1440 and 360 on the list, form and page.
