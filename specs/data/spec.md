# Data and isolation

## Requirement: The api runs with least privilege
- **Scenario: runtime role.** The api's database role is not a superuser, cannot bypass
  row-level security, owns nothing and cannot create tables,
  temporary ones included.
- **Scenario: unsafe role refused.** Given the api is configured with a superuser, a BYPASSRLS
  role or a role that acts as the table owner, then it refuses to start and says why, without
  printing the connection details.
- **Scenario: setup is repeatable.** Setting up roles and migrations twice changes nothing.

## Requirement: Schema changes are reversible
- **Scenario: up and down.** Every migration has a down; applying all, undoing all and applying
  all again ends in the same state.
- **Scenario: incomplete migration refused.** A migration without a down, or one that manages its
  own transaction, is refused before anything runs.

## Requirement: A user reaches only their own rows
- **Scenario: another user's row.** Given user A owns a row, when user B reads, changes or deletes
  it by id, then B gets nothing (the api answers 404) and A's row is unchanged — also when the
  code forgets to filter by user.
- **Scenario: outside a user's scope.** Outside a user-scoped unit of work, user-owned tables
  show no rows.
- **Scenario: malformed user id.** A malformed user id is refused before any query runs.

## Requirement: The ingredient taxonomy is house data in the engine's shape
- **Scenario: shape.** Nodes (id, name, kind category|type|brand, parent, ABV 0–100) and one-way
  substitution edges load in the shape the engine reads, ordered by id; ABV is a number and
  zero-proof ingredients are stored at 0 like any other.
- **Scenario: kind rules.** A category has no parent; a type or brand has one; an unknown parent,
  an ABV outside 0–100 or an unknown kind is refused.
- **Scenario: edges.** An edge naming an unknown node, a node replacing itself or a duplicate edge
  is refused; deleting a node that still has children or edges is refused.
- **Scenario: read-only at runtime.** The api role can read the taxonomy and cannot insert,
  update or delete it.
