# Workflow

*One feature, end to end. `CLAUDE.md` "How work flows" is the authority; this page holds the
details that do not fit there.*

## Branches and merging
- `change/<name>` from an up-to-date `main`.
- `pnpm ship <name> "<type>(<scope>): <summary> [<ID>]"` is the only way onto `main`: it needs
  a clean tree and the branch on `origin`, merges `origin/main` into the branch if it moved,
  runs `pnpm verify:quick` on the branch head, squash-merges onto `main`, marks the
  `features.md` row `done` with the SHA, appends a `log.md` line, pushes and deletes the
  branch. A red gate stops it. Never force-push.
- CI (`.github/workflows/ci.yml`) runs `pnpm verify` on every push to `main` and on pull
  requests. `pnpm verify:full` runs locally on `main` after a merge that touches screens or
  start-up, and at milestones. A red `main` is the next task.
- Chores (bug against an existing scenario, refactor, docs, tooling, dependency bump) take the
  same path with a `[chore]` tag and no plan file.

## Parallel work
- A second feature may run in its own worktree
  (`git worktree add ../stirred-and-strained-<name> -b change/<name> main`). Worktrees never
  share a branch; each session stages explicit paths only.

## Specs
- `specs/<capability>/spec.md` is the living description of behaviour: requirements with
  Given/When/Then scenarios, nothing about files, tooling or process. After a feature merges,
  its scenarios are folded in (`docs(specs): <name>` on `main`).
- A plan (`docs/plans/<ID>-<name>.md`) exists only while a feature is in progress and is
  deleted at the fold.

## Design
- Every screen uses the approved Bar Napkin system (`docs/design/patterns.md`, mockup in
  `docs/design/mockups/`) in both themes.
- Screen features start with a `ui-ux-designer` pass on the scenarios. The result (layout,
  components, copy, states) goes into `docs/design/patterns.md`, which later features reuse.

## Decisions
- See `docs/adr/README.md`.

## Escalation
- Add an item to `docs/progress/needs-human.md`. Mark it `blocking` only if no other ready
  work exists. Always escalate: money (paid services, data licences), deploy and anything
  public, legal (recipe and image licensing, alcohol advertising, age rules), privacy and
  naming, the same failure three times, milestone demos. Delete an item once it is resolved;
  git keeps the history.

## Milestones
- `/next M<N>` runs a whole milestone (see `.claude/commands/next.md`). At the end: verifier
  against the running app, demo checklist in `docs/progress/milestone-M<N>.md`, tag `m<N>`, a
  `blocking` needs-human item "Milestone M<N> demo", stop.
