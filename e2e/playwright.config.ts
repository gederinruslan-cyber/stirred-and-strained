// Playwright against a running stack (pnpm verify:full sets the base URLs). Desktop Chromium,
// production build.
import { defineConfig, devices } from "@playwright/test";

const baseURL = process.env.E2E_BASE_URL ?? "http://127.0.0.1:3300";
/** Every test is an adult in the US unless it clears this (the age gate's own tests do). */
const adult = {
  cookies: [
    {
      name: "age",
      value: "ok|US",
      domain: new URL(baseURL).hostname,
      path: "/",
      expires: -1,
      httpOnly: true,
      secure: false,
      sameSite: "Lax" as const,
    },
  ],
  origins: [],
};

export default defineConfig({
  testDir: "tests",
  forbidOnly: true,
  retries: 0,
  reporter: [["list"], ["html", { open: "never" }]],
  use: {
    baseURL,
    storageState: adult,
    trace: "retain-on-failure",
  },
  projects: [{ name: "desktop-chromium", use: { ...devices["Desktop Chrome"] } }],
});
