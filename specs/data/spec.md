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
