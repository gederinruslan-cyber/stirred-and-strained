# M0-01 bootstrap-monorepo

## Scenarios
- Given a fresh clone with Node from `.nvmrc` and pnpm from `packageManager`, when
  `pnpm install --frozen-lockfile && pnpm check && pnpm verify` runs, then both exit 0.
- Given `apps/web` imports `@stirred/engine`, `@stirred/db` or `@stirred/api`, when `pnpm lint`
  runs, then it fails naming the boundary rule.
- Given `packages/engine` or `packages/units` imports any other workspace package, when
  `pnpm lint` runs, then it fails (both depend on nothing in the repo).
- Given a `strict` compile error in any workspace, when `pnpm typecheck` runs, then it fails.
- Given a push to `main`, CI runs `pnpm verify`.

## Shape
- Workspaces: `apps/{web,api}`, `packages/{engine,units,schema,db,ui,api-client}`, `e2e`.
  Packages export TypeScript source (`exports: ./src/index.ts`); the api runs on Node's type
  stripping (`erasableSyntaxOnly`), the web transpiles workspace packages.
- Versions in the `pnpm-workspace.yaml` catalog, aligned with WholeMoney.
- New dev dependencies: turbo, typescript, typescript-eslint, eslint, eslint-config-next,
  prettier, vitest. Runtime: next, react, react-dom (web), fastify (api).

## End-to-end check
- Fresh clone into the scratchpad, install, `pnpm check`, `pnpm verify`; then a throwaway
  `import "@stirred/engine"` in web makes `pnpm lint` fail (reverted).
