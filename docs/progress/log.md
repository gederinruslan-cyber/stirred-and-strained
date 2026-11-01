# Progress log

*One line per merged feature (written by `pnpm ship`) and per milestone-mode step. Newest last.*

- 2026-10-31 · M0-00 process setup: CLAUDE.md, .claude (rules, agents, /next with milestone mode, /review), ADRs 0001–0002, features.md, workflow, ship script.
- 2026-11-01 · Design approved: Bar Napkin system (light + dark), landing spec and mockup in docs/design; landing page (M0-08) and engine matching (M0-07, moved from M1-04) added to M0; photo licence rule removed.
- 2026-11-01 · M0-01 `bootstrap-monorepo` merged (9466194); local verify:quick.
- 2026-11-01 · M0-01 report: merged 9466194; verify:quick (= verify) green; fresh clone check+verify green; review not needed; tests 0 lines (tooling; boundary rule proven by hand); open: none.
- 2026-11-01 · M0-02 `local-stack-and-gates` merged (ea6b72b); local verify:quick.
- 2026-11-01 · M0-02 report: merged ea6b72b; verify:quick green; verify:full on main green (51s); review not needed; tests 46 lines vs ~150 production (incl. scripts); open: none.
- 2026-11-01 · M0-05 `units-package` merged (46c2856); local verify:quick.
- 2026-11-01 · M0-05 report: merged 46c2856; verify:quick green; review APPROVE; tests 118 lines vs 92 production (over the ceiling by 26: property tests the engine-and-units rule requires); open: none.
- 2026-11-01 · M0-07 `engine-matching` merged (c1346e3); local verify:quick.
- 2026-11-01 · M0-07 report: merged c1346e3; verify:quick green; review APPROVE (note: top-ups need an ml figure before strength uses the sample library — M1-02); tests 165 lines vs ~240 production (engine 135 + sample data 105); open: none.
- 2026-11-01 · M0-03 `db-foundation` merged (b57d1e0); local verify:quick.
- 2026-11-01 · M0-03 report: merged b57d1e0; verify:quick green; verify:full on main green; review APPROVE + 2 notes fixed (owner-member role refused; migrations may not control transactions); tests ~190 lines vs ~210 production; open: none.
- 2026-11-01 · M0-04 `api-contract-and-client` merged (dfcd304); local verify:quick.
- 2026-11-01 · M0-04 report: merged dfcd304; verify:quick green; verify:full green on branch; review APPROVE + note fixed (origin normalised); tests 47 lines vs ~170 production; open: none.
- 2026-11-01 · M0-06 `design-tokens-and-app-shell` merged (f5bc25d); local verify:quick.
- 2026-11-01 · M0-06 report: merged f5bc25d; verify:full green (6 e2e incl. axe light/dark × desktop/360); review not needed; tests ~150 lines vs ~900 production (CSS + components); design pass = approved Bar Napkin, no new pattern; axe caught footer tagline contrast, fixed; open: none.
- 2026-11-01 · M0-08 `landing-page` merged (780be90); local verify:quick.
- 2026-11-01 · M0-08 report: merged 780be90; verify:full on main green (10 e2e incl. axe on the full landing, light/dark × desktop/360, no-JS demo); review not needed (read-only, no user data; engine already reviewed); tests ~110 lines vs ~900 production; open: strength placeholders until M1-02, house zero-proof recipes to write, IBA specs to check.
- 2026-11-01 · M0 `m0-verifier-fixes` merged (9a64151); local verify:quick.
- 2026-11-01 · M0 close: verifier ran against the running app; 1 fail + 2 minor fixed in 9a64151; verify:full green on main; milestone-M0.md written; tag m0; NH-3 demo (blocking).
- 2026-11-01 · M0 demo accepted by the human; NH-3 closed.
- 2026-11-01 · Decisions: NH-1 both sources credited (M1-05); bar before sign-up via cookie (M2-03); promise "Good drinks from what you've got"; zero-proof only from sources (M1-06/07); age-gate No → zero-proof session (M1-11); free, no paid plan; name decided before M3 (NH-2); IBA classics pinned by import test.
- 2026-11-01 · M0-08 `pricing-copy` merged (5b108a3); local verify:quick.
- 2026-11-01 · M1-03 `taxonomy-schema` merged (9a72887); local verify:quick.
- 2026-11-01 · M1-03 report: merged db32e88; verify:quick green (12 new integration tests); review PASS; tests ~70 lines vs ~45 production (SQL + loader, constraint cases parameterised); open: none.
- 2026-11-01 · M1-05 `seed-sources` merged (a70fd23); local verify:quick.
- 2026-11-01 · M1-05 report: merged a7bb195; verify:quick green; review not needed (docs only); no tests (docs); open: NH-3 final look before M1-06 ships; EU database right to confirm with counsel (M3-02).
- 2026-11-01 · M1-01 `strength-model-adr` merged (7d927d0); local verify:quick.
