# Units

## Requirement: Amounts are canonical and displayed in ml, cl or oz
Liquid volume is kept in ml; cl and oz exist only on screen. 1 US fl oz = 29.5735295625 ml
(NIST Handbook 44, Appendix C).

- **Scenario: common amounts.** 30 ml shows as "30 ml", "3 cl", "1 oz"; 45 ml as "45 ml",
  "4.5 cl", "1½ oz"; 22.5 ml as "23 ml", "2.3 cl", "¾ oz"; 15 ml as "½ oz".
- **Scenario: one rounding step.** ml rounds to the whole ml, cl to 0.1 cl, oz to the nearest
  ¼ oz; a shown amount is within half a step of the true one.
- **Scenario: zero and tiny amounts.** 0 ml shows as "0 ml", "0 cl", "0 oz". A non-zero amount
  never shows as zero: 0.3 ml shows as "< 1 ml" and "< 0.1 cl", 3 ml as "< ¼ oz".
- **Scenario: counted units.** Counted amounts read the same in every display unit and round to
  the nearest ½, never below ½ when non-zero: 2 dashes → "2 dashes", 1 dash → "1 dash",
  ½ barspoon → "½ barspoon", 1½ barspoons → "1½ barspoons", 0.1 dash → "½ dash"; a top-up reads
  "top up".
- **Scenario: invalid amounts.** A negative, NaN or infinite amount is refused.

## Requirement: Scaling works on canonical amounts, then rounds once
- **Scenario: servings.** 30 ml for 4 servings is 120 ml ("4 oz"). 20 ml for 3 servings is
  60 ml ("2 oz"), not three times "¾ oz".
- **Scenario: top-ups.** A top-up stays a top-up when scaled.
- **Scenario: order does not matter.** Scaling by a, then b, equals scaling by a·b before
  display.

## Requirement: Strength is derived from the recipe by one stated model
Finished ABV and standard drinks follow ADR 0004: Arnold's measured dilution for shaken and
stirred drinks; built and muddled as stirred, blended as shaken, layered undiluted.

- **Scenario: Thai Basil Daiquiri, shaken.** 60 ml at 40%, 22.5 ml lime, 22.5 ml syrup and 2
  drops of saline finish at ≈159.7 ml and ≈15.0% (Arnold publishes 160 ml at 15%).
- **Scenario: Negroni, stirred.** 30 ml each at 40%, 24% and 16% finish at ≈19.2% with 18.9 g of
  alcohol: 1.35 US standard drinks, 2.40 UK units, 1.89 Australian standard drinks.
- **Scenario: gin and tonic, built.** 50 ml at 40% topped with tonic (a top counts as 90 ml at
  0%) finishes at ≈11.0%, 15.8 g, 1.13 US standard drinks.
- **Scenario: zero-proof.** A recipe whose every line is 0% finishes at 0% and 0 standard drinks,
  through the same calculation.
- **Scenario: counted units.** For strength a dash is 0.8 ml, a barspoon 5 ml, a drop 0.05 ml
  and a top 90 ml; a piece (sugar cube, mint leaf) adds nothing.
- **Scenario: countries.** UK units count 10 ml of ethanol; a standard drink is 14 g in the US,
  13.45 g in Canada, 12 g in Italy, Denmark and Sweden, and 10 g in Germany, Switzerland,
  Ireland, Australia, New Zealand, France, Spain and Poland. Japan and any other country show
  grams of alcohol instead of a count.
- **Scenario: properties.** Scaling every measured line by the same factor keeps the ABV and
  scales the volume; the finished ABV is never above the strongest line; very small and very
  large volumes give finite results.
- **Scenario: refused.** A recipe with no line that has volume is refused.
