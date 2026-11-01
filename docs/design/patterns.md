# Design system: Bar Napkin

*Approved 2026-11-01. **Every screen we ship uses this system**, in both themes. Layouts,
components, tokens, copy voice and states live here; features reuse them before inventing. A new
component, token or pattern extends this file in the feature that needs it and is called out in
its plan; nothing replaces it without a new approval. Reference mockup: `mockups/landing.dc.html`
(live canvas: https://claude.ai/artifact/K3BEoeahFwMgbopTtvuDUe, row "Chosen: A · Bar Napkin").*

## The idea
A recipe jotted on a bar napkin by a friend who knows their stuff: cream paper, dark ink, a
yellow highlighter, sticky notes, tape and a handwritten aside. Friendly and unofficial, but the
facts (amounts, strength, credits) are always set in clean, readable type. Dark theme is "the
napkin after closing time": warm charcoal paper, cream ink, coral accent.

## Principles
- **Casual voice, exact facts.** Headings and asides are relaxed; quantities, ABV, standard drinks
  and credits are precise and never handwritten-only.
- **Desktop-first.** Filters beside results, My Bar beside "what can I make", side-by-side
  compare. Usable at 360 px without horizontal scroll.
- **Trust is visible.** Recipe credit, finished ABV and standard drinks, AI labels.
- **Say "recipes", not "drinks"** when counting what a bottle unlocks; never imply drinking more.
- Illustrative numbers on marketing surfaces come from the engine, never typed in.

## Tokens
**Type (Google Fonts):** `Fraunces` 600 with SOFT 100 (display and headings; italic 500 for
credits) · `DM Sans` 400/500/700 (UI and body) · `Caveat` 500/700 (handwritten accents only).
Scale: display `clamp(48px, 6vw, 80px)`/0.98 · h2 `clamp(32px, 3.4vw, 44px)`/1.1 · card title
24–36 · body 18/28 · small 15/22 · accent (Caveat) 23–30. Amounts use DM Sans 700 with
`tabular-nums`.

| Token | Light | Dark | Use |
|---|---|---|---|
| `--paper` | `#FBF5E9` | `#1B1612` | page background |
| `--card` | `#FFFFFF` | `#26201A` | napkins, cards, inputs |
| `--ink` | `#2A211A` | `#F3EADB` | text, borders, selected chips |
| `--muted` | `#5E5145` | `#C2B4A2` | secondary text |
| `--note` | `#4A3F35` | `#D6C9B8` | text on sticky notes |
| `--accent` | `#C23B22` | `#FF8A6B` | primary button, links, handwritten accents, focus |
| `--accent-hover` | `#9E2C17` | `#FFA68D` | primary hover |
| `--on-accent` | `#FFFFFF` | `#1B1612` | text on accent |
| `--hl` | `#FFD84D` | `#6E5410` | highlighter stroke behind a key word |
| `--tape` | `rgba(255,216,77,.75)` | `rgba(255,216,77,.30)` | tape strips |
| `--dots` | `#F1E8D6` | `#2F2821` | napkin dot texture |
| `--dash` | `#D9CCB4` | `#4A3F33` | dashed row dividers (decorative) |
| `--sticky-y` | `#FFF3C4` | `#382F1C` | yellow sticky note, strength line |
| `--sticky-g` | `#E4F0E6` | `#1E2A22` | green sticky note |
| `--zero` | `#2E6B4F` | `#8FD1AE` | "make now" ticks |
| `--zero-text` | `#3E4A40` | `#C5D6C8` | unused since zero-proof was dropped (2026-11-01) |
| `--seg` | `#F4ECDD` | `#332B23` | segmented-control track, ruled lines |
| `--rowhl` | `#FFFAE6` | `#30281A` | highlighted row ("yours!") |
| `--shadow` | `rgba(42,33,26,.12)` | `rgba(0,0,0,.40)` | card shadow |
| `--ft-bg` | `#2A211A` | `#110D0A` | footer |
| `--ft-ink` / `--ft-muted` | `#F1E8D6` / `#D9CCB4` | `#F1E8D6` / `#BFB09C` | footer text |
| `--ft-accent` | `#FFD84D` | `#FFD84D` | footer headings and links hover |

Text pairs are chosen to clear 4.5:1 (large display text 3:1); M0-06 verifies every pair with a
contrast check and adjusts here if one fails.

**Spacing:** 4 · 8 · 12 · 16 · 24 · 32 · 48 · 64 · 96 · 112 · 120. Sections 112 px apart on
desktop. **Layout:** max content 1200 px, 16 px side gutter at every width; sections are flex or
grid rows that wrap (`flex: 1 1 <basis>`, `min-width: 0`). **Radii:** 999 (buttons, chips, inputs,
toggles) · 6 (napkins, cards) · 4 (sticky notes) · 10 (dashed "straight talk" box).
**Shadow:** `0 14px 30px var(--shadow)` on cards; none on flat bands.
**Focus:** 2 px solid `--accent`, 3 px offset, never removed. **Motion:** 150 ms colour and
position only; 0 ms under `prefers-reduced-motion`.

## Themes
- Default follows `prefers-color-scheme`; a sun/moon icon button in the header and a "Theme:
  Light · Dark" control in the footer override it, remembered per viewer.
- Every colour comes from a token; no literal colours in components.

## Components
- **Buttons:** primary = `--accent` pill, `--on-accent` text, 700; secondary = 2 px `--ink`
  outline pill that fills with `--ink` on hover. Min height 44 px on touch layouts.
- **Chips (bottle picker, filters):** real checkbox inside a label; pill with 1.5 px `--ink`
  border; selected = `--ink` fill, `--paper` text plus a tick (state never by colour alone).
- **Select (country picker, M1-11):** native `<select>` with a visible `<label>` above it,
  styled like the search input: 1.5 px `--ink` border, 999 radius, `--card` fill, `--ink` text,
  44 px tall, 16 px text, a chevron drawn in CSS from `currentColor`; focus ring as everywhere.
  Never submits on change (WCAG 3.2.2): it sits in a GET form with its own secondary button.
- **Segmented control (ml / cl / oz):** radio group on a `--seg` pill track; selected = `--ink`
  pill.
- **Napkin card:** `--card` with the dot texture, 6 px radius, card shadow, a strip of tape on
  top, a slight tilt (±0.6–1.4°). Used for the demo and featured content.
- **Recipe card:** `--card`, Fraunces title, Caveat one-liner in `--accent`, ingredient rows
  divided by `--dash` dashed lines with amounts right-aligned, method in `--muted`, strength line,
  credit in Fraunces italic, "Full recipe →" link. Optional photo frame on top.
- **Photo frame:** 240 px tall, `object-fit: cover` with a per-photo focus point, 3 px radius,
  inside the card padding. No credit labels.
- **Sticky note:** `--sticky-y`, `--card` or `--sticky-g`, 4 px radius, small tilt, Caveat
  numeral, Fraunces heading, `--note` body.
- **Strength line:** on a `--sticky-y` strip: "**[x.x]% ABV** once shaken · **[x.x]** standard
  drinks ([locale])".
- **Tags:** "house" = `--dash` outline pill; "yours!" = Caveat in `--accent`.
- **Highlighter:** an SVG stroke in `--hl` behind one key word of a display heading, once per
  screen at most.
- **Handwritten asides (Caveat):** short (under ~8 words), decorative or repeating information
  that is also available in plain text; hidden below 900 px together with arrows.
- **Tables:** real `<table>` on a ruled card (`--seg` lines every 48 px), caption in Caveat,
  headers small caps 700 `--muted`.
- **Footer:** `--ft-bg` band, four columns (brand, The app, Behind the bar, The small print),
  dashed divider, responsible-drinking line first.
- **Footer help line (M1-11):** directly under the responsible line in `.site-footer__small`,
  `--ft-ink` (one step brighter than the `--ft-muted` small print), 15/22. Pattern: "Worried
  about drinking, yours or someone else's? Talk to [name] ([country short]): [number]". The
  number is a `tel:` link, `tabular-nums`, `white-space: nowrap`; when the service also has a
  URL, the name links to it. URL only: "… ? [name] can help: [domain]" with the domain as the
  link text. No service for the country: "… ? Find a helpline near you at findahelpline.com".
  Never adds claims (free, 24/7, confidential) the source table does not carry.
- **Single-question page (M1-11, the age gate):** a page that asks one thing before anything
  else. Minimal header (wordmark only, not a link to content), `main` with one centred napkin
  card (max 560 px, tilt -0.8° on desktop, none below 900 px), the normal footer. The question
  is the `h1`; answers are two full submit buttons in one POST form; secondary choices (country)
  follow under an `h2`. No dialog, no overlay, no content behind it; works without JavaScript.
- **Not-found page (M1-08):** the answer for a missing or out-of-reach page, HTTP 404. Normal
  header and footer; `main` with one centred napkin card (max 560 px, tape, tilt -0.8° on
  desktop, none below 900 px). `h1` says what is missing in plain words, one short body line,
  one primary `ButtonLink` to somewhere useful. Never shows any part of the thing refused, never
  blames the visitor.
- **Text field (M1-09):** `label.field` with visible text (15/22, 500) above a text, search or
  number input styled like the Select: 1.5 px `--ink` border, 999 radius, `--card` fill, `--ink`
  text, 44 px tall, 16 px text, placeholder `--muted`; focus ring as everywhere. Optional
  `<datalist>` for suggestions. An error is `aria-invalid="true"` plus `p.field__error` (15/22,
  `--accent`, `aria-describedby`) whose words say what is wrong; never colour or border alone.
  Optional help `p.field__help` (15/22, `--muted`) under the input, described before the error.
  Lives in `@stirred/ui` styles since M2-02 (third caller).
- **Filter column (M1-09):** filters beside results in one GET form that works without JS.
  ≥900 px: a 300 px column (`--paper`, no card) left of the results; below 900 px a native
  `<details>` whose `summary` is a secondary pill "Filters ([k] on)", open without JS. Groups are
  fieldsets (legend Fraunces 600 18/24) of wrapping filter Chips with a `tabular-nums` count
  (`.chip__count`, `currentColor`, with a `.vh` " recipes"); top 8 by count, the rest under a
  nested `details` "[n] more". One full-width primary "Apply" always shown; "Clear all" link only
  when something is set. With JS a checkbox change swaps the results in place (no navigation,
  focus kept, one `role="status"` summary); text fields apply on Enter or Apply only. A
  single-key shortcut ("/") is JS-only, ignored inside text fields, and can be turned off.
- **Result list (M1-09):** `ol` on a `--card` panel (6 px radius, card shadow, no tape or tilt),
  rows 16 24 padding divided by `--dash` dashed lines, 64 px min height. Row: Fraunces 600 22/28
  name link (the only link), a `--muted` 15/22 meta line "[method] · [glass] · [Family]", strength
  right-aligned (DM Sans 700 `tabular-nums` "[x.x]% ABV"); below 600 px the
  strength wraps under the meta. Count heading "[n] recipes" above; paging is "← Previous · Page
  [p] of [P] · Next →" links, absent (not disabled) at the ends. Empty state: a white sticky note
  "Nothing matches all of that." with one link per active filter that drops just that filter,
  then "Clear all filters".
- **Form page (M2-02, accounts):** the single-card shape of the age gate for one short form.
  Normal header and footer; one centred napkin card (max 560 px, tape, tilt -0.8° on desktop,
  none below 900 px): Caveat aside (`aria-hidden`), `h1`, one lead line, a POST form (`noValidate`,
  `required`, our words not the browser's) of full-width Text fields and one primary submit last,
  then small secondary links. Results ("Check your email", "That link didn't work") replace the
  form in the same card; their `h1` takes focus (`tabIndex=-1`, `autoFocus`). Works without JS.
  Never says whether an email has an account; passwords come back empty after any error.
- **Form-level error (M2-02):** for an error that belongs to no single field (credentials, rate
  limit, our side down). `div.form-error[role=alert]` first in the form: 2 px `--accent` border,
  10 px radius, 12 16 padding, `--ink` 16/24 text, one sentence that says what happened and what
  to do. After a failed submit `autoFocus` goes to the field to fix (first invalid, else
  password), whose `aria-describedby` includes the error, so a full page load still reads it.
- **Header account control (M2-02):** theme button, "Sign in" link or "Sign out" (a POST
  `button` styled as the header link, 44 px) and "Start my bar" share `.site-header__actions`, so
  they wrap together; at 360 px that group is its own row. No email or name shown.
- **Status line (M2-03):** the result of a POST that changed something. `p[role=status]` above
  the forms it reports on: `--sticky-g` fill, `--ink` 16/24, 4 px radius, 12 16 padding, no tilt;
  one sentence in the past tense naming the thing ("Gin removed.", "Added Bourbon Whiskey.").
  Full page load: `tabIndex=-1` + `autoFocus`; with JS the text changes in place and focus stays
  with the user's task. Errors are never a status line (Text field error or Form-level error).
- **Suggestion list (M2-03):** when a typed name is not one exact match, under the field's
  `field__error`: `ul` of secondary submit pills "Add [name]" (`name=pick value=[id]`, 44 px),
  each followed by its path in `--muted` 15/22, linked by `aria-describedby`. At most 8.
- **Check tree (M2-03):** a long hierarchical pick list. Native checkboxes in `label` rows (32 px
  ≥900, 44 below) in nested `ul`s, 24 px indent per level; inside a closed `details` per top-level
  group whose `summary` carries name and a `tabular-nums` count; two CSS columns ≥900 with no
  group split. A state beside a row ("on your bar") is words plus an `aria-hidden` tick.
- **Shelf list (M2-03):** the Result list panel with `h3` group heads; row = name (DM Sans 500
  18/28), path under it (`--muted` 15/22), a link-styled `button` "Remove" with a `.vh` name. Paths
  render "A › B" with `›` `aria-hidden` and a `.vh` comma.
- **Match list (M2-04):** a Result list that can be long (hundreds). Rows as Result list with
  the 56 × 70 thumbnail; an optional `--muted` 15/22 note under the meta ("using [X] for [Y]");
  the right slot holds strength or one link-styled POST `button.linkish` "Add [name]" (44 px
  touch, 32 px ≥900). Over 15 rows: the first 12, then a native `details` in the same panel,
  `summary` "Show the other [m]" / "Hide the other [m]" (CSS-swapped), and the rest in
  `ol[start=13]`. Never truncated: every row is in the DOM. Works without JS.
- **Jump link (M2-04):** below 900 px only, a plain in-page link "[what] ↓" under the page lead
  to a section that stacking pushed far down; hidden when that section has nothing to show.

## Responsive
- Below 900 px: tilts and handwritten arrows switch off; rows stack in reading order.
- Chips wrap; touch targets 44 px; tables keep their key columns and scroll inside their card.

## Voice and copy
- Second person, contractions, short sentences: "What can you make tonight?", "Not drinking?
  Same great drinks.", "Recipes with receipts."
- Buttons say what happens: "Start my bar", "Just browse", "Full recipe →".
- Facts stay facts: never round, joke about or handwrite-only a quantity, ABV or credit.
- Responsible line: "Drink well, not a lot. Every recipe shows how strong it is so you can choose.
  Only for people of legal drinking age."
- Missing facts are `[PLACEHOLDER]`s in designs, never invented.
- Age and help copy is plain, never playful about age or alcohol, never a reward ("unlock",
  "grab a drink") and never a punishment for "No": "Come back when you're [age]." with the help line.

## Photos
- Real drink photos in photo frames on recipe and featured cards, and a 56 × 70 thumbnail on
  each search result (decorative: empty alt, the name beside it says it). We serve our own copies; no
  credit labels or credit lines.

## Accessibility
- WCAG 2.2 AA: real buttons, links, labels and table headers; one `h1` per page; sections
  labelled by their `h2`; live region announces a single summary when results change.
- Decorative SVG (tape, arrows, highlighter) is `aria-hidden`; photos have descriptive alt text.
- Light and dark both meet contrast; colour is never the only signal.
