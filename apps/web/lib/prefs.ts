// Per-viewer preferences kept in cookies: colour theme and zero-proof mode.
import { cookies } from "next/headers";
import type { Theme } from "./prefs-shared.ts";

export { PREF_MAX_AGE, type Theme } from "./prefs-shared.ts";

export async function readPrefs(): Promise<{ theme: Theme | null; zero: boolean }> {
  const jar = await cookies();
  const theme = jar.get("theme")?.value;
  return {
    theme: theme === "light" || theme === "dark" ? theme : null,
    zero: jar.get("zero")?.value === "1",
  };
}

/** A local path to return to, or "/" (never another site). */
export function safeBack(value: unknown): string {
  return typeof value === "string" && /^\/(?![/\\])/.test(value) ? value : "/";
}
