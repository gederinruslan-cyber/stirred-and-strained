# M1-06 · seed-import

Import Bar Assistant open data (MIT, pinned `5a504d4`, `data/SOURCES.md`) into the taxonomy
(M1-03) and new recipe tables. Facts only; all text ours. **Ships only after NH-3.**

New: tables `recipe`, `recipe_line` (migration 0002); `packages/db` gains `@stirred/units`
(constants) and `@stirred/engine` (taxonomy validation) as dependencies; a vendored facts-only
snapshot `data/seed/bar-assistant.json` and `data/seed/rules.json` (taxonomy placement,
exclusions with reasons, IBA corrections).

## Scenarios
- **Taxonomy.** Bar Assistant roots with children become categories; childless roots are placed
  under a named category (salt → pantry, tea → beverages); a node with a distillery is a brand,
  others are types; ABV is the ingredient's own strength. The result passes `createTaxonomy`.
- **Canonical amounts.** 1.5 oz → 44.360 ml (29.5735295625 ml/oz, unrounded); 1 tsp → 4.929 ml;
  "dashes" → dash; "topup" → top 1; leaves, slices, wedges, sprigs → piece; a range keeps its max.
- **Fails loudly.** A recipe without a source URL, with an unknown unit ("1 part"), an
  unresolved ingredient or no method fails the import naming the recipe — unless it is listed
  in `rules.json` exclusions with a reason (31 unit cases, 15 without source, 3 without method).
- **Provenance.** Every recipe stores source URL, a credit line and the licence; Bar Assistant
  text (description, instructions, garnish prose), images and computed ABV are never stored.
- **IBA classics.** A recipe sourced to iba-world.com whose amounts differ from the IBA page is
  corrected from `rules.json` (checked entry by entry) and credited to the IBA; one sourced to
  the IBA that is neither checked, corrected nor excluded fails the import. Pinned in a
  test: Negroni 30/30/30, Daiquiri 60 ml / 20 ml / 2 barspoons sugar, Margarita 50/20/15, Old Fashioned 45 ml + 1 sugar
  cube + 2 dashes Angostura.
- **Zero-proof parity.** Zero-proof is derived from the ingredients (all 0%), never from the
  upstream "Virgin" tag, which is dropped: 3 of the 12 carry dashes of 44.7% bitters (≈0.5% ABV).
- **Idempotent.** Running the import twice leaves identical rows (upsert, missing rows removed).
- **Read-only at runtime.** The api role can read recipes and cannot write them.

## Check
- Unit: `packages/db/test/seed-transform.test.ts` on a synthetic fixture.
- Integration: `seed.int.test.ts` imports the real snapshot twice on Postgres; classics pinned.
- `pnpm verify:quick` green. Review (new tables, provenance rules).
