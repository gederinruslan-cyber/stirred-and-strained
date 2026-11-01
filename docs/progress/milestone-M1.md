# Milestone M1 · Library and engine

Tagged `m1`. Every M1 feature merged with green gates; `pnpm verify:full` green on `main` after
the last merge (29 integration and 32 e2e tests, incl. axe on the gate, the under-age page, the
recipe page and the search page in light and dark at 1440 and 360 px). Zero-proof was dropped by
human decision during the milestone (NH-6); M1-10 became drop-zero-proof.

| ID | Feature | Merged |
|---|---|---|
| M1-01 | strength-model-adr | `7d927d0` |
| M1-02 | strength-in-units | `4a3a009` |
| M1-03 | taxonomy-schema | `9a72887` |
| M1-05 | seed-sources-and-licences | `a70fd23` |
| M1-06 | seed-import | `319caa5` (taxonomy fix `5b15e6a`) |
| M1-07 | recipes-api | `084f073` |
| M1-08 | recipe-page | `64790bc` |
| M1-09 | search-and-facets | `005a7f9` |
| M1-10 | drop-zero-proof | `07aab1f` |
| M1-11 | age-gate-and-responsible-footer | `82941c3` |
| — | verifier fixes | `58fd544` |

## Demo checklist

Start the stack with `docker compose up -d --build --wait`, then open http://127.0.0.1:3300 in a
private window (no age cookie).

1. **Age gate.** You land on "Are you 18 or over?" (UK browser; US asks 21). "Somewhere else?"
   switches country. "Yes" returns to the page you asked for and is remembered for a year.
2. **Under age.** In another private window answer "No": every page shows "Come back when you're
   18." with only the wordmark in the header and the local help line in the footer.
3. **Landing on the house library.** Default shelf gin, sweet vermouth, Campari + the usual: you
   can make 7 (Americano, John Collins, Negroni first); one away starts Boulevardier + Bourbon.
   Featured: Negroni, Old Fashioned, Margarita, John Collins, each credited with its strength.
4. **Recipe page.** Open `/recipes/negroni`: 30 ml each, "19.8% ABV · 1.4 standard drinks" (US),
   "counted like a stirred drink (our assumption)", steps in our words, "Spec via iba-world.com",
   13 variations. Switch to oz (1 oz each); the choice holds on the next recipe.
   `/recipes/b-52` says "no ice, so no dilution".
5. **Strength by country.** UK visitors see UK units (Negroni 2.5), Japan grams (20 g).
6. **Search.** Header search "negroni" → 14 recipes. With "whiskey" finds rye recipes such as
   the Manhattan; With "Bourbon Whiskey" + "manhattan" finds nothing and offers "Drop Bourbon
   Whiskey". Tick Stirred: the list narrows in place. Press "/" to jump to the search box.
7. **Without JavaScript.** The gate, the demo, units and the search form all still work.
8. **Keyboard and dark theme.** Tab from the top on any page; focus is always visible; the moon
   button switches theme.

## Verifier (against the running app, `a1189a2`)

Verdict **FAIL (narrow)**, fixed in `58fd544` and re-checked by the gate: every number was right
(all 595 strengths recomputed by hand from the seed and ADR 0004, Negroni, Daiquiri, Old
Fashioned and Margarita in four countries; make now, one away and buy next recomputed for six
bars; search counts for eight ingredients; facets, ranges, paging; units; age gate in seven
locales; no write route on house data). Isolation: N/A (M1 has no user data).

| Defect | Fix |
|---|---|
| Landing claimed "Rye can stand in for bourbon"; the library has no substitution edges | Copy now says a bourbon recipe wants bourbon; swaps arrive with M2-05 |
| Layered (B-52) and other assumed methods captioned "after the ice, by Arnold's dilution model" | Caption per method: Arnold for shaken/stirred, "our assumption" for built/muddled/blended, "no ice" for layered |
| Ranged amounts counted at their minimum for strength | Alcohol at the maximum, 0% lines at the minimum; ADR 0004 amended; reviewer APPROVE |
| specs/web said /cookies, /privacy, /terms "open"; they 404 (built in M3-02) | Spec amended: never gated, pages arrive with M3-02 |

## Open
- Footer `/sources`, `/strength` and header `/sign-in` still 404 (M2 sign-in, M3 pages).
- Three near-zero recipes remain (Non-Alc Hurricane 0.6%, Tea Time 0.3%, Tonic Rickey 0.8%:
  only bitters dashes); kept, M1 accepted without excluding them.
- `GET /recipes?abvMin=abc` answers 400 `FST_ERR_VALIDATION` (framework code in the body).
- The web demo silently ignores an unknown bottle in the URL; the api refuses it.
- 132 untagged recipes have no family or flavour; flavoured spirits show as their own base spirit.
- DK/SE 12 g standard drink rests on snippets of the official pages (sst.dk, 1177.se).
- Strength must be per serving before scaling arrives (a top-up stays one serving).
- M1-02 exceeded the test-lines ceiling (164 vs 139); M1-06 landed with the subject "x [M1-06]".
