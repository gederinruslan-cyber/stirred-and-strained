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
  // Browsers drop tabs and newlines before resolving a URL ("/\t/evil" becomes "//evil"), so any
  // control character or backslash is refused outright.
  if (typeof value !== "string") return "/";
  if ([...value].some((c) => c.charCodeAt(0) < 32 || c.charCodeAt(0) === 127 || c === "\\"))
    return "/";
  return /^\/(?!\/)/.test(value) ? value : "/";
}
