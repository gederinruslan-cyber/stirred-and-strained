# Stirred & Strained — the home bar, with recipes you can trust

Desktop-first web app for home bartenders: a curated, attributed cocktail library on top of an
inventory-aware engine ("what can I make", "one bottle away", "what to buy next"), with
substitutions a bartender would accept, first-class custom recipes and zero-proof parity.
Promise: **"Every spec tested, every bottle counted."** ("Stirred & Strained" is a working name.)

Read `docs/features.md` for what to build next. Product background and evidence:
`docs/research/Cocktail app feature landscape.md`. Stack and module map: `docs/architecture.md`.
Binding decisions: `docs/adr/`. How a feature flows: `docs/process/workflow.md`. Behaviour
specs, kept current after each merge: `specs/`. Path-scoped rules for the engine, content,
data, web and dependencies load from `.claude/rules/` when you touch those files.

## Invariants (never bend these)

- **Quantities are canonical.** Every amount is stored in ml (or a counted unit: dash, barspoon,
  piece) through `packages/units`. oz and cl are display only. Rounding once, at display.
- **Strength is derived and explainable.** Finished ABV, dilution and standard drinks come from
  one function in `packages/units` with a stated, cited model. Never typed in, never stored as
  truth.
- **One ingredient taxonomy.** Every ingredient resolves to category > type > brand. Matching,
  "make now", "one away", "buy next" and substitutions read only from that graph, in
  `packages/engine`, which is pure (no database, no HTTP).
- **Every recipe has provenance.** House recipes carry source, attribution and licence; text is
  our own. An import without them fails.
- **User recipes are never lost.** Soft delete with undo, change history, export always
  available. Custom recipes are searchable and match inventory like house recipes.
- **User isolation below HTTP.** Every user-owned query is scoped in the data layer; another
  user's id answers 404. Never rely on the UI or an id being secret.
- **Zero-proof parity.** No-alcohol drinks and ingredients go through the same engine and the
  same strength maths, never a separate code path.
- **AI is labelled and never authoritative.** It never invents a spec shown as tested, goes only
  through `packages/ai-providers` with a fallback, and the app works with AI off.
- **One design system.** Every screen uses Bar Napkin (`docs/design/patterns.md`) in light and
  dark, through its tokens and components; a new pattern extends it, never replaces it.
- **Responsible by default.** Locale-aware age gate, finished ABV and standard drinks on every
  alcoholic recipe, no copy that encourages excess. Accessibility is WCAG 2.2 AA.
- **Privacy.** No personal data in logs, analytics or error reports. Export and delete always
  available. Synthetic fixtures only.

## How work flows

One feature at a time from `docs/features.md`, end to end:

1. **Plan**: read the feature's acceptance criteria, the related specs and ADRs, and the code
   you will touch. Write the plan as scenarios (Given/When/Then, real quantities, the isolation
   case, the strength or matching edge case) plus the end-to-end check that proves it, into
   `docs/plans/<ID>-<name>.md`. Under 60 lines. A decision with a real alternative gets a short
   ADR first. Screen features get a `ui-ux-designer` pass that works inside the approved Bar Napkin
   design system and records any new pattern in `docs/design/patterns.md`.
2. **Build** on a `change/<name>` branch, test-first for new behaviour, smallest change that
   satisfies the scenarios. Commit per coherent step with explicit paths. Run `pnpm check`
   often and `pnpm verify` before pushing.
3. **Second opinion, when it is cheap insurance.** `/review` runs a fresh-context reviewer over
   the diff with two questions: can a user see a wrong spec or strength, can a user lose their
   recipes or reach another user's data. Use it the first time a feature adds a table, a write
   path for user data, engine or strength logic, or an auth change. Fix a BLOCK; ignore notes.
4. **Ship.** `pnpm ship <name> "<type>(<scope>): <summary> [<ID>]"` runs `pnpm verify:quick` on
   the branch head, squash-merges to `main` on green, marks the feature done and deletes the
   branch. CI runs `pnpm verify` on every push to `main`; run `pnpm verify:full` (e2e) on `main`
   after a merge that touches screens or start-up, and at milestones. A red `main` is the next
   thing to fix. Then fold the scenarios into `specs/`.
5. **Milestone.** At the end of a milestone run the verifier against the running app and ask
   the human for the demo.

`/next` runs steps 1 to 4 for the next ready feature; `/next M1` runs a whole milestone. Human
checkpoints: milestone demos, anything costing money, deploys and anything public, legal
(licensing, alcohol advertising, age rules), privacy and naming, and the same failure three
times.

## Change discipline

- Make the smallest change that satisfies the scenarios. Do not refactor, rename or "improve"
  code you were not asked to touch. Removing code counts as progress.
- No abstraction for a single use. Inline first; extract at three real call sites.
- No defensive handling for inputs that cannot occur; the type system and the gate refuse them.
- No new repo check, lint rule or fixture unless a scenario in the feature needs it.
- A spec gap (a scenario cannot hold) is a one-line amendment in the plan, not a process.
- If a change needs a new dependency, a new table or a cross-module call, say so in the plan.

## Tests

- One test per scenario at the cheapest layer that proves it: unit (Vitest) over integration
  (real Postgres) over e2e (Playwright, desktop Chromium, production build).
- Always: unit conversion and strength maths as property tests; engine matching and
  substitution against a fixture taxonomy; user isolation as an integration test per
  user-owned resource; auth and session boundaries; the critical user flows in e2e.
- Never: tests that restate config, constants or library behaviour; e2e for static layout.
- Ceiling: test lines at most equal production lines in a change. Red-first for new behaviour.

```bash
pnpm check         # lint · typecheck · unit (fast; the Stop hook runs this)
pnpm verify        # check + format · contract · build (CI runs this on main)
pnpm verify:quick  # verify + Postgres container · integration tests (the ship gate)
pnpm verify:full   # verify:quick + full stack · e2e (on main)
```

## Conventions

- TypeScript everywhere; pnpm + Turborepo; Next.js web (UI only), Fastify api, Postgres with
  Drizzle and plain SQL migrations. Details in `docs/architecture.md` and ADR 0002.
- Conventional commits on branches; `main` gets one squashed commit per feature. Never
  force-push. Never commit secrets; `.env` is gitignored.
- Default AI model: `claude-opus-5-5`; every provider behind `packages/ai-providers`.
