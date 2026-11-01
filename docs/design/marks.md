# Favourites, ratings, notes — design spec (M2-07)

*Bar Napkin, both themes. `/recipes/<id>`, `/my-recipes/<id>`, `/my-recipes`, `/recipes`. Every
control is a POST server action (or the search GET form) that works without JS; nothing submits on
change (WCAG 3.2.2). New patterns (`patterns.md`): Star rating, Mark tags. [BRACKETS] come from
`/my/marks`, never typed in. Example: Ana, Negroni, 4, "Less Campari next time, 25 ml".*

## "Your take" panel (both recipe pages)
- **Where:** `section.marks.sticky.sticky--white[aria-labelledby=marks-h]` (no tilt, like "Where
  it's from") in `aside.recipe__side`. House: photo · **Your take** · Where it's from · Variations.
  Own: photo · `recipe__actions` · **Your take** · History. Deleted own recipe: no panel.
  Below 900 px the aside stacks under the card, so a Jump link "Your take ↓" → `#marks-h` sits
  under `p.recipe__meta` (house and own).
- `h2#marks-h.recipe__h2` "Your take". Then, in order:
  1. **Status line** `p.marks__status[role=status]` (pattern), only after a mark post; full load
     `tabIndex=-1` + `autoFocus` (it is in the panel, so focus lands where the user was). Copy:
     "[Negroni] is in your favourites." · "[Negroni] is out of your favourites." · "Saved your take
     on [Negroni]." (rating and/or note set, changed or cleared).
  2. **Favourite** `form.inline-form.marks__fav` (POST; hidden `id`, `favourite=true|false` = the
     wanted state): one `button.btn.btn--secondary` (44 px), the label changes, no `aria-pressed`
     (a changing label and pressed state together read twice). Off: "`<span aria-hidden>♡</span>`
     Add to favourites". On: "`<span aria-hidden>♥</span>` Remove from favourites" with `--ink`
     fill and `--paper` text, so the state shows in words and shape, not hue.
  3. **Rating + note** `form.marks__form` (POST, `noValidate`; hidden `id`):
     - Star rating `fieldset.stars` legend "Your rating" (DM Sans 500 15/22, like a field
       label): radios `name=rating` values 1–5 then empty, labels "1★" … "5★" (`★` `aria-hidden`,
       `.vh` " star" / " stars" so names are "1 star" … "5 stars") and "No rating". The current
       value is checked; none saved = "No rating" checked. Arrow keys move, Tab leaves the group.
     - Text area `label.field` "Your note" > `textarea.textarea#note name=note rows=4` (no
       `maxlength`: a paste is never cut silently); `p.field__help#note-help` "Only you can see
       this. Up to 1000 characters." Note shown as plain text (`<b>x</b>` reads literally).
     - Primary submit "Save" (44 px), left-aligned under the field.
  4. **Errors** (re-render, rating and typed note kept): over 1000 → `aria-invalid` +
     `p.field__error#note-error` "Keep the note to 1000 characters or fewer.", `aria-describedby=
     "note-help note-error"`, `autoFocus` on the textarea. Our side down → Form-level error first
     in the form it came from: "Something went wrong on our side. Nothing changed. Try again in a
     minute." Never a status line.
- **Signed out:** same `h2`, then `div.bar-note.sticky.sticky--yellow` > `p` "**Sign in** to keep a
  favourite, a rating and a note." (`/sign-in?back=/recipes/[id]`) · " New here? **Create an
  account**." (`/sign-up?back=…`). No disabled controls.

## /my-recipes
- Lead becomes "Your own specs and your favourites, private to you. Your specs show up in search
  and on your bar like ours."
- After "Your recipes" and before "Deleted": `section[aria-labelledby=fav-h]` `h2#fav-h.my-recipes__h2`
  "Favourites" > `ol.results` (Result list) by name then id. Row: `RecipeThumb` (photo, or
  `.photo-none--thumb` for own) · `a.result__name` [name] → `/recipes/<id>` or `/my-recipes/<id>`
  (+ `Tag yours` "yours!" for own) + Mark tags · `p.result__meta` "[method] · [glass]" · when
  noted `p.result__note` (15/22 `--muted`, 2-line clamp, full text in the DOM) "Your note: [note]"
  · right `span.result__abv`.
- **Empty:** `div.sticky.sticky--white.my-recipes__empty`: `p` Fraunces 22 "No favourites yet."
  `p` "Press “Add to favourites” on any recipe and it lands here."
- **Rated or noted** (only when any not-favourite mark exists): `section[aria-labelledby=rated-h]`
  `h2#rated-h` "Rated or noted", same rows, by rating desc (unrated last), then name. No empty copy.
- Deleted own recipes leave both lists (and come back with every mark on restore).

## /recipes (search)
- **Yours** `fieldset.facet` legend "Yours", signed in only, first in `details.filters` (before
  Ingredients: short and personal). Chips `name=mark`: "Favourites [n]" (`favourite`), "Rated 4+
  [n]" (`rated4`), `.chip__count` + `.vh` " recipes", OR within the group, AND with the rest.
  Rendered while any count > 0 or one is checked (the "under 2 values" rule does not apply).
  Counts toward "Filters ([k] on)"; empty-state links "Drop Favourites", "Drop Rated 4+".
- **Result rows:** after the name (and "yours!") the Mark tags "♥" and "4★" (`.vh` ", in your
  favourites", ", you rated it 4 of 5"). Signed out: never shown.

## Style, accessibility, classes
- Mark tags and Star rating per `patterns.md`; tokens only, both themes. "No rating" sits after 5★
  with 8 px extra gap. At 360 px: 1★–5★ on one row, "No rating" wraps; favourite button and Save
  full width; textarea 100%; no horizontal scroll; targets 44 px below 900, ≥24 px always.
- `--accent` on `--card`, `--ink` on `--seg`, `--paper` on `--ink` clear 4.5:1 in both themes; axe
  2.2 AA light/dark at 1440 and 360: signed in, signed out, note error.
- New: `.marks` `__status` `__fav` `__form`, `.stars`, `.mark-tags`, `.result__note`. `.textarea`
  moves to `@stirred/ui` styles (second page). Reuse: `.sticky* .bar-note .field* .form-error
  .inline-form .btn* .results .result* .facet .chip* .tag--yours .recipe__h2 .my-recipes__h2`.
