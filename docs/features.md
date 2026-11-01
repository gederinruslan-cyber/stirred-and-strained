# Features

*The one list of what to build, in order, with what "done" means. `/next` takes the first
`ready` row whose dependencies are `done`; `/next M1` runs a whole milestone. Statuses: `todo`
· `ready` · `in-progress` · `blocked (NH-n)` · `done` · `later`. `pnpm ship` marks a row
`done` with the merged SHA. Product background and evidence:
[`research/Cocktail app feature landscape.md`](research/Cocktail%20app%20feature%20landscape.md).
Hard rules live in `CLAUDE.md` and `.claude/rules/`.*

**Marks:** `🧪` touches engine, units or strength maths, `🔒` touches user data or auth, `⚖️`
touches licensing, alcohol rules or legal copy. They tell you where to be careful and when
`/review` is worth its cost (the first slice on a new table, user-data write path, engine or
strength logic, or auth change). `⚖️` items need a human sign-off before they ship. Every screen feature uses the approved
**Bar Napkin** design system (`docs/design/patterns.md`) in both themes.

## Milestones

| Milestone | Exit criteria | State |
|---|---|---|
| **M0 · Foundation** | Monorepo, gates and CI green; local stack; db with user scoping; API contract and client; units package; engine matching on fixtures; Bar Napkin tokens, components and app shell in both themes; landing page live locally | open |
| **M1 · Library and engine** | Seeded, attributed house library browsable and searchable without an account; strength shown on every recipe; landing switched to the house library; zero-proof mode; age gate | |
| **M2 · My Bar** | Sign up/in; My Bar with hierarchy typeahead; make now, one away, buy next; substitutions; custom recipes that match inventory; favourites, ratings, notes; export and erase; isolation proven | |
| **M3 · Public beta** | Accessibility audit, legal and privacy pages, deploy, backups, observability, onboarding to a first "make now" in under 2 minutes | |
| **v1+** | Variations, batching, party menus, import, cost per drink, shared bars, natural-language search, bar mode | |

## M0 · Foundation

