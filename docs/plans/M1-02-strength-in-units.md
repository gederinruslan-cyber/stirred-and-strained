# M1-02 · strength-in-units

Implement ADR 0004 (accepted) in `packages/units`: `finishedAbv(lines, method)` and
`standardDrinks(strength, country)`. Pure; no new dependency, table or cross-module call.
Wiring into recipes is M1-07.

## Scenarios
- **Thai Basil Daiquiri, shaken.** 60 ml at 40%, 22.5 ml lime, 22.5 ml syrup, 2 drops saline
  → V0 105.1 ml, dilution 0.519, ≈159.7 ml at ≈15.0% (Arnold publishes 160 ml at 15%).
- **Negroni, stirred.** 30 ml at 40%, 30 ml at 24%, 30 ml at 16% → ≈19.2%, 18.9 g of alcohol →
  US 1.35 standard drinks, UK 2.40 units, AU 1.89.
- **Gin and tonic, built.** 50 ml at 40% + top (90 ml, 0%) → dilution 0.298, ≈11.0%, 15.8 g →
  US 1.13.
- **Zero-proof sour, shaken.** Every line 0% → 0% ABV and 0 standard drinks, same function.
- **Counted units.** A dash counts as 0.8 ml, a barspoon 5 ml, a drop 0.05 ml, a top 90 ml;
  a piece (sugar cube, mint leaf) adds nothing.
- **Methods.** built and muddled dilute as stirred; blended as shaken; layered not at all.
- **Countries.** UK units come from ml of ethanol (10 ml); US 14 g, CA 13.45 g, IT/DK/SE 12 g,
  DE/CH/IE/AU/NZ/FR/ES/PL 10 g; Japan and any other country get grams of alcohol, not drinks.
- **Properties.** 0% in → 0% out; scaling every measured line by k keeps ABV and multiplies
  volume by k; finished ABV lies between 0 and the strongest line's ABV; very small (0.1 ml) and
  very large (20 l) volumes stay finite.
- **Refused.** A recipe with no line that has volume is refused.

## Check
- Unit: `packages/units/test/strength.test.ts` (fast-check properties + the four examples).
- `pnpm verify:quick` green. Review: yes (strength logic).
