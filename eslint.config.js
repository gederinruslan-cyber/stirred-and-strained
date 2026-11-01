// The single ESLint flat config for the whole repository; workspaces never add their own.
// Boundaries (docs/architecture.md): web never imports engine, db or api; engine and units
// depend on nothing in the repo.
import js from "@eslint/js";
import nextCoreWebVitals from "eslint-config-next/core-web-vitals";
import { defineConfig, globalIgnores } from "eslint/config";
import globals from "globals";
import tseslint from "typescript-eslint";

const WEB_BANNED = ["@stirred/engine", "@stirred/db", "@stirred/api"].map((name) => ({
  group: [name, `${name}/*`],
  message: `apps/web holds no business logic: it reaches the API through @stirred/api-client, never ${name} (boundary rule).`,
}));

const PURE_BANNED = [
  {
    group: ["@stirred/*"],
    message:
      "packages/engine and packages/units are pure and depend on nothing in the repo (boundary rule).",
  },
];

export default defineConfig([
  globalIgnores(["**/node_modules/", "**/dist/", "**/.next/", "**/.turbo/", "**/next-env.d.ts"]),
  js.configs.recommended,
  tseslint.configs.recommended,
  {
    languageOptions: { globals: { ...globals.node } },
  },
  {
    files: ["apps/web/**/*.{ts,tsx}"],
    extends: [nextCoreWebVitals],
    settings: { next: { rootDir: "apps/web" } },
    languageOptions: { globals: { ...globals.browser } },
    rules: { "no-restricted-imports": ["error", { patterns: WEB_BANNED }] },
  },
  {
    files: ["packages/engine/**/*.ts", "packages/units/**/*.ts"],
    rules: { "no-restricted-imports": ["error", { patterns: PURE_BANNED }] },
  },
]);
