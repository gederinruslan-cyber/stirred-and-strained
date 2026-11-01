"use client";
// The header theme button: switches at once and remembers the choice in a cookie. Without
// JavaScript it submits its form to /prefs instead.
import { useState, useSyncExternalStore } from "react";
import { MoonIcon, SunIcon } from "@stirred/ui";
import { PREF_MAX_AGE, type Theme } from "../lib/prefs-shared.ts";

const QUERY = "(prefers-color-scheme: dark)";
function subscribe(onChange: () => void) {
  const media = window.matchMedia(QUERY);
  media.addEventListener("change", onChange);
  return () => media.removeEventListener("change", onChange);
}

export function ThemeToggle({ initial, back }: { initial: Theme | null; back: string }) {
  const osDark = useSyncExternalStore(
    subscribe,
    () => window.matchMedia(QUERY).matches,
    () => false,
  );
  const [chosen, setChosen] = useState<Theme | null>(initial);
  const dark = chosen ? chosen === "dark" : osDark;
  const next: Theme = dark ? "light" : "dark";

  return (
    <form method="post" action="/prefs" className="inline-form">
      <input type="hidden" name="back" value={back} />
      <button
        type="submit"
        name="theme"
        value={next}
        className="icon-btn"
        aria-label="Dark theme"
        aria-pressed={dark}
        onClick={(event) => {
          event.preventDefault();
          setChosen(next);
          document.documentElement.dataset.theme = next;
          document.cookie = `theme=${next}; path=/; max-age=${PREF_MAX_AGE}; samesite=lax`;
        }}
      >
        {dark ? <SunIcon /> : <MoonIcon />}
      </button>
    </form>
  );
}
