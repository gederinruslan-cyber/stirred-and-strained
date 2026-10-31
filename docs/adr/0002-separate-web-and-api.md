# 0002 — Separate web and API in one monorepo, with a pure engine

- **Status:** accepted
- **Date:** 2026-10-31
- **Feature:** M0-00

## Context
Stirred & Strained is a desktop-first web app with accounts, a curated library and an
inventory engine. The hard-to-copy value is deterministic domain logic (taxonomy,
substitutions, strength maths). Later candidates need a real API: AI tools that call the
engine, imports, a possible mobile client. The author already runs the same shape in
WholeMoney (Next.js web + Fastify api + generated OpenAPI client + local ship gate).

## Options
### A — One Next.js app (server components and actions talk to Postgres)
One deployable, least setup. The UI/logic boundary is discipline only; no API to reuse.
### B — Next.js web + Fastify api + pure domain packages (monorepo)
Two deployables and more setup, mostly copied from WholeMoney. A hard boundary (web holds no
business logic, reaches the api only through the generated client), a reusable API, an engine
testable on its own.

## Decision
B. The setup cost is low because it is reused, and the boundary protects the engine and the
"strength is derived" invariant from leaking into UI code. No worker or Redis until a feature
needs background jobs.

## Consequences
- `packages/engine` and `packages/units` are pure and carry the property tests.
- The API contract is generated from `packages/schema` (Zod → OpenAPI) and checked in CI.
- Reversal path: the api modules can be called from Next.js route handlers if the split ever
  costs more than it saves.
