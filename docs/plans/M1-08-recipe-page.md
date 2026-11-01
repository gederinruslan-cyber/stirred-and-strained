# M1-08 · recipe-page

A server-rendered house recipe page at `/recipes/<id>` (the id is the stable slug). Bar Napkin
only; the designer adds any new pattern to `docs/design/patterns.md`. New: `variations` and
`variationOf` on `GET /recipes/:id`; a `unit` preference cookie through `/prefs`. No new table
or dependency.

## Scenarios
- **Page.** `/recipes/negroni` (US visitor) shows the name, "built · rocks" (method · glass),
  gin, Campari and sweet vermouth at 30 ml each, the steps, "19.8% ABV · 1.4 standard drinks"
  with the model named ("after the ice, by Arnold's dilution model"), and the credit "Spec via
  iba-world.com" linking to the source, plus the licence.
- **Units, remembered.** Choosing oz shows "1 oz" on every line and the choice holds on the next
  recipe and on the landing (cookie, works without JavaScript); counted units stay counted
  ("2 dashes"); a top reads "top up".
- **Steps in our words.** House recipes have no stored steps yet, so the page derives them from
  the method and glass in our own words (shaken: shake hard with ice, strain into a chilled
  coupe); a top line adds "top up with club soda". Never the source's prose.
- **Variations.** A recipe lists house recipes whose name contains its name as whole words
  (Negroni → Coffee Negroni, Negroni Sbagliato…), and a variation links back ("a twist on the
  Negroni"). Same input, same order (name, then id).
- **Zero-proof.** Shirley Temple reads "0% ABV · nothing to count" with the zero-proof tag. A
  locked zero-proof visitor (age "No") asking for an alcoholic recipe gets a 404 page that points
  to the zero-proof side, never the spec.
- **Unknown.** `/recipes/no-such-drink` → 404 page in Bar Napkin.
- **Machine-readable.** The page carries schema.org/Recipe JSON-LD: name, recipeIngredient
  ("30 ml Gin"), recipeInstructions, recipeCategory "Cocktail", isBasedOn the source URL.
- **Accessible.** axe WCAG 2.2 AA light and dark at 1440 and 360 px; the unit control is a
  labelled radio group.

## Check
- Unit: steps text per method, variations rule (api). e2e: page content and strength, unit
  remembered across pages without JS, locked 404, axe. `pnpm verify:full`. Review: not needed
  (read-only house data, no user data, strength unchanged).
