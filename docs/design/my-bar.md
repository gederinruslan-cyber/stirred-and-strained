# My Bar — design spec (M2-03)

*Bar Napkin, both themes, `/bar`. Every action is a POST server action that works without JS; JS
only keeps focus in place. New patterns (`patterns.md`): Status line, Suggestion list, Check tree,
Shelf list. [BRACKETS] come from the api (`GET /bar`, `GET /ingredients`), never typed in.*

## Layout
- **1440:** `main.container.section` > `div.bar-page__head` then `div.bar-page` (flex, wrap, gap
  48): `div.bar-page__shelf` (`0 1 560px`, `min-width: 0`). **M2-04 slot:** its results (you can
  make, one bottle away, buy next) arrive as the second child `section.bar-page__results`
  (`1 1 560px`) to the right, like results beside filters. Not designed here, not rendered in M2-03;
  until then the shelf column caps at 640 px, left-aligned.
- **360 px** (below 900): one column in DOM order; 16 px gutter; every button and row 44 px; no
  tilt, no Caveat. M2-04's results go below the shelf column.
- Head: `p.hand.bar-page__aside[aria-hidden]` "your shelf, written down" (hidden below 900) ·
  `h1` "My Bar" · `p.bar-page__lead` (18/28, `--muted`, max 560) lead "Add what you've got. Type a name, or open a category and tick
  a few." `<title>` "My Bar · Stirred & Strained".

## Shelf column, top to bottom
1. **Signed-out note** (signed out only): `div.bar-note.sticky.sticky--yellow` (no tilt, no
   numeral) > `p`: "You're not signed in, so this bar lives on this device for 30 days after your
   last change. **Create an account** to keep it, or **sign in**; either way it moves into your
   account." Links → `/sign-up?back=/bar`, `/sign-in?back=/bar`. Cookie is rewritten on every
   change, so "after your last change" is exact. Signed in: nothing here.
2. **Status line** (after any action; one at a time; see States): `p.bar-status[role=status]`.
3. `section[aria-labelledby=add-h]` — `h2#add-h.h2` "Add to your bar". `form.bar-add` (POST,
   `noValidate`), row `div.bar-add__row` (flex, wrap, gap 12, like the search row; stacked full width below 900): Text field label "Bottle or ingredient",
   `name="name"`, placeholder "Bourbon, Campari, limes…", `autocomplete=off`, `list="bar-names"`,
   max-width 440; primary submit "Add". Help `p.field__help#add-help`: "Know the exact bottle?
   Add that. A kind like “Whiskey” only counts where a recipe asks for any whiskey." `<datalist
   id="bar-names">`: `option value="[name]" label="[path] › [name]"`, e.g. value "Bourbon Whiskey",
   label "Spirits › Whiskey › Bourbon Whiskey"; root-level items label = name. Browsers differ in
   showing `label`; the server list (below) always shows the path. Match: trimmed, case and
   accents ignored, exactly one name.
4. `section[aria-labelledby=shelf-h]` — `h2#shelf-h.h2` "On your shelf" + `span.muted` " · [n]
   ingredients" ("1 ingredient"). `form.shelf` (POST, one form, each row its own submit) on a
   `--card` panel (Result list shell: 6 px radius, card shadow, no tape). Per category, by name
   (root items with no children last, under "Everything else"): `h3.shelf__cat` Fraunces 600
   20/28, then `ul.shelf__items` > `li.shelf__item` (16 24 padding, `--dash` dividers, 56 px
   min): `span.shelf__name` [name] DM Sans 500 18/28; under it `span.path.small.muted` [path],
   ancestors only ("Spirits › Whiskey"); right `button.shelf__remove[name=remove][value=[id]]` (looks like a link: `--accent`, 500 16, underline, no border)
   "Remove`<span class="vh"> [name]</span>`", 44 px tall. Items by name.
