# M0-04 api-contract-and-client

## Scenarios
- **Contract from schemas.** Given the api's routes declare Zod schemas from `packages/schema`,
  `pnpm contract:generate` writes `packages/api-client/openapi.json` (OpenAPI 3.1, keys sorted)
  and the client types; the client's `GET /health` is typed from it.
- **Drift fails verify.** Given a route schema changes without regenerating, `pnpm
  contract:check` (part of `pnpm verify`) fails naming the drifted file.
- **Response validation.** A route answering a body that doesn't match its schema fails (500),
  never sends an unchecked shape.
- **Mutating-route gate.** Given any POST, PUT, PATCH or DELETE: a body without
  `Content-Type: application/json` answers 415; an `Origin` header other than the web origin
  (`PUBLIC_ORIGIN`) answers 403; a server-side call with no Origin and JSON passes. GET is never
  gated.
- **Web reaches the api only from server code.** `apps/web/lib/api.ts` imports `server-only`
  and is the only web module that creates the client (lint rule: `@stirred/api-client` and
  `fetch` only there).

## Shape
- Runtime deps: `zod` (schema), `fastify-type-provider-zod` + `@fastify/swagger` (api, emit),
  `openapi-fetch` (api-client), `server-only` (web). Dev: `openapi-typescript`.
- `scripts/contract.ts generate|check`; the emit builds the app with a pool that never connects.
