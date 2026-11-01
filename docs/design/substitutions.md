# Substitutions — design spec (M2-05)

*Bar Napkin, both themes. `/bar` gains a Swaps section; the recipe page tags exact lines; the
landing demo and sticky note tell the truth about swaps. Every toggle is a POST server action that
works without JS. New pattern (`patterns.md`): Toggle list. [BRACKETS] come from `GET
/substitutions`, never typed in.*

## /bar: where it sits
- Last in the shelf column, after "Add a few at once": it is set once and rarely touched, so it
  never pushes Add or the bulk picker down. Same column at 1440 and 360 (DOM order).
- `section[aria-labelledby=swaps-h]` — `h2#swaps-h.bar-h2` "Swaps we count" · `p.bar-small` "When a
  recipe asks for a bottle you don't have, we'll count a close one you do, and the results say
  which. Recipes named for a bottle always need that bottle."
- The list lives in one closed `details.swaps__fold` on the `--card` panel (the `bulk__cat` summary
  row: 48 px, `--dash` divider, native marker): `summary` "Show all [n] swaps" / open "Hide the
  swaps" (two spans swapped by `details[open]`, as `matches__more`), then `span.muted` " · [k] off"
  when k > 0, so what is off shows while closed. Rendered `open` when the last action was a swap
  (the redirect carries `?swap=`) or a swap error, so after a toggle the row is still in view.

## Row (Toggle list)
- `form.swaps` (POST) > `ul.swaps__items` > `li.swap` (16 24 padding, `--dash` dividers, 64 min;
  flex, wrap, `justify-content: space-between`, gap 8 16). Order: by [replaces] name, then
  [substitute] name; it never reorders after a toggle.
- Left `div.swap__text` (`flex: 1 1 280px`, `min-width: 0`): `p.swap__pair` DM Sans 500 18/28
  "**[Rye Whiskey]** for **[Bourbon Whiskey]**" (`strong` 700, the substitute first); under it
  `p.swap__reason.small.muted` [reason], one line, wraps freely.
- Uses your bar (the substitute, or a brand under it, is on the shelf): `li.swap--yours` gets the
  `--rowhl` fill and, between pair and reason, `p.swap__yours.small.muted` "`<span
  aria-hidden="true">✓ </span>`You have [Rye Whiskey]". Words carry it; the fill is extra.
- Right `div.swap__ctl` (flex, gap 16, align center): state tag `span.swap__state` (pill, 999
  radius, 2 8 padding, 15/22 700): on = `--ink` fill, `--paper` text, "`<span
  aria-hidden="true">✓ </span>`On"; off (`.swap__state--off`) = 1.5 px `--ink` outline, `--card`
  fill, `--ink` text "Off" (the chip rule: state by word and fill, never colour alone). Then
  `button.linkish[type=submit]` "Turn off" / "Turn on" + `<span class="vh"> [Rye Whiskey] for
  [Bourbon Whiskey]</span>`. Off rows: `.swap__pair` stays `--ink` (no greying of facts).
- Button value: `name="off"` or `name="on"`, `value="[substitute]>[replaces]"`. The name carries the
  wanted state (the api takes `{allowed}`), so a stale second tab does what its label says.
- Below 600: `swap__ctl` wraps under the text, left-aligned; button 44 px tall (32 px ≥900).

## States
- **After a toggle** (status line, top of the shelf column, + " You can make [n] now."): off "[Rye
  Whiskey] won't stand in for [Bourbon Whiskey] any more." · on "[Rye Whiskey] can stand in for
  [Bourbon Whiskey] again." Already in that state: the same sentence. Edge gone (404): "That swap
  isn't on the list any more."
- **Signed out:** the same list, every tag "✓ On", no buttons, no disabled controls, no `form`.
  Above the fold `p.bar-small`: "These all count for now. **Sign in** or **create an account** to
  turn any of them off." → `/sign-in?back=/bar`, `/sign-up?back=/bar`. No `--rowhl` change.
- **List can't load:** in the fold's place `div.form-error` "We couldn't load the swaps just now.
  Your bar is fine. Reload the page in a minute." **Toggle failed:** `div.form-error[role=alert]
  [tabIndex=-1][autoFocus]` first in `form.swaps`, fold open: "Something went wrong on our side.
  Nothing changed. Try again in a minute."
- Focus: no JS, My Bar's rule (status line `autoFocus`). JS: the sentence goes to the one
  `role=status`; focus stays on the pressed button, whose label has flipped.

## Recipe page: exact lines
- In `ul.lines`, after the name (as "(optional)"): `<span class="muted"> (this one, no swaps)</span>`.
  Reads "Bourbon Whiskey (this one, no swaps)". Both tags: "(optional)" first.

## Landing demo
- Make-now `li` with swaps: after `· [method]` add `<span class="muted"> · using [X] for [Y]</span>`
  (names as the api gives them, never shortened; several joined ", "). Wraps inside the row.

## Landing sticky note 2 (title unchanged: "We know bourbon is whiskey.")
"Got bourbon? It counts as whiskey. Rye can stand in for it, and we'll say so; turn off any swap
you'd rather not. A drink named for its bottle needs that bottle, and nothing stands in for
Chartreuse."

## Classes and accessibility
- Reuse: `.bar-h2 .bar-small .muted .small .vh .linkish .form-error`, Status line, the bulk
  summary look, `matches__show/__hide` swap. New (`bar.css`, tokens only): `.swaps` `__fold`
  `__items`, `.swap` `--yours` `__text` `__pair` `__reason` `__yours` `__ctl` `__state`
  `__state--off`.
- One `h2` more; on/off, "you have" and errors are words; tick glyphs `aria-hidden`; tag text on
  `--ink`/`--paper` and `--ink`/`--card` clears 4.5:1 both themes; `--muted` on `--rowhl` clears
  4.5:1 both themes. axe 2.2 AA, light and dark, 1440 and 360, every state above.
