// Playwright against a running stack (pnpm verify:full sets the base URLs). Desktop Chromium,
// production build.
import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "tests",
  forbidOnly: true,
  retries: 0,
  reporter: [["list"], ["html", { open: "never" }]],
  use: {
    baseURL: process.env.E2E_BASE_URL ?? "http://127.0.0.1:3300",
    trace: "retain-on-failure",
  },
  projects: [{ name: "desktop-chromium", use: { ...devices["Desktop Chrome"] } }],
});
