#!/usr/bin/env bash
# pnpm verify:quick — the ship gate (docs/process/workflow.md):
#   1. pnpm verify;
#   2. postgres only, in the isolated project `stirred-verify` on the verify port;
#   3. roles and migrations (`pnpm db:setup`), then integration tests (`*.int.test.ts`) against it;
#   4. teardown of that project only, pass or fail.
GATE=verify:quick
source "$(dirname "${BASH_SOURCE[0]}")/verify-lib.sh"

postgres_up() {
  vcompose down -v --remove-orphans >/dev/null 2>&1 || true
  vcompose up -d --wait --wait-timeout 120 postgres
}

step "pnpm verify" pnpm verify
step "postgres up" postgres_up
step "roles and migrations" pnpm --silent db:setup
step "integration tests" pnpm test:integration
