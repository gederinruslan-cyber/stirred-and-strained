# Recipe page — design spec (M1-08)

*Bar Napkin (`patterns.md`) in both themes. Route `/recipes/<id>`. No photos in this feature.
[BRACKETS] are filled from `GET /recipes/:id`, never typed in. Closest pattern: the landing
"jot it down" Daiquiri card (`.napkin.jot__card`, `.lines`, `.strength`, `.credit`).*

## Layout
- **1440 px:** header · `main.container.section` with one wrapping row `.recipe` (flex, gap 48
  64): left `article.napkin.tilt.recipe__card` (`flex: 1 1 640px`, max 720, tilt -0.6°, tape),
  right `aside.recipe__side` (`flex: 1 1 320px`, `min-width: 0`) · footer.
- **360 px** (and below 900): no tilt; card then aside, stacked in DOM order; 16 px gutter; unit
  control wraps under the title; no horizontal scroll; touch targets 44 px.

## Card, top to bottom
1. `h1.recipe__title` [name], Fraunces 600, 36/40 (32/36 below 900). One `h1` per page.
2. `p.recipe__meta` (DM Sans 18, `--muted`, not Caveat: it is a fact): "[method] · [glass]",
   lower-case, e.g. "built · rocks"; no glass: "[method]". Then `ZeroProofTag` if zero-proof.
3. Variation of another house recipe: `p.recipe__twist` "A twist on the [Parent]" with
   [Parent] the link to `/recipes/<parentId>`.
4. `h2` "What goes in" (24, Fraunces) beside the unit control (`.jot__head` row behaviour).
   Unit control: `<form method="post" action="/prefs">` with hidden `back` = `/recipes/<id>`,
   `SegmentedControl name="unit" legend="Units"` (ml · cl · oz; a labelled radio group), and
   `<noscript><button class="btn btn--secondary">Show</button></noscript>`. With JS it submits
   on change. `/prefs` sets the `unit` cookie; the landing and every recipe page read it.
5. `ul.lines`: [ingredient] left, `.amount` right (`amountText`). Counted units stay counted
   ("2 dashes", "2–3 dashes"); a top line reads "top up"; no amount reads "to taste"; an
   optional line appends `<span class="muted">(optional)</span>` to the name.
6. `div.strength` (the existing `--sticky-y` strip): line 1 `<strong>[strengthText]</strong>`
   ("19.8% ABV · 1.4 standard drinks"; UK "units", unknown country "g of alcohol"); line 2
   `span.strength__model` (15/22, `--muted`) "after the ice, by Arnold's dilution model".
   Zero-proof: the strip uses `--sticky-g`, line 1 "0% ABV · nothing to count", no line 2.
7. `h2` "How to make it" · `ol.steps` (18/28 DM Sans; markers Fraunces 600 in `--accent`),
   derived text in our words, e.g. "Shake hard with ice." / "Strain into a chilled coupe."; a
   top line adds "Top up with [club soda]." Never the source's prose.

## Aside
- `section` `h2` "Where it's from" on a `sticky sticky--white` note (no tilt below 900):
  `p.credit` = `<a href="[source]">[credit]</a>` (Fraunces italic, `--accent`, underlined),
  e.g. "Spec via iba-world.com"; `p.small.muted` "Licence: [licence]"; `p.small.muted`
  "Amounts as published by the source. Steps are in our own words." Never "tested",
  "verified" or "perfected"; no photo credit anywhere.
- `section` `h2` "Variations" (only when there are some): `ul.variations` of links
  "[name] →", order name then id. No list, no section, no empty-state copy.
- Zero-proof session (chosen or locked): only zero-proof variations are listed, and the "A
  twist on" line is dropped when the parent is alcoholic (never link into a locked 404).

## Not found (Not-found page pattern, `patterns.md`), HTTP 404
- **Unknown id.** `<title>` "Recipe not found · Stirred & Strained". `h1` "We can't find that
  recipe." Body: "The link may be old or have a typo. Everything we have starts from the
  front page." Primary `ButtonLink` "Back to the start" → `/`.
- **Locked zero-proof visitor, alcoholic id.** Same page shape; never the name, spec or
  strength. `<title>` "Not on the zero-proof side · Stirred & Strained". `h1` "That one's not
  on the zero-proof side of the bar." Body: "You're seeing the zero-proof side, so every
  recipe here is 0% ABV, with the same detail and the same care." Primary "See zero-proof
  recipes" → `/#zero-h`. No mention of age, no "come back later", no invitation to change the
  answer.

## New classes (page CSS, tokens only)
`.recipe`, `.recipe__card`, `.recipe__side`, `.recipe__title`, `.recipe__meta`,
`.recipe__twist`, `.strength__model`, `.strength--zero` (`--sticky-g` fill, `--zero-text`),
`.steps`, `.variations` (links 18/28, 44 px rows below 900, `--dash` dividers).

## Accessibility and SEO
- Sections labelled by their `h2`; credit and variation links have their own visible text;
  focus ring as everywhere. axe WCAG 2.2 AA light and dark at 1440 and 360.
- `<title>` "[name] · Stirred & Strained"; JSON-LD `Recipe` per the plan.
