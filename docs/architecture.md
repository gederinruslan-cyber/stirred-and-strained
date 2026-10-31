# Architecture

*Stack and module map. Binding decisions live in `docs/adr/`; this page is the summary. ADR
0002 records why the frontend and the API are separate.*

## Shape
A pnpm + Turborepo monorepo with two deployables and pure domain packages:

```
apps/web          Next.js (App Router): UI only, server-rendered, talks to the API through
                  the generated client from server code
apps/api          Fastify: auth, recipes, My Bar, search, import/export; a thin layer that
                  loads data, calls the engine and returns results
packages/engine   pure TS: taxonomy graph, matching, substitutions, make now / one away / buy next
packages/units    pure TS: canonical ml, oz/cl display, scaling, ABV, dilution, standard drinks
packages/db       Drizzle schema, plain SQL migrations, user-scoped data access, seed loader
packages/schema   Zod types shared by api and web (the API contract source)
packages/api-client  generated from the OpenAPI contract
packages/ui       design tokens and base components
packages/ai-providers  (later) provider interfaces + fallback
e2e               Playwright, desktop Chromium, production build
data              seed sources and their licences (`data/SOURCES.md`)
```

Dependency direction: `web → api-client → (contract) ← api → engine, units, db, schema`.
`engine` and `units` depend on nothing in the repo. `web` never imports `engine`, `db` or
`api`; display formatting comes from `units`.

## Runtime
- Postgres is the only store. No Redis or queue worker until a feature needs background jobs
  (first candidates: seed import, AI tagging; both start as scripts).
- Local stack in `docker-compose.yml`: postgres, api, web. Verify stacks use their own project
  name and ports.
- Node version in `.nvmrc`; TypeScript strict everywhere.

## Data model (outline; tables arrive with their features)
- **Taxonomy:** `ingredient` nodes (category > type > brand) with `parent_id`, ABV, and
  `substitution` edges (from, to, strength of match, notes).
- **House library:** `recipe` (method, glass, garnish, family, provenance, `variation_of`),
  `recipe_line` (ingredient node, quantity in ml or counted unit, `exact`, optional).
- **User data (user_id scoped):** `bar` and `bar_item`, `user_recipe` (same line shape),
  favourites, ratings, notes, change history.
