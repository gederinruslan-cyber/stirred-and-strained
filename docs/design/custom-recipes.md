# Custom recipes — design spec (M2-06)

*Bar Napkin, both themes. Routes `/my-recipes`, `/my-recipes/new`, `/my-recipes/[id]`,
`/my-recipes/[id]/edit`. Every action is a POST server action that works without JS. New patterns
(`patterns.md`): Line rows, Error summary, Photo placeholder, History list. [BRACKETS] come from
`/my/recipes`, never typed in. Reached from the header: `nav.site-nav` "Recipes · My Bar · My
recipes" (always shown; signed out it lands on the prompt), and a `p.small` link "My recipes →"
under the `/bar` lead. At 360 px the nav must still wrap without horizontal scroll.*

## /my-recipes (list)
- `main.container.section` > `div.my-recipes__head`: `p.hand[aria-hidden]` "the ones you make at
  home" (hidden below 900) · `h1` "My recipes" · `p.bar-page__lead`-style lead "Your own specs,
  private to you. They show up in search and on your bar like ours." · primary `ButtonLink`
  "New recipe" → `/my-recipes/new`. `<title>` "My recipes · Stirred & Strained".
- Status line `p.my-recipes__status[role=status]` (Status line pattern) above the list. Copy:
  "Deleted [Ana's Negroni]." + `form.inline-form` > `button.linkish` "Undo`<span class="vh">
  deleting [name]</span>`" (POST restore, 24 px min ≥900, 44 below) · after Undo "[Name] is
  back." · after Restore "Restored [name]." Full load: `tabIndex=-1` + `autoFocus` on the status.
- `section[aria-labelledby=mine-h]` `h2#mine-h.vh` "Your recipes" > Result list `ol.results` >
  `li.result`: `span.photo-none.photo-none--thumb.result__photo` · `a.result__name` [name] →
  `/my-recipes/[id]` + `Tag kind="yours"` "yours!" · `p.result__meta` "[method] · [glass]" · right
  `span.result__abv` "[abv]% ABV". Order name then id.
- **Empty:** in the list's place `div.sticky.sticky--white` (no tilt): `p` Fraunces 22 "No recipes
  of your own yet." `p` "Write down the one you make at home. Pick the ingredients, give the
  amounts, and we'll work out how strong it is."
- **Deleted** (only when any): `section[aria-labelledby=deleted-h]` `h2#deleted-h.h2` "Deleted",
  `p.small.muted` "Nothing here is thrown away. Restore one to put it back in search and on your
  bar." `ul.results` > `li.result`: placeholder thumb · `span.result__name.muted` [name] (not a
  link) · `p.result__meta` "Deleted [1 Nov 2026]" · right `button.linkish` "Restore`<span
  class="vh"> [name]</span>`". After restore, focus is the status line.
- **Signed out:** head (no button) then `div.bar-note.sticky.sticky--yellow` "Your own recipes
  live in your account. **Sign in** or **create an account** to write one down." →
  `/sign-in?back=/my-recipes`, `/sign-up?back=…`; the other routes redirect there with `back`.
  Another user's id or a bad id: the Not-found page, copy as `recipe-page.md`.

## /my-recipes/new and /my-recipes/[id]/edit (one form)
- `main.container.section` > `form.recipe-form.napkin` (POST, `noValidate`; tape, no tilt, max 880):
  `h1` "New recipe" / "Edit [name]"; `<title>` "New recipe · …" / "Edit [name] · …".
- Error summary (new) first, then fields in order:
  1. Text field "Name" `name=name`, max-width 560.
  2. `div.recipe-form__row` (flex, wrap, gap 16): Select "Method" (first option "Choose a method"
     `value=""`, then shaken · stirred · built · blended · muddled · layered) · Select "Glass"
     (first option "No glass in particular" `value=""`, then [glasses]).
  3. `fieldset.line-rows` legend `h2`-style "What goes in"; help `p.field__help#lines-help` "One
     ingredient per row. Leave the rest blank; we skip empty rows." `<datalist id="ingredient-paths">`
     `option value="[name]" label="[path] › [name]"` (as My Bar). `ol.line-rows__list` > `li.line-row`
     per line (existing lines, then 4 blank, at least 8): Text field "Ingredient [n]" `list=…` ·
     number "Amount [n]" (`inputmode=decimal step=any min=0`, 96 px, edit shows the entered value,
     e.g. "1") · Select "Unit [n]" (ml · cl · oz · dash · barspoon · drop · piece · top; default ml;
     edit shows `entered_unit`, e.g. "oz"; `min-width` 112 here) · `label.check` checkbox
     "Optional`<span class="vh"> [n]</span>`". Ids `line-[n]-ingredient|amount|unit`.
  4. Text area "How to make it" `name=steps`, 6 rows, 16 radius, Text field styling; help "One step
     per line. Leave it empty and we'll write the steps from the method and glass."
  5. `div.recipe-form__actions`: primary submit "Save recipe" · `a` "Cancel" (secondary pill
     `ButtonLink`) → the recipe page (edit) or `/my-recipes` (new).
