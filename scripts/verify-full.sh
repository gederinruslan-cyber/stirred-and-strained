#!/usr/bin/env bash
# pnpm verify:full — on main after a merge that touches screens or start-up, and at milestones:
#   1. pnpm verify;
#   2. build the images and start the whole stack (postgres, api, web serving a production
#      build) in the isolated project `stirred-verify`, waiting until every service is healthy;
#   3. integration tests against the verify Postgres;
#   4. Playwright e2e (desktop Chromium) against the verify web and api ports;
#   5. teardown of that project only, pass or fail.
GATE=verify:full
source "$(dirname "${BASH_SOURCE[0]}")/verify-lib.sh"

stack_up() {
  vcompose down -v --remove-orphans >/dev/null 2>&1 || true
  vcompose build --quiet
  vcompose up -d --wait --wait-timeout 300
}

e2e() {
  E2E_BASE_URL="http://127.0.0.1:${WEB_PORT}" E2E_API_URL="http://127.0.0.1:${API_PORT}" \
    E2E_MAIL_URL="http://127.0.0.1:${MAILPIT_PORT}" \
    pnpm --filter @stirred/e2e test:e2e
}

step "pnpm verify" pnpm verify
step "stack up" stack_up
step "integration tests" pnpm test:integration
step "playwright e2e" e2e
