---
paths:
  - "packages/engine/**"
  - "packages/units/**"
  - "packages/schema/**"
---

# Engine and units rules (apply when touching these files)

- `packages/units` and `packages/engine` are pure TypeScript: no database, no HTTP, no clock,
  no randomness. Inputs in, results out. The api loads data and calls them.
- A quantity is `{ value, unit }` where `unit` is `ml` or a counted unit (`dash`, `barspoon`,
  `drop`, `piece`, `top`). Liquid volume is stored and computed in ml; oz and cl exist only at
  display through `formatQuantity`. Conversion constants live in one file and cite a source.
- Rounding happens once, at display, with a stated rule (oz to the nearest 1/4, ml to whole).
  Scaling (servings, batches) works on canonical values, then rounds.
- Strength: finished ABV = alcohol volume / (ingredient volume + dilution). The dilution model
  per method (stirred, shaken, built, blended, thrown) is a named function with its source in
  the ADR that introduced it. Standard drinks use a per-country gram value table with sources.
  A counted unit has a declared ml equivalent or is excluded from strength with a reason.
- Matching reads only the taxonomy graph: an ingredient satisfies a requirement if it is the
  same node or a descendant (bourbon satisfies whiskey, never the reverse), or through an
  explicit substitution edge. A recipe line marked `exact` accepts only its own node.
- "One away" and "buy next" are deterministic: same inputs, same order; ties break by a stated
  key, never by insertion order.
- A strength or units test is a property test (fast-check) and covers zero-proof (0% ABV), a
  counted unit, a very small and a very large volume, and every display unit.
- An engine test uses the fixture taxonomy in `packages/engine/test/fixtures`, never seed data.
