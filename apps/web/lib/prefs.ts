// Per-viewer preferences kept in cookies: colour theme, display unit and the age answer.
import type { DisplayUnit } from "@stirred/units";
import { cookies } from "next/headers";
import { parseUnit } from "./amounts.ts";
import { AGE_COOKIE, parseAgeCookie, type AgeAnswer } from "./age.ts";
import type { Theme } from "./prefs-shared.ts";

export { PREF_MAX_AGE, type Theme } from "./prefs-shared.ts";

export type Prefs = {
  theme: Theme | null;
  age: AgeAnswer | null;
  /** ml, cl or oz: remembered across recipes and the landing. */
  unit: DisplayUnit;
};

export async function readPrefs(): Promise<Prefs> {
  const jar = await cookies();
  const theme = jar.get("theme")?.value;
  const age = parseAgeCookie(jar.get(AGE_COOKIE)?.value);
  return {
    theme: theme === "light" || theme === "dark" ? theme : null,
    age,
    unit: parseUnit(jar.get("unit")?.value),
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
