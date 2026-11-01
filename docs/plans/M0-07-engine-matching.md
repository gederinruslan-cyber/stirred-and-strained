# M0-07 engine-matching

## Scenarios (fixture taxonomy: spirits > whiskey > american whiskey > bourbon > Buffalo Trace …)
- **Child satisfies parent.** Owning Buffalo Trace (brand of bourbon) satisfies a line asking
  for bourbon and one asking for american whiskey; owning "whiskey" (the type) does not satisfy
  a line asking for bourbon.
- **Exact.** A line for Campari marked `exact` is satisfied only by Campari, not by another
  bitter aperitivo, a descendant of it or a substitute.
- **Substitution edges** are one-way and one hop: an edge rye → bourbon lets rye (or a rye
  brand) stand in for bourbon, not bourbon for rye, and edges never chain.
- **Optional** lines never block a recipe.
- **makeNow** returns the recipes whose required lines are all satisfied, each with the swaps
  it used (`{ line, using }`); a direct match wins over a swap; `using` is the owned node with
  the smallest id among equals.
- **oneAway** returns recipes with exactly one unsatisfied required line and names that line's
  ingredient.
- **buyNext** ranks the missing ingredients of one-away recipes by how many of them owning that
  ingredient would complete, listing those recipes.
- **Order** is deterministic and stated: recipes by name then id; buyNext by count desc, then
  ingredient name, then id. Shuffling the inputs never changes the output (property test).
- **Taxonomy guard.** Building a taxonomy with an unknown parent, a duplicate id, a cycle or an
  edge to an unknown node throws.
- **Sample library** (for the landing page): with gin, sweet vermouth, bitter aperitivo and the
  basics (lemon, lime, sugar, soda, water), makeNow includes Negroni and Americano; oneAway
  includes Boulevardier (bourbon); every sample line resolves to a sample-taxonomy node.

## Shape
- `packages/engine/src/{taxonomy,match}.ts`; fixture in `test/fixtures/taxonomy.ts`;
  `src/sample/` exported as `@stirred/engine/sample` (data only). Dev dep `fast-check`.
- Generic over recipes: `T extends { id; name; lines }`, results return `T`.