| ID | Feature | Status | Depends | Marks | Acceptance |
|---|---|---|---|---|---|
| M0-01 | bootstrap-monorepo | done `9466194` | — | | pnpm + Turborepo workspace with `apps/web`, `apps/api`, `packages/{engine,units,schema,db,ui,api-client}`, `e2e`; strict TS; ESLint with the boundary rule (web never imports engine, db or api); Prettier; Vitest; `pnpm check` and `pnpm verify` green on a fresh clone; CI runs `pnpm verify` on push to `main` |
| M0-02 | local-stack-and-gates | done `ea6b72b` | M0-01 | | `docker-compose.yml` with postgres, api, web; api `GET /health` 200 with db status; web `GET /` 200; `pnpm verify:quick` (verify + postgres container + integration tests) and `pnpm verify:full` (full stack + Playwright smoke) both green and tear down |
| M0-03 | db-foundation | done `b57d1e0` | M0-02 | 🔒 | Drizzle + plain SQL migrations with a down each; runtime role is not a superuser; scoped data-access helper that requires a user id; an isolation test harness (user A cannot read or change user B's row, answers 404) proven on a throwaway table |
| M0-04 | api-contract-and-client | done `dfcd304` | M0-02 | 🔒 | Zod schemas in `packages/schema` generate the OpenAPI contract; `packages/api-client` generated from it; `contract:check` in `verify`; origin and content-type gate on every mutating route; web reaches the api only from server code |
| M0-05 | units-package | done `46c2856` | M0-01 | 🧪 | Quantities in ml or counted units; `formatQuantity` for ml, cl, oz with one rounding step; scaling by servings; property tests over every unit, zero, tiny and large volumes |
| M0-06 | design-tokens-and-app-shell | in-progress | M0-02 | | Implements the approved **Bar Napkin** system (`docs/design/patterns.md`): every token in light and dark with a contrast check per text pair; theme follows the OS with a header and footer override, remembered per viewer; fonts (Fraunces, DM Sans, Caveat); base components (buttons, chips, switch, segmented control, input, napkin card, recipe card with photo frame, sticky note, tags, table, dialog); app shell (header with search, zero-proof switch and theme button; footer) usable at 360 px; keyboard and screen-reader checks |
| M0-07 | engine-matching | done `c1346e3` | M0-01 | 🧪 | *(moved from M1-04 so the landing demo runs on the real engine)* Pure `satisfies`, `makeNow`, `oneAway`, `buyNext` over the taxonomy graph: child satisfies parent never the reverse; `exact` lines; substitution edges; optional lines; deterministic order with stated tie-breaks; tested on the fixture taxonomy; a small sample library fixture for the landing page |
| M0-08 | landing-page | todo | M0-04, M0-06, M0-07 | | Built to `docs/design/landing-page.md` and the mockup, both themes, desktop and 360 px; demo, buy-next table and featured cards served by the API from the engine and its sample library (web holds no matching logic); demo works without JavaScript; zero-proof mode and unit control work; photos served from our own copies; e2e covers the demo and theme switch |

## M1 · Library and engine

| ID | Feature | Status | Depends | Marks | Acceptance |
|---|---|---|---|---|---|
| M1-01 | strength-model-adr | todo | M0-05 | 🧪 ⚖️ | ADR with the dilution model per method and standard-drink grams per country, each from cited primary sources; worked examples for a stirred, a shaken, a built and a zero-proof drink |
| M1-02 | strength-in-units | todo | M1-01 | 🧪 | `finishedAbv` and `standardDrinks` implement the ADR; property tests (0% ABV, counted units, scaling invariance); the ADR's worked examples pass as tests |
| M1-03 | taxonomy-schema | todo | M0-03 | 🧪 | Tables for ingredient nodes (category > type > brand, ABV) and substitution edges, in the shape the engine reads (M0-07 fixtures) |
| M1-05 | seed-sources-and-licences | todo | — | ⚖️ | `data/SOURCES.md` lists each source (IBA list, Bar Assistant data, others) with licence, what we take (facts only) and attribution text; needs-human sign-off before M1-06 ships |
| M1-06 | seed-import | todo | M1-03, M1-05 | 🧪 ⚖️ | Script imports sources into the schema; fails on a recipe without provenance, an unresolved ingredient or a quantity without a canonical unit; recipe text is ours; re-run is idempotent |
| M1-07 | recipes-api | todo | M0-04, M1-06, M1-02 | | List and get house recipes with lines, provenance, computed ABV and standard drinks; pagination; unknown id 404; the landing demo, buy-next table and featured cards switch from the sample library to the house library |
| M1-08 | recipe-page | todo | M0-06, M1-07 | | Server-rendered recipe page with schema.org/Recipe, stable slug URL, ml/cl/oz toggle (remembered), finished ABV and standard drinks, attribution, variation link |
| M1-09 | search-and-facets | todo | M1-07, M1-08 | | Search by name; include/exclude ingredients (hierarchy-aware); facets: base spirit, ABV range, method, glass, family, flavour tags; results beside filters on desktop; keyboard shortcuts |
| M1-10 | zero-proof-mode | todo | M1-09 | 🧪 | A site-wide zero-proof mode that shows NA recipes and NA swaps through the same engine; NA recipes look first-class; strength shows 0% and no standard drinks |
| M1-11 | age-gate-and-responsible-footer | todo | M0-06 | ⚖️ | Locale-aware age gate (legal drinking age table with sources), responsible-drinking footer with local help links; needs-human sign-off on copy and table |

## M2 · My Bar

| ID | Feature | Status | Depends | Marks | Acceptance |
|---|---|---|---|---|---|
| M2-01 | auth-core | todo | M0-03, M0-04 | 🔒 | ADR on the auth library; email + password sign-up, sign-in, sign-out, reset; sessions in Postgres with an http-only cookie; rate limits; no secrets in logs |
| M2-02 | auth-screens | todo | M2-01, M0-06 | 🔒 | Sign up, sign in, reset screens that work without JavaScript; errors never reveal whether an email exists |
| M2-03 | my-bar | todo | M2-01, M1-03 | 🔒 | Bar items API (add, remove, list) scoped per user; hierarchy-aware typeahead (category, type or brand); bulk add by category; isolation test |
| M2-04 | what-can-i-make | todo | M2-03, M0-07, M1-09 | 🧪 | Make now, one away (with the missing bottle named) and buy next ranked by drinks unlocked, from the engine; shown beside My Bar on desktop |
| M2-05 | substitutions | todo | M2-04 | 🧪 🔒 | Global substitution preferences per user (accept or refuse an edge); recipe lines marked `exact` are shown as such; results update immediately |
| M2-06 | custom-recipes | todo | M2-03, M1-08 | 🧪 🔒 | Create, edit, soft delete with undo, change history; lines resolve in the taxonomy; searchable and matched like house recipes; private by default; isolation test |
| M2-07 | favourites-ratings-notes | todo | M2-01, M1-08 | 🔒 | Favourite, 1–5 rating and a private note per recipe; lists and filters for them; isolation test |
| M2-08 | export-and-erase | todo | M2-06, M2-07 | 🔒 | Export everything a user owns as JSON and Markdown; account erase removes all user rows after confirmation; tests prove both |

## M3 · Public beta

| ID | Feature | Status | Depends | Marks | Acceptance |
|---|---|---|---|---|---|
| M3-01 | accessibility-audit | todo | M2-08 | | WCAG 2.2 AA audit of every screen with axe in e2e plus a manual keyboard and screen-reader pass; findings fixed |
| M3-02 | legal-and-privacy-pages | todo | M1-11 | ⚖️ | Terms, privacy, cookies, attribution page; needs-human review |
| M3-03 | observability-and-backups | todo | M0-02 | | Structured logs with the allow-list, error reporting without personal data, health dashboard, nightly Postgres backup with a restore test |
| M3-04 | deploy | todo | M3-02, M3-03 | ⚖️ | Hosting ADR (needs-human: costs money); staging and production; migrations on deploy; smoke test after deploy |
| M3-05 | onboarding | todo | M2-04 | | First visit to first "make now" in under 2 minutes: pick bottles by category, see results; measured in e2e |

## v1+ (later)

| ID | Feature | Status | Notes |
|---|---|---|---|
| L-01 | recipe-variations | later | Linked to a canonical spec, side-by-side diff, personal spec versions |
| L-02 | batch-calculator | later | Dilution, final ABV, freezer warning, per-guest standard drinks |
| L-03 | party-menu | later | Printable guest menu and combined shopping list |
| L-04 | sub-recipes | later | Homemade syrups that count toward inventory |
| L-05 | recipe-import | later | URL/JSON import with ingredient matching and manual override |
| L-06 | cost-per-drink | later | From bottle prices |
| L-07 | shared-bars | later | Multiple bars, shared household bars |
| L-08 | natural-language-search | later | Over the curated library, through `packages/ai-providers` |
| L-09 | bar-mode | later | Large type, one step per screen, wake lock, for phones and tablets |
| L-10 | recommendations | later | Family-based "you like Daiquiris, try these" |
