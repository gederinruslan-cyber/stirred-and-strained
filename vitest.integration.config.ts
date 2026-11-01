// Integration tests (`*.int.test.ts`) against a real Postgres; run by verify:quick and
// verify:full with DATABASE_URL pointing at the verify database.
import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    allowOnly: false,
    include: ["apps/**/*.int.test.ts", "packages/**/*.int.test.ts"],
    exclude: ["**/node_modules/**"],
    fileParallelism: false,
  },
});
