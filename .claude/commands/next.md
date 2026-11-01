---
description: Take the next ready feature (or a whole milestone) from docs/features.md through plan, build, review-on-risk and ship
argument-hint: "[feature ID | milestone ID, e.g. M1-03 or M1]"
---

Follow `CLAUDE.md` "How work flows". `$ARGUMENTS` picks the scope:

- **empty** → one feature: the first `ready` row in `docs/features.md` whose dependencies are
  `done`.
- **a feature ID** (`M1-03`) → that feature only.
- **a milestone ID** (`M1`) → milestone mode: every not-done feature of that milestone, one
  after another, then the milestone close.

Say which feature (or milestone and the ordered feature list) you picked and why before
starting.

## One feature

1. Preconditions: working tree clean on `main`, `git pull --ff-only` succeeded, no `blocking`
   item in `docs/progress/needs-human.md`. Mark the row `in-progress` (commit it with the plan).
2. Plan: read the acceptance criteria, related specs, ADRs and the code you will touch. Write
   the scenarios plus the end-to-end check, under 60 lines, into `docs/plans/<ID>-<name>.md`.
   Screen features: run the `ui-ux-designer` agent on the scenarios first, inside the approved
   Bar Napkin system, and record any new pattern in `docs/design/patterns.md`. A real architecture decision gets an ADR
   first; stop for the human only if it costs money, locks in a vendor or touches legal,
   licensing or privacy. In single-feature mode, use plan mode and wait for approval.
3. Branch `change/<name>` from `main`. Build test-first against the scenarios; commit per
   coherent step; `pnpm check` as you go; `pnpm verify` before pushing. Push the branch.
4. If this feature adds a table, a user-data write path, engine or strength logic, or changes
   auth, run `/review` once. Fix any BLOCK; re-run on that finding only. Otherwise skip this
   step and say so.
5. `pnpm ship <name> "<type>(<scope>): <summary> [<ID>]"`. If the gate is red, read the
   failure, fix, push, ship again. The same failure three times → add a `needs-human` item and
   stop. After a merge that touches screens or start-up, run `pnpm verify:full` on `main`
   once; if it is red, fixing it is the next task.
6. Fold the scenarios into the matching `specs/<capability>/spec.md` (behaviour only) and
   commit that to `main` directly as `docs(specs): <name>`. Delete the plan file. Push.
7. Report: feature, merged SHA, gate result, review verdict (or "not needed"), test lines vs
   production lines, anything left open.

## Milestone mode

1. List the milestone's features that are not `done`, in dependency order (a feature runs only
   when every dependency is `done`, including ones outside the milestone). If a dependency
   outside the milestone is not done, stop and report it.
2. Run **One feature** for each, in order, with these differences:
   - Do not enter plan mode or wait for approval: write the plan file and proceed. Stop only
     for a human checkpoint (`CLAUDE.md`), a `blocking` needs-human item or the same failure
     three times.
   - A feature that needs a human decision: add a `needs-human` item, mark the row `blocked`
     with the item number, and continue with the next feature that does not depend on it.
   - After each feature, append its step-7 report as one line to `docs/progress/log.md` before
     starting the next, so progress survives a context reset. On resume, re-read
     `docs/features.md` and `log.md` and continue from the first not-done feature.
3. Milestone close, when every feature of the milestone is `done`: run `pnpm verify:full` on
   `main`, run the **verifier** agent against the running app, write the demo checklist and
   the verifier's table to `docs/progress/milestone-<M>.md`, tag `m<N>` and push the tag, add a
   `blocking` needs-human item "Milestone <M> demo", and stop.
4. Report: features shipped with SHAs, features blocked and why, verifier verdict, open items.

Never force-push, deploy, spend money or touch secrets. Report a failure as a failure.
