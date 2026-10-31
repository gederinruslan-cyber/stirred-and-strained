---
paths:
  - "package.json"
  - "pnpm-lock.yaml"
  - "pnpm-workspace.yaml"
  - "apps/*/package.json"
  - "packages/*/package.json"
  - "e2e/package.json"
  - ".nvmrc"
---

# Dependency changes (apply when touching these files)

- Shared versions live in the `catalog:` of `pnpm-workspace.yaml`; workspaces reference them.
- Any new runtime dependency: say in the commit why it is needed and what it reads or writes.
  Prefer a few lines of our own code over a dependency.
- Install scripts are denied unless listed in `allowBuilds` with a reason.
- Bumping `next`, `react`, the auth library, `drizzle-orm`, `pg` or Node: run `pnpm verify:full`
  before merge and record the result in the commit message.
