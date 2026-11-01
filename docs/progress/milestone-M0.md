# Milestone M0 · Foundation

Tagged `m0`. Every M0 feature merged with green gates; `pnpm verify:full` green on `main` after
the last merge (12 integration and 10 e2e tests, incl. axe on the landing page in light and dark
at 1440 and 360 px).

| ID | Feature | Merged |
|---|---|---|
| M0-01 | bootstrap-monorepo | `9466194` |
| M0-02 | local-stack-and-gates | `ea6b72b` |
| M0-03 | db-foundation | `b57d1e0` |
| M0-04 | api-contract-and-client | `dfcd304` |
| M0-05 | units-package | `46c2856` |
| M0-06 | design-tokens-and-app-shell | `f5bc25d` |
| M0-07 | engine-matching | `c1346e3` |
| M0-08 | landing-page | `780be90` |
| — | verifier fixes | `9a64151` |

## Demo checklist

Start the stack with `docker compose up -d --build --wait`, then open http://127.0.0.1:3300.

1. **Landing in both themes.** The page matches the approved mockup. The header moon/sun button
   switches theme, and the choice survives a reload. Footer "Theme: Light · Dark" works too.
2. **Live demo.** Default shelf: gin, sweet vermouth, bitter aperitivo plus the usual → you can
   make Americano, Gimlet, Negroni, Tom Collins; one away includes Boulevardier + Bourbon. Tick
   Bourbon: Boulevardier moves to "you can make" with no reload and no scroll jump.
3. **Swaps.** Untick gin and bourbon, tick Rye: Whiskey Sour is makeable (rye standing in for
   bourbon).
4. **Units.** Pick oz above the four cards: Negroni 1 / 1 / 1 oz, Daiquiri 2 oz, ¾ oz, ½ oz.
   Gin Buck in the green band follows too. cl: Negroni 3 cl each.
5. **Zero-proof.** "Try zero-proof" in the green band: the header switch turns on, the demo
   shows only zero-proof recipes (tick Zero-proof gin → Zero-proof Gin Sour). "Show everything"
   turns it off.
6. **Without JavaScript** (disable it in dev tools): ticking bottles and pressing "Show me", the
   unit "Show" button, the theme and zero-proof controls all still work.
7. **Buy next table.** For gin, bourbon, sweet vermouth, Angostura and the usual: bitter
   aperitivo first (3 new recipes: Americano, Boulevardier, Negroni).
8. **Keyboard.** Tab from the top: skip link, header, the shelf chips, buttons; focus is always
   visible.

Known placeholders, by design until later features: strength "[x.x]" (M1-02), house zero-proof
amounts "[ml]", paid-plan copy, IBA revision on the Daiquiri card.

## Verifier (against the running app, before fixes)

| Flow | Result |
|---|---|
| `/health` (db up) | PASS; db-down 503 covered by integration test |
| Demo make-now / one-away, 13 shelves recomputed by hand (child satisfies parent, one-hop one-way swaps, direct beats swap, zero-proof filter, basics off) | PASS |
| Unknown bottle → 400 | PASS |
| `exact` / `optional` lines over HTTP | NOT CHECKED (no sample recipe uses them; engine unit tests cover them) |
| Buy-next rows recomputed | PASS |
| Server-rendered demo page, empty and nothing-makeable states | PASS |
| Units oz (NIST 29.5735295625 ml/oz, ¼-oz rounding) and cl | PASS; zero band ignored units → **fixed** |
| Strength | NOT CHECKED (no model until M1-02) |
| `POST /prefs` local paths, `//host`, `/\host`, absolute URLs | PASS |
| `POST /prefs` with a tab in the return path | **FAIL → fixed** (`location: /\t/evil.example`; now `/`) |
| `POST /prefs` with CR/LF in the return path | **500 → fixed** (now `/`) |
| api gate: foreign Origin 403, non-JSON 415, no CORS | PASS |
| App role: not superuser/bypassrls/createdb/createrole, owns nothing, no DDL | PASS; temp tables were allowed → **fixed** (TEMP revoked from PUBLIC) |
| `app_user_id()` null without a setting | PASS |
| Two-user isolation over HTTP | NOT CHECKED (no user-owned routes in M0); harness integration tests PASS |

Notes kept open: a query validation error answers `400 {"error":"FST_ERR_VALIDATION"}` (a
framework code, not a 5xx); worth a generic `invalid_request` when the first user routes land.

Verdict: M0 meets its exit line. All failures found by the verifier are fixed and covered by
tests (`e2e/tests/shell.spec.ts`, `packages/db/test/roles.int.test.ts`).
