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
