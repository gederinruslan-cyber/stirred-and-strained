# Stirred & Strained

A desktop-first web app for the home bar: a curated, attributed cocktail library on an
inventory-aware engine (what can I make, one bottle away, what to buy next), with custom
recipes and zero-proof parity. Working name.

- What to build next: [`docs/features.md`](docs/features.md)
- How work flows: [`CLAUDE.md`](CLAUDE.md), [`docs/process/workflow.md`](docs/process/workflow.md)
- Architecture: [`docs/architecture.md`](docs/architecture.md), [`docs/adr/`](docs/adr/)
- Research: [`docs/research/`](docs/research/)

## Getting started
Node from `.nvmrc` (24 LTS) and pnpm from `packageManager` (`corepack enable`).

```bash
pnpm install
docker compose up -d postgres   # Postgres on 127.0.0.1:5433
cp .env.example .env            # local-only defaults
pnpm dev                        # api on :4300, web on :3300 (or `docker compose up` for all three)

pnpm check         # lint · typecheck · unit
pnpm verify        # check + format · build
pnpm verify:quick  # verify + Postgres container · integration tests (the ship gate)
pnpm verify:full   # verify + full stack in Docker · integration · Playwright
```
