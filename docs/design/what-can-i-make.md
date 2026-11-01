# What can I make — design spec (M2-04)

*Bar Napkin, both themes, the results column of `/bar` (`my-bar.md`). Server-rendered from
`GET /bar/matches` (signed in) or `GET /shelf/matches` (signed out, the shelf cookie); every
"Add" is a POST to My Bar's add action and works without JS. New patterns (`patterns.md`): Match
list, Jump link. [BRACKETS] come from the api, never typed in.*

## Layout
- **1440:** `section#results.bar-page__results.matches[aria-label="What you can make"]`
  (`1 1 560px`, `min-width: 0`), right of the shelf column; the shelf column's 640 px cap goes.
  Three `section`s top to bottom, 48 apart: You can make · One bottle away · Buy next. Above the
  first, `p.hand.matches__aside[aria-hidden]` "you can make [n]!" (only when n > 0).
- **360 px** (below 900): the same three, same order, below the shelf column; no aside; rows,
  buttons and summaries 44 px. Under the head lead, Jump link `a.bar-page__jump` "See what you can
  make ↓" → `#results` (below 900 only, hidden in the empty-bar state).

## Sections, top to bottom
1. `section[aria-labelledby=make-h]` — `h2#make-h.h2` "You can make [n]`<span class="vh">
   recipes</span>`". Match list (`div.matches__panel` > `ol.results`): `li.result` =
   `img.result__photo` (56 × 70, `/photos/recipes/thumbs/[id].jpg`, empty alt, lazy) ·
   `a.result__name` [name] → `/recipes/[id]` · `p.result__meta` "[method] · [glass]" lower-case
   (no glass: "[method]") · right `span.result__abv` "[abv]% ABV" (one decimal, `abvText`, the
   recipe page's number). Relies on a swap: under the meta `p.result__swap.small.muted` "using
   [X] for [Y]"; several joined ", " ("using Rye Whiskey for Bourbon Whiskey, Simple Syrup for
   Sugar"). [X] is what's on the bar, [Y] what the recipe asks for. Engine order (name, then id).
2. `section[aria-labelledby=away-h]` — `h2#away-h.h2` "One bottle away" + `span.muted` " · [n]
   recipes" ("1 recipe"). Same Match list; meta is `p.result__missing` "`<span
   aria-hidden="true">+ </span><span class="vh">needs </span>`[missing]"; right, in place of ABV,
   `button.linkish[name=pick][value=[missing.id]]` "Add [missing]". One `form.matches__add` (POST,
   My Bar's add action, the Suggestion list's `pick` field) wraps the panel; each button submits
   only its own value.
3. `section[aria-labelledby=buy-h]` — `h2#buy-h.h2` "Buy next", `p.small.muted` "The bottles that
   finish the most recipes one bottle away, most first." `TableCard` (ruled card, no tilt here),
   caption Caveat "ranked by what each one adds", inside `form.matches__add`. Columns `th[scope=col]`:
   "Buy this" · "Adds" · "Recipes". Rows (top 10, api order): `th[scope=row]` [Bottle] · `td.amount`
   "[n] more recipes" ("1 more recipe") · `td` every recipe name linked → `/recipes/[id]`, ", "
   between, then on its own line `button.linkish[name=pick][value=[id]]` "Add [Bottle]".

## Long lists (no JS needed)
- A list of 15 or fewer shows whole. Over 15: the first 12 in `ol.results`, then in the same
  panel `details.matches__more` > `summary` (48 px row, `--dash` divider, native marker) "Show the
  other [n − 12]" / when open "Hide the other [n − 12]" (two spans swapped by `details[open]` in
  CSS), then `ol.results[start=13]` with the rest. Everything is in the DOM; find-in-page opens it.

## States
- **Empty bar:** no sections; `h2#make-h.h2` "What you can make" then `div.sticky.sticky--white`
  (no tilt) > `p` Fraunces 22 "Add a few bottles and we'll show what you can make."
- **Nothing yet** (makeNow empty): `h2#make-h` "Nothing you can make yet", `p.muted` "You're
  close on a few. See what's one bottle away below." Sections 2 and 3 as normal.
- **One away empty:** `p.muted` "Nothing's one bottle away right now." Buy next empty: `p.muted`
  "Nothing to suggest yet." (headings stay).
- **Api down** (bar loaded, matches failed): `div.form-error` in the column, no sections: "We
  couldn't work out what you can make just now. Your bar is fine. Reload the page in a minute."
  Bar itself can't load: the column is not rendered (shelf column shows its error).
- **Signed out:** identical, from the shelf cookie; the shelf column's note covers saving.
- **After "Add [bottle]":** the page re-renders; My Bar's status line "Added Bourbon Whiskey."
  Every status line (add, bulk, remove, from either column) appends " You can make [n] now."
  ("Nothing you can make yet." at 0), so the change in results is announced in words.

## Focus and announcements
- No JS: My Bar's rule (status line `autoFocus`). JS: the one `role=status` gets the sentence;
  after an Add from the results focus moves to `h2#make-h` (`tabIndex=-1`), since the row is gone.
- `details` summaries are native; the open/closed words are the state, not the marker alone.

## Classes and accessibility
- Reuse: `.results .result __photo __name __meta __abv`, `TableCard`, `.amount`, `.h2 .hand .muted
  .small .vh .sticky--white .form-error`, Status line, the add action. `.linkish` gets its third
  caller, so it moves to `@stirred/ui` styles (link look: `--accent` 500 16, underline, 44 px tall
  on touch, 32 px ≥900); `.shelf__remove` and search's "Turn off" use it. New (in `bar.css`,
  tokens only): `.matches` `__aside` `__panel` `__more` `__add`, `.result__swap`,
  `.result__missing`, `.bar-page__jump`.
- Voice: "recipes", never "drinks"; no "unlock", "grab", "tonight's round". ABV is printed, never
  handwritten. axe 2.2 AA, light and dark, 1440 and 360, every state above.

## Landing demo change
- Under the make-now `ul.demo__list`, when makeNow has more than the 5 shown:
  `p.small.muted.demo__more` "+ [n − 5] more". In that case the foot reads "Nothing's saved yet.
  **Start my bar** with these to see them all and keep them."; otherwise it stays as it is.
