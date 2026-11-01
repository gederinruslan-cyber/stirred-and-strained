# 0003 — User isolation: typed per-user transactions plus row-level security

- **Status:** accepted
- **Date:** 2026-11-01
- **Feature:** M0-03

## Context
`CLAUDE.md`: every user-owned query is scoped in the data layer and another user's id answers
404. Bars, custom recipes, notes and history arrive in M2. Postgres skips row checks for a
superuser or a role with BYPASSRLS, so the api's role matters as much as the queries.

## Options
### A — Repository scoping only
Every query adds `user_id = $1`. Simple; one forgotten `where` or raw query leaks silently.
### B — Row-level security only
The database enforces it; mistakes show up as empty results, not type errors, and queries still
need the filter for index use.
### C — Both
A typed helper `withUser(db, userId, work)` opens a transaction, sets `app.user_id` for that
transaction only, and hands `work` a scoped handle carrying the user id for explicit filters.
Every user-owned table enables RLS with `user_id = app_user_id()`, which is null (no rows) when
nothing is set. Cost: one transaction and one `set_config` per scoped unit of work.

## Decision
C. Two independent layers for the one invariant where a mistake is a privacy breach, at the
cost of a transaction per request. Roles: `stirred_owner` (no login, owns every object),
`stirred_migrator` (runs migrations as the owner), `stirred_app` (api runtime: NOSUPERUSER,
NOBYPASSRLS, owns nothing, data rights only). The image superuser only bootstraps roles. The
api refuses to start as a superuser or a BYPASSRLS role.

## Consequences
- Each user-owned table's migration enables RLS with the standard policy and its feature runs
  the isolation harness (`@stirred/db/test-support`) through its repository.
- Migrations are plain SQL with a down file each; Drizzle is used for typed queries only.
- Reversal: dropping the policies leaves A intact.
