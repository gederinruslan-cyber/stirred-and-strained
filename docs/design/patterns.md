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
- **Zero-proof is never second-class.** Same cards, same detail, its own green tag.
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
| `--sticky-g` | `#E4F0E6` | `#1E2A22` | green sticky note, zero-proof band |
| `--zero` | `#2E6B4F` | `#8FD1AE` | zero-proof tag, "make now" ticks |
| `--zero-text` | `#3E4A40` | `#C5D6C8` | body text on the zero-proof band |
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
  Zero-proof chips use `--zero` instead of `--ink`.
- **Switch (zero-proof):** `role="switch"` pill track with knob, visible label.
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
  drinks ([locale])". Zero-proof: "0% ABV · nothing to count".
- **Tags:** zero-proof = `--zero` outline pill with glass-and-slash icon and the word
  "zero-proof"; "house" = `--dash` outline pill; "yours!" = Caveat in `--accent`.
- **Highlighter:** an SVG stroke in `--hl` behind one key word of a display heading, once per
  screen at most.
- **Handwritten asides (Caveat):** short (under ~8 words), decorative or repeating information
  that is also available in plain text; hidden below 900 px together with arrows.
- **Tables:** real `<table>` on a ruled card (`--seg` lines every 48 px), caption in Caveat,
  headers small caps 700 `--muted`.
- **Footer:** `--ft-bg` band, four columns (brand, The app, Behind the bar, The small print),
  dashed divider, responsible-drinking line first.

## Responsive
- Below 900 px: tilts and handwritten arrows switch off; rows stack in reading order.
- Chips wrap; touch targets 44 px; tables keep their key columns and scroll inside their card.

## Voice and copy
- Second person, contractions, short sentences: "What can you make tonight?", "Not drinking?
  Same great drinks.", "Recipes with receipts."
- Buttons say what happens: "Start my bar", "Just browse", "Try zero-proof", "Full recipe →".
- Facts stay facts: never round, joke about or handwrite-only a quantity, ABV or credit.
- Responsible line: "Drink well, not a lot. Every recipe shows how strong it is so you can choose.
  Only for people of legal drinking age."
- Missing facts are `[PLACEHOLDER]`s in designs, never invented.

## Photos
- Real drink photos in photo frames on recipe and featured cards. We serve our own copies; no
  credit labels or credit lines.

## Accessibility
- WCAG 2.2 AA: real buttons, links, labels and table headers; one `h1` per page; sections
  labelled by their `h2`; live region announces a single summary when results change.
- Decorative SVG (tape, arrows, highlighter) is `aria-hidden`; photos have descriptive alt text.
- Light and dark both meet contrast; colour is never the only signal.
