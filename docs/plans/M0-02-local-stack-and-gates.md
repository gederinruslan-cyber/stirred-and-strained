# M0-02 local-stack-and-gates

## Scenarios
- Given Postgres is reachable, when `GET /health` hits the api, then 200
  `{ "status": "ok", "db": "up" }`.
- Given Postgres is not reachable, when `GET /health`, then 503 `{ "status": "degraded",
  "db": "down" }` within the health timeout (no hang, no URL or password in the body).
- Given the stack is up (`docker compose up`), when `GET /` on the web port, then 200 with the
  page heading; the api answers `/health` 200 on its port. Ports bind to 127.0.0.1.
- Given `pnpm verify:quick`, then it runs verify, starts Postgres in project `stirred-verify` on
  the verify port, runs the integration tests and tears the project down, pass or fail.
- Given `pnpm verify:full`, then it runs verify, builds and starts the full stack in
  `stirred-verify`, runs integration tests and the Playwright smoke, and tears down.

## Shape
- `Dockerfile` (multi-stage: deps → build → `api` and `web` targets); `docker-compose.yml`
  with postgres, api, web; `.env.example` documents every variable (local-only defaults).
- `packages/db` gets `createPool(url)` (pg); the api's `/health` runs `select 1` with a 2 s
  timeout. New runtime deps: `pg` (db). Dev: `@playwright/test` (e2e).
- Integration tests: `*.int.test.ts`, root `vitest.integration.config.ts`.
- Dev loop: `docker compose up -d postgres` + `pnpm dev` on the host.

## End-to-end check
- `pnpm verify:quick` and `pnpm verify:full` green; `docker compose ls` shows no
  `stirred-verify` afterwards.
