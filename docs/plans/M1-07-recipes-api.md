# M1-07 · recipes-api

House recipes over the api with provenance and derived strength (ADR 0004), and the landing
moves from the sample library to the house library. New: `loadRecipes` in `packages/db`; the
api loads taxonomy + recipes once at start (house data changes only by import + restart);
`@stirred/db` exports `readSeed` so api unit tests build the same library without Postgres.
db-setup in compose runs the seed after migrations. The sample library and its two house
placeholders (Zero-proof Gin Buck, Zero-proof Gin Sour) are deleted. No user data: no isolation
case. No new design pattern (existing cards), so no designer pass.

## Scenarios
- **Get.** `GET /recipes/negroni?country=US` → gin 30 ml, Campari 30 ml, sweet vermouth 30 ml,
  built (IBA: over ice in the glass), credit "Spec via iba-world.com", licence, source URL; ≈19.8% ABV (Campari 25%,
  vermouth 18%), 19.7 g → 1.40 US standard drinks; `country=GB` gives 2.49 UK units; none → grams.
- **Unknown.** `GET /recipes/no-such-drink` → 404 `{ "error": "not_found" }`.
- **List.** `GET /recipes?page=2&pageSize=24` → 24 summaries ordered by name then id, `total`
  604; pageSize above 100 or page 0 → 400. Summaries carry zero-proof and ABV.
- **Every recipe has a strength.** Every house recipe has a line with volume, so ABV and
  standard drinks are always derived; a zero-proof recipe (Shirley Temple) shows 0% and 0.
- **Round trip.** Recipes loaded from Postgres equal the imported seed (lines in order).
- **Landing.** Default shelf gin, sweet vermouth, Campari + the usual → make now has Negroni and
  Americano; one away has Boulevardier (+ Bourbon Whiskey). Light rum → Daiquiri. Featured:
  Negroni, Old Fashioned, Margarita and Temperance Grapefruit Collins (zero-proof, sourced);
  the zero-proof band shows Shirley Temple and Neruda. Cards show finished ABV and standard
  drinks for the visitor's country (age cookie), rounded once at display (ABV 0.1%, drinks 0.1).
- **Zero-proof demo.** Zero-proof on, ginger beer + grenadine + the usual → Shirley Temple;
  no alcoholic recipe listed.
- **Start-up.** An api started on an unseeded database refuses to start and says to run the
  seed.

## Check
- Unit (api): routes over the seed-built library. Integration: round trip in `seed.int.test`.
- e2e: landing specs updated to house names; `pnpm verify:full` after merge. Review: no (read
  path over house data, no user data, no new strength logic).
- Open: no substitution edges in the house data yet, so the demo shows no swaps (M1-10/M2-05).
