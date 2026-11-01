# 0004 — Strength model: dilution, finished ABV and standard drinks

- **Status:** proposed (needs-human sign-off, NH-4)
- **Date:** 2026-11-01
- **Feature:** M1-01

## Context
Every alcoholic recipe shows its finished ABV and standard drinks for the visitor's country,
derived by one function in `packages/units` with a stated, cited model (CLAUDE.md invariants).
Zero-proof drinks go through the same function. Inputs are canonical: ml and counted units,
ingredient ABV from the taxonomy, and the recipe's method.

## Model
1. **Ethanol and volume before dilution.** For every line with a volume:
   `V0 = Σ ml`, `E = Σ ml × ABV/100`, `abv0 = E / V0` (a fraction). Volumes are treated as
   additive (ethanol–water contraction ignored, as Arnold's published specs do).
2. **Dilution** `d` (water added as a fraction of `V0`) by method, `abv0` as a fraction:

   | Method | `d` | Source |
   |---|---|---|
   | shaken | `−1.567·abv0² + 1.742·abv0 + 0.203` | D. Arnold, *Liquid Intelligence* (2014) p. 123; sign erratum per M. McDonald, mikemcdonald.co/blog/2020/05/06/between-the-sheets/ |
   | stirred | `−1.21·abv0² + 1.246·abv0 + 0.145` | Arnold (2014) p. 123 |
   | built (over ice) | as stirred | **Assumption** — no published measurement; a built drink is stirred in the glass over ice |
   | blended | as shaken | **Assumption** — understates blended dilution, so the ABV shown errs high (the safe side) |
   | muddled | as built | **Assumption** — muddled drinks are finished over ice |
   | layered | `0` | Served without ice |
3. **Finished:** `V = V0 × (1 + d)`, `ABV = E / V`. Ethanol mass `g = E × 0.78924` (density of
   ethanol at 20 °C, EU Reg. 2870/2000 annex / OIML R22).
4. **Counted units** (declared ml, used only for strength; display keeps the counted unit):

   | Unit | ml | Source |
   |---|---|---|
   | dash | 0.8 | Measured 0.73–1.0 ml for standard bitters bottles (Don Lee, via bar-vademecum.eu/the-dash/) |
   | barspoon | 5 | Difford's Guide, "Measures and measuring" (1/6 oz) |
   | drop | 0.05 | Metric drop, 20 per ml (aqueous; saline) |
   | top | 90 | **Assumption** — a typical highball top-up of a 0% mixer |
   | piece | excluded | Solids and garnish (sugar cube, mint leaf, citrus wheel): no alcohol, negligible volume |
5. **Standard drinks** = `g / grams-per-drink(country)`, each value stated as the government
   states it:

   | Country | Definition | Source |
   |---|---|---|
   | US | 14 g | niaaa.nih.gov/alcohols-effects-health/what-standard-drink |
   | UK | 1 unit = 10 ml ethanol (computed from ml, not grams) | nhs.uk/live-well/alcohol-advice/calculating-alcohol-units/ |
   | Canada | 13.45 g (17.05 ml) | canada.ca low-risk alcohol drinking guidelines |
   | Ireland, Australia, New Zealand, France, Spain, Poland | 10 g | HSE; health.gov.au standard drinks guide; alcohol.org.nz; Santé publique France; Ministerio de Sanidad (UBE); KCPU |
   | Italy | 12 g | ISS / Ministero della Salute (unità alcolica) |
   | Denmark, Sweden | 12 g | Sundhedsstyrelsen; Socialstyrelsen |
   | Germany, Switzerland | **10 g proposed** (government publishes 10–12 g) | BZgA/BIÖG "Kenn dein Limit"; BAG |
   | Japan, anywhere else | no drinks figure — show **grams of alcohol** | MHLW 2024 guideline states grams |

   Most rows were confirmed from the government pages' search snippets; US, UK and Canada were
   read in full. Each value is re-read from its page when M1-02 lands and the URL kept in code.

## Worked examples (become tests in M1-02)
- **Thai Basil Daiquiri, shaken** (Arnold 2014, published: 160 ml at 15% ABV): 60 ml rum at 40%,
  22.5 ml lime, 22.5 ml syrup, 2 drops saline → `V0 = 105.1`, `E = 24`, `d = 0.519`,
  **V ≈ 159.6 ml, ABV ≈ 15.0%**. Pins the shaken coefficients (the printed `+1.567` gives 11.6%).
- **Negroni, stirred** (derived): 30 ml gin 40%, 30 ml bitter aperitivo 24%, 30 ml sweet vermouth
  16% → `d = 0.391`, **ABV ≈ 19.2%**, 18.9 g → US 1.35, UK 2.40 units, AU 1.89.
- **Gin and tonic, built** (derived): 50 ml gin 40% + top (90 ml tonic, 0%) → `abv0 = 0.143`,
  `d = 0.298`, **ABV ≈ 11.0%**, 15.8 g → US 1.13.
- **Zero-proof sour, shaken** (derived): all lines 0% → `d = 0.203`, **ABV 0%, 0 standard
  drinks**, same code path.

## Options considered
- **A — Arnold's equations plus stated assumptions (chosen).** Measured for the two methods that
  dominate (shaken 51%, stirred 29% of the seed library); everything else is labelled an
  assumption and errs toward showing a stronger drink.
- **B — Fixed dilution per method** (e.g. shaken 25%, stirred 20%). Simple, but no source and
  wrong across the ABV range.
- **C — No dilution** (pre-dilution ABV). Overstates every drink by roughly a third; misleading
  in the other direction.

## Consequences
- M1-02 implements `finishedStrength(lines, method, country)` in `packages/units` with property
  tests (0% in → 0% out, scaling a recipe changes volume not ABV, counted units) and the four
  examples above.
- The page names the model ("after shaking, by Arnold's dilution model") and links the method
  page; assumptions are visible there, never hidden.
- Changing a coefficient or a country value is a new ADR revision; stored data never holds a
  computed strength.
- Open for the human (NH-4): the four assumptions (built, blended, muddled, top = 90 ml), the
  dash value, and 10 g for Germany and Switzerland.
