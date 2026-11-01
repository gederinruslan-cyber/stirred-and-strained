# Shared by verify-quick.sh and verify-full.sh (sourced). Isolated Compose project on the
# verify ports, every variable set explicitly so a developer `.env` is never involved, and a
# teardown trap that removes the project pass or fail. Never prints a database URL.
set -euo pipefail
export NEXT_TELEMETRY_DISABLED=1 TURBO_TELEMETRY_DISABLED=1

readonly PROJECT="${VERIFY_PROJECT:-stirred-verify}"
case "$PROJECT" in stirred-verify*) ;; *) echo "verify: VERIFY_PROJECT must start with stirred-verify" >&2; exit 2 ;; esac

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT"

export COMPOSE_PROJECT_NAME="$PROJECT"
export WEB_PORT="${VERIFY_WEB_PORT:-13300}"
export API_PORT="${VERIFY_API_PORT:-14300}"
export POSTGRES_PORT="${VERIFY_POSTGRES_PORT:-15433}"
export POSTGRES_USER=stirred POSTGRES_PASSWORD=stirred_local_only POSTGRES_DB=stirred
export MIGRATOR_DB_PASSWORD=stirred_migrator_local_only APP_DB_PASSWORD=stirred_app_local_only
# One URL per role (ADR 0003), host side.
export DATABASE_ADMIN_URL="postgres://${POSTGRES_USER}:${POSTGRES_PASSWORD}@127.0.0.1:${POSTGRES_PORT}/${POSTGRES_DB}"
export MIGRATION_DATABASE_URL="postgres://stirred_migrator:${MIGRATOR_DB_PASSWORD}@127.0.0.1:${POSTGRES_PORT}/${POSTGRES_DB}"
export DATABASE_URL="postgres://stirred_app:${APP_DB_PASSWORD}@127.0.0.1:${POSTGRES_PORT}/${POSTGRES_DB}"

vcompose() { docker compose -p "$PROJECT" -f docker-compose.yml "$@"; }

STARTED=$SECONDS
FAILED=0
teardown() {
  local code=$?
  set +e
  if ((FAILED == 0)); then FAILED=$code; fi
  echo
  echo "${GATE}: tearing down Compose project ${PROJECT}"
  vcompose down -v --remove-orphans >/dev/null 2>&1
  echo "${GATE}: $([ "$FAILED" = 0 ] && echo PASSED || echo "FAILED (exit ${FAILED})") in $((SECONDS - STARTED))s"
  exit "$FAILED"
}
trap teardown EXIT

step() {
  echo
  echo "==> ${GATE}: $1"
  shift
  local start=$SECONDS
  "$@" || { FAILED=$?; echo "${GATE}: step failed (exit ${FAILED})" >&2; exit "$FAILED"; }
  echo "${GATE}: done in $((SECONDS - start))s"
}