5. `section[aria-labelledby=bulk-h]` — `h2#bulk-h.h2` "Add a few at once", `p.small.muted` "Open a
   category, tick what you have, then Add ticked." One `form.bulk` (POST) wraps every
   `details.bulk__cat` (closed by default; categories with children by name, then "Everything
   else"), on the same `--card` panel, `--dash` dividers. `summary` 48 px row: Fraunces 600 18/24
   [Category] · right `span.bulk__count.muted` (`tabular-nums`) [n]`<span class="vh"> ingredients</span>`, native
   marker kept. Body: `fieldset` (`legend.vh` [Category]) > Check tree of everything under it:
   nested `ul` by depth (type at 0, brands 24 px in), each `label.check` with a native checkbox
   `name="ingredients" value="[id]"` + [name]; on the bar already: + `span.small.muted`
   "✓<span> on your bar</span>" (tick `aria-hidden`), still tickable, adding again does nothing.
   ≥900 px the tree sets in `columns: 2 260px`, each type's `li` `break-inside: avoid`. Foot of
   each `details`: primary submit "Add ticked" (all of them submit the whole form, so ticks in
   other categories count too).

## States
- **Empty bar:** in `form.shelf`'s place a `div.sticky.sticky--white` (no tilt): `p` Fraunces 22
  "Nothing on your shelf yet." `p` "Type a name above, or open a category below and tick what you
  have." Count reads " · 0 ingredients".
- **Signed in:** no note; otherwise identical. **Signed out:** note shown; same actions on the
  `shelf` cookie.
- **After add:** "Added Bourbon Whiskey." Already there: "Bourbon Whiskey was already on your
  bar." Field comes back empty. **After bulk:** "Added 3: Gin, Light Rum and Tequila Blanco."
  (over 5: "Added [n] to your bar."); some already there: "+ [names] [was/were] already there."
  Ticks clear. **After remove:** "Gin removed." Gone already (404, another tab): "Gin wasn't on
  your bar any more."
- **Unknown name, suggestions** (re-render, no redirect): input keeps the text, `aria-invalid`,
  `p.field__error#add-error` "No exact match for “[text]”. Did you mean one of these?" then
  `ul.suggest` (up to 8 of the api's 20, in its order) > `li`: `button.btn.btn--secondary
  [name=pick][value=[id]]` "Add [name]" + `span.path.small.muted#s-[id]` "[path] › [name]"
  referenced by the button's `aria-describedby`. Same name in two places (ambiguous): this list.
- **No suggestions:** `p.field__error` "We don't have “[text]” in the bar yet. Try a shorter word,
  like “whiskey”, or open a category below." Empty submit: "Type a name first."
- **Bulk with nothing ticked:** `div.form-error[role=alert]` first in `form.bulk`: "Tick at least
  one, then press Add ticked."
- **Our side down:** `div.form-error` in the form used: "Something went wrong on our side. Nothing
  changed. Try again in a minute." Bar can't load: same box in the shelf section, "We couldn't
  load your bar just now. Reload the page in a minute."

## Focus and announcements
- No JS (full load): the status line has `tabIndex=-1` + `autoFocus`; on a field error,
  `autoFocus` on the input, its `aria-describedby` = `add-help add-error`; bulk error focuses the
  alert (`tabIndex=-1`). JS: the same text goes to the one `role=status`; after remove focus moves
  to the next row's Remove, else the previous, else `h2#shelf-h`; after add focus stays in the field.
- `span.path` separators are `<span aria-hidden="true"> › </span><span class="vh">, </span>`, so a
  path reads "Spirits, Whiskey".

## Classes and accessibility
- Reuse: `.container .section .h2 .hand .muted .small .vh .btn .btn--primary
  .btn--secondary .field .field__help .field__error .form-error .sticky--yellow .sticky--white`, `Button`, `ButtonLink`. New (page `bar.css`, tokens only):
  `.bar-page` `__head` `__aside` `__lead` `__shelf` `__results`, `.bar-note`, `.bar-status`, `.bar-add` `__row`, `.shelf`
  `__cat` `__items` `__item` `__name`, `.path`, `.suggest`, `.bulk` `__cat` `__count`, `.shelf__remove`, `.check`. Lookalikes of `.linkish`, `.chip__count`, `.hero__sub` and `.form-page__aside` live in other pages’ CSS; copied, not imported (second caller).
- One `h1`; three `h2` sections; targets ≥24 px (44 used, check rows 32 px ≥900, 44 below);
  focus ring everywhere; "on your bar", errors and status are words, never colour. axe 2.2 AA,
  light and dark, 1440 and 360, every state above.