- **Rows ≥900:** a grid row per line, `grid-template-columns: minmax(0,1fr) 96px 112px auto`, gap
  12, 52 px rows on `--dash` dividers; one `div.line-rows__head[aria-hidden]` above in small caps
  700 `--muted` ("Ingredient · Amount · Unit · Optional"); each field's `label` text is `.vh` (the
  label still says "Ingredient 3", so every control has its own name).
- **Rows below 900 (360 px):** stacked cards, not a table: each `li.line-row` is a 12 16 padded block
  with `--dash` divider, a visible `span.line-row__num` Fraunces 600 "Line [n]" (`aria-hidden`; the
  labels carry the number), ingredient full width, then amount + unit side by side (`1 1 96px` /
  `1 1 112px`), Optional under them. Labels visible ("Ingredient", `.vh` number). No horizontal scroll.
- **Errors** (re-render, every value kept; the api's 400s mapped to words):
  - Summary `div.form-error.error-summary[role=alert][tabIndex=-1]` focused on load: `p` "Fix [n]
    things before saving:" ("Fix this before saving:" for one) + `ul` of `a href="#[field id]"`
    whose text is the error itself.
  - Per field `aria-invalid` + `p.field__error` in the row (spans the row's full width): name
    empty "Give it a name." · over 80 "Keep the name to 80 characters or fewer." · no method
    "Choose a method." · unknown ingredient "We don't know “[text]”. Pick one from the list." ·
    amount missing (unit not top) "Give an amount for [ingredient]." · not a number or ≤ 0
    "Use a number above 0, like 30 or 0.75." · no line with volume, under the legend
    `p.field__error#lines-error`: "Add at least one line in ml, cl or oz so we can work out how
    strong it is." · over 30 lines "A recipe can have up to 30 lines." · our side down: Form-level
    error "Something went wrong on our side. Nothing was saved. Try again in a minute."

## /my-recipes/[id] (the spec)
- Recipe page layout (`recipe-page.md`) unchanged: `article.napkin.tilt.recipe__card` with `h1`
  + `Tag yours` "yours!" beside it, `p.recipe__meta`, "What goes in" with the unit control (`back`
  = this page), `ul.lines`, `div.strength` + `span.strength__model`, "How to make it" `ol.steps`
  (user text rendered as text, one `li` per non-empty line; derived steps when empty).
- Status line above `.recipe` (full width): "Saved [name]." (create) · "Saved your changes to
  [name]." (edit) · "Restored [name]." Full load focuses it.
- `aside.recipe__side`: `div.photo-frame.recipe__photo.photo-none` (4:5) · `div.recipe__actions`:
  `ButtonLink` secondary "Edit recipe" → `/edit` and `form.inline-form` > `button.btn.btn--secondary`
  "Delete recipe" (no confirm: Undo follows on the list) · History list (below). No "Where it's
  from": it's theirs. A deleted id shows the page with a status "This recipe is deleted." +
  `button.linkish` "Restore" and no Edit/Delete.
- **History** `section[aria-labelledby=history-h]` `h2#history-h` "History" > `ol.history`
  (newest first, `--dash` dividers): Created/Edited entries are `details.history__entry`, `summary`
  (44 px) "Edited · `<time datetime=[iso]>`1 Nov 2026`</time>`" (`.history__when`, `tabular-nums`);
  the newest also says " (this version)". Body `div.history__spec`: meta line, `ul.lines` in the
  visitor's unit, `ol.steps` at 15/22. Deleted/Restored are plain `li` "Deleted · [date]".

## Placeholder, accessibility, classes
- **Photo placeholder:** `.photo-none` (in `@stirred/ui` styles: four callers — list, page, search,
  matches): `display:grid; place-items:center; color:var(--muted); background: radial-gradient(
  var(--dots) 1.2px, transparent 1.4px) 0 0/14px 14px, var(--seg)`. Inline SVG `aria-hidden
  focusable=false`, width 36% (60% in `--thumb`), `fill:none; stroke:currentColor; stroke-width:1.5;
  vector-effect:non-scaling-stroke; stroke-linecap:round`, viewBox `0 0 64 80`: rim `M12 22H52`,
  sides `M12 22 16 70q0 4 4 4h24q4 0 4-4l4-48`, liquid `M14.5 40h35` dashed `3 4`, ice `rect x=22
  y=44 w=14 h=14 rx=2 rotate(-8)`. Frame only: `span.photo-none__hand` Caveat 28 `--accent` "yours!"
  under the glass (hidden in `--thumb` and below 900). `.photo-none--thumb` 56 × 70, 3 px radius.
  The same thumb replaces the `img` on `yours` rows in search and matches. No `alt`: no image.
- One `h1`; sections labelled by `h2`; row controls named "[Field] [n]"; targets ≥24 px (44 below
  900); states in words; 16 px inputs; axe 2.2 AA light/dark, 1440 and 360, list/form/page states.
- New classes (page `my-recipes.css` unless noted): `.my-recipes__head` `__status`, `.recipe-form`
  `__row` `__actions`, `.line-rows` `__head` `__list`, `.line-row` `__num`, `.error-summary`,
  `.textarea`, `.recipe__actions`, `.history` `__entry` `__when` `__spec`, `.photo-none`
  `--thumb` `__hand` (ui). Reuse: `.results .result* .linkish .check .bar-note .field* .select
  .form-error .tag--yours .photo-frame .recipe* .lines .strength .steps .sticky* .inline-form`.
