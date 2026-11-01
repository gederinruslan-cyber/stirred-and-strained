# Search page — design spec (M1-09)

*Bar Napkin, both themes, `/recipes`, one GET form that works without JS. New patterns (`patterns.md`):
Filter column, Text field, Result list. [BRACKETS] come from the api, never typed in.*

## Layout
- **1440:** `main.container.section` > `form.finder[role=search][aria-label="Recipe search"]`
  (GET `/recipes`): `div.finder__bar` then `div.finder__body` (flex, gap 48): `details.filters`
  (`0 0 300px`) · `section.finder__results[aria-labelledby=results-h]` (`1 1 600px`, `min-width: 0`).
- **360 px** (below 900): stacked; `details.filters` collapsed, `summary` a 44 px secondary pill
  "Filters" or "Filters ([k] on)"; results below.
- Server renders `<details class="filters" open>`; ≥900 px hides `summary`. A small script drops
  `open` below 900 px when no filter is active (re-adds on widen). No JS: open, nothing lost.

## Bar
1. `h1` "Find a recipe".
2. Search row: `SearchInput name="q" label="Recipe name"` placeholder "Negroni, daiquiri…",
   `id="q"`, value kept, `max-width: 560px` here, 44 px, `aria-keyshortcuts="/"`; then primary
   submit "Search" (first submit in the DOM, so Enter anywhere submits).
3. Hint (JS-rendered, hidden below 900): `p.finder__hint.small.muted` "Press <kbd>/</kbd> to search
   · `button.linkish` "Turn off"". "/" focuses `#q` unless focus is in a text field; "Turn off"
   is kept in `localStorage` (WCAG 2.1.4). The header search box stays as it is.

## Filters (`details.filters`, inside the form, in this order)
- Head: `h2` "Filters" (`.vh` below 900) · link "Clear all" → `/recipes`, only when any is active.
- **Ingredients** (fieldset "Ingredients"), help `p.small.muted#ing-help` "Pick a bottle or a kind,
  like whiskey; everything under it counts." Text fields (`aria-describedby="ing-help"`, shared
  `<datalist id="ingredient-names">` of `option value="[name]"`): "With" `name="include"` "e.g.
  whiskey"; "Without" `name="exclude"` "e.g. Campari". Enter adds one. Chosen ones sit under their
  field as checked `Chip`s (same name, `value="[id]"`, text "[name]"); uncheck + Apply removes (JS:
  at once). Checkboxes, not buttons, so Enter never hits a remove. The web maps names (case and
  accents ignored) to ids and drops empty values. Unknown: `aria-invalid`, `p.field__error` "We
  don't have “[text]” in the bar yet. Pick a name from the list." Results ignore it (no 400).
- **Facets**, `fieldset.facet` each (legend Fraunces 600 18/24), in order: "Base spirit" (`base`),
  Strength, "Method", "Glass", "Family", "Flavour" (`method`, `glass`, `family`, `flavour`). Values
  are wrapping `Chip`s: "[Label] `span.chip__count`[n]`<span class="vh"> recipes</span>`" (count
  `tabular-nums`, 400, `currentColor`), by count desc then label. Top 8, the rest in
  `details.facet__more` > `summary` "[n] more" (open if a hidden value is checked). 0-count values
  hide unless checked; a group with under 2 values and none checked is not rendered.
- **Strength**: legend "Strength (% ABV)", Text fields "From" `abvMin`, "To" `abvMax` side by side,
  `type="number" min="0" max="100" step="0.5" inputmode="decimal"`, 96 px, `%` suffix `aria-hidden`.
  From > To: the server swaps them.
- Column foot: primary submit "Apply", full width, always shown. **JS:** a checkbox change fetches
  and swaps results and counts, `replaceState`s the URL, keeps focus (WCAG 3.2.2); text and number
  fields apply on Enter or Apply only.

## Results (`section.finder__results`)
- `h2#results-h.finder__count` (Fraunces 24/32): "[n] recipes" ("1 recipe"); with q "[n] recipes
  for “[q]”"; paged, `span.muted` " · [from]–[to] shown". JS
  writes the same sentence to `p.vh[role=status]`.
- `ol.results` (Result list): `li.result` — `img.result__photo` (56 × 70 thumbnail, empty alt),
  `a.result__name` [name] → `/recipes/<id>`;
  `p.result__meta` "[method] · [glass]" lower-case (no glass: "[method]"), then " · [Family]" if any; right:
  `span.result__abv` "[abv]% ABV" (one decimal, `abvText`). Order name then id.
- **Paging**: Previous/Next (name order, so "Newer/Older" means nothing), 24 per page, `page`
  param. `nav.pager[aria-label="Pages"]`: "← Previous" · "Page [p] of [P]" · "Next →"; links keep
  every other param; an edge link is absent, never disabled; no pager when P = 1; Apply resets to 1.
- **Empty** (`div.finder__empty`, `sticky sticky--white`, no tilt): `p` Fraunces 22 "Nothing matches
  all of that." then "Try loosening one thing:" and `ul` of links, each the current URL minus one
  filter, in order exclude, include, facet values, strength, q: "Allow [Campari]", "Drop
  [Bourbon]", "Drop [Shaken]", "Any strength", "All names, not just “[q]”"; last "Clear all
  filters" → `/recipes`.

## Classes, accessibility, SEO
- New (page CSS, tokens only): `.finder` `__bar` `__body` `__hint` `__results` `__count` `__empty`,
  `.filters`, `.facet`, `.facet__more`, `.chip__count`, `.field`, `.field__error`, `.results`,
  `.result` `__name` `__meta` `__abv`, `.pager`, `.linkish`. Styles per `patterns.md`.
- `<title>` "Find a recipe · Stirred & Strained" (with q: "“[q]” · " first); axe 2.2 AA both themes.
