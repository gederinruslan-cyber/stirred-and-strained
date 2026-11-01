# M0-03 db-foundation (ADR 0003)

## Scenarios
- **Roles.** Given `pnpm db:setup` on an empty database, then `stirred_owner`, `stirred_migrator`
  and `stirred_app` exist; `stirred_app` is NOSUPERUSER and NOBYPASSRLS, owns nothing and cannot
  create a table. Running setup twice changes nothing.
- **Startup guard.** Given the api connects as a superuser or a BYPASSRLS role, then it refuses
  to start, naming the reason (never the URL).
- **Migrations.** Given the migrations, `migrate` applies the pending ones in order, each in a
  transaction, as the owner, recorded in `schema_migrations`; a migration without a down file is
  refused before anything runs; `rollback` undoes the last one; up → down all → up round-trips.
- **Scoped access.** Given `withUser(db, userId, work)`, `work` runs in one transaction with
  `app.user_id` set for that transaction only; afterwards an unscoped query on a user table sees
  no rows. A malformed user id is refused before any query.
- **Isolation harness** (throwaway table with the standard policy). Given user A creates a row,
  when user B reads, updates or deletes it by id, then B gets nothing (read null, update and
  delete affect 0 rows; the api maps these to 404) and A's row is unchanged. The same holds for a
  careless repository that forgets its `user_id` filter (RLS catches it).

## Shape
- `packages/db/src/{bootstrap,migrate,scope,role-check,cli}.ts`, `migrations/0000_foundation.sql`
  (+ `down/`), `test-support/isolation.ts` exported as `@stirred/db/test-support`.
- New runtime dep: `drizzle-orm` (typed queries over the existing `pg` pool).
- URLs: `DATABASE_ADMIN_URL` (bootstrap only), `MIGRATION_DATABASE_URL`, `DATABASE_URL` (app).
  Compose gets a one-shot `db-setup` before the api; verify scripts run setup before tests.

## End-to-end check
- `pnpm verify:quick` and `pnpm verify:full` green with the api running as `stirred_app`.
