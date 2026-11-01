# M1-03 · taxonomy-schema

Tables for the ingredient graph and substitution edges, in the shape the engine reads
(`IngredientNode` + ABV, `Substitution`). House data: read-only for the api at runtime; the seed
import (M1-06) writes it as the migrator.

## Scenarios
- **Shape.** Given nodes Spirits (category, 40%), Whiskey (type under Spirits), Bourbon (type under
  Whiskey, 45%), Rye (type under Whiskey) and the edge rye → bourbon, when the api loads the
  taxonomy, then it gets exactly those nodes ({id, name, kind, parentId, abv} with abv a number)
  and that edge, and `createTaxonomy` accepts them.
- **Kind rules.** A category has no parent; a type or a brand has one. A node with an unknown
  parent, an ABV below 0 or above 100, or an unknown kind is refused by the database.
- **Edges.** A substitution naming an unknown node, a node substituting for itself, or a duplicate
  edge is refused. Deleting a node that has children or edges is refused (no silent cascade).
- **Read-only at runtime.** The api role can read both tables and cannot insert, update or
  delete either.
- **Zero-proof parity.** A 0% node (soda water, zero-proof gin) is stored like any other.
- **Migration round-trips** (existing test covers every migration).

## Build
- `packages/db/migrations/0001_taxonomy.sql` + down: `ingredient_node`, `ingredient_substitution`;
  revoke insert/update/delete from `stirred_app` (default privileges grant them).
- `packages/db/src/taxonomy.ts`: `loadTaxonomy(db)` → `{ nodes, substitutions }`, ordered by id.
- No cycle check in SQL: `createTaxonomy` already refuses cycles at load, and the import runs it.

## Check
- Integration: `packages/db/test/taxonomy.int.test.ts` (one test per scenario above).
- End to end: `pnpm verify:quick` green (migrations up/down on real Postgres).
