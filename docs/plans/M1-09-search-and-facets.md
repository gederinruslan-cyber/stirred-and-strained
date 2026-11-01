# M1-09 · search-and-facets

`/recipes`: search the house library by name, include or exclude ingredients through the
hierarchy, and narrow by base spirit, ABV range, method, glass, family and flavour. Results beside
the filters on desktop; works without JavaScript (a GET form); "/" focuses the search. New:
query parameters and facet counts on `GET /recipes`, `GET /ingredients` for the pickers. No table,
no dependency. Designer pass for the page.

## Derived facets (api, at library load)
- **Base spirit:** the recipe's largest-volume line under spirits, named by its type directly
  under spirits (bourbon → Whiskey, tequila blanco → Tequila); ties by id; none → "No spirit".
- **Family / flavour:** from the source's tags through a fixed map (Sour, Tiki, Negroni, Spritz…
  / Citrusy, Bitter, Herbal = Herbacious…); untagged recipes have none. Labels are ours.

## Scenarios
- **Name.** `q=negroni` → Negroni, Coffee Negroni, Negroni Sbagliato… (case and accents
  ignored, "creme" finds "Crème"), ordered by name then id.
- **Include, hierarchy-aware.** `include=whiskey` returns recipes with bourbon or rye (a
  descendant) — never the reverse: `include=bourbon-whiskey` excludes a rye-only recipe.
  `exclude=campari` drops every recipe with Campari. Unknown ingredient id → 400.
- **Facets.** `base=gin&method=shaken` narrows to shaken gin drinks; values within one facet are
  OR, facets are AND. Each facet lists its values with counts over the current results.
- **ABV range.** `abvMin=0&abvMax=10` keeps recipes whose finished ABV (ADR 0004) is within it;
  zero-proof drinks sit at 0.
- **Zero-proof.** In zero-proof mode only zero-proof recipes are searched and counted.
- **Page.** `/recipes` shows the search, filters on the left and results on the right at 1440,
  stacked at 360; each result links to its recipe page with method · glass and ABV; an empty
  result says what to loosen. Filters and paging work without JavaScript; "/" focuses search.
- **Accessible.** axe WCAG 2.2 AA light and dark at 1440 and 360.

## Check
- Unit (api): each filter and the facet counts over the seed library. e2e: search, include via
  the hierarchy, a facet, without JS, "/" shortcut, axe. Review: not needed (read-only house
  data; no strength logic).
