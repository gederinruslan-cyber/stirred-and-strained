"use client";
// The search page's JavaScript extras (the page works without them): "/" focuses the search
// (ignored inside text fields, can be turned off: WCAG 2.1.4), a ticked or unticked filter
// applies at once without leaving the page, and the filters fold away below 900 px when none
// is set.
import { useRouter } from "next/navigation";
import { useEffect, useSyncExternalStore } from "react";

const OFF = "finder-shortcut-off";
const CHANGED = "finder-shortcut-changed";

// The choice lives in this browser only; storage may be unavailable (private windows).
const subscribe = (notify: () => void) => {
  window.addEventListener(CHANGED, notify);
  window.addEventListener("storage", notify);
  return () => {
    window.removeEventListener(CHANGED, notify);
    window.removeEventListener("storage", notify);
  };
};
let offForNow = false; // the fallback when storage is blocked
const shortcutOn = () => {
  if (offForNow) return false;
  try {
    return localStorage.getItem(OFF) !== "1";
  } catch {
    return true; // storage blocked: keep the default
  }
};

export function FinderScript() {
  const router = useRouter();
  // The server renders no hint; the browser shows it unless it was turned off.
  const on = useSyncExternalStore(subscribe, shortcutOn, () => false);

  useEffect(() => {
    const form = document.querySelector<HTMLFormElement>("form.finder");
    if (!form) return;
    const details = form.querySelector<HTMLDetailsElement>("details.filters");
    const fold = () => {
      const set = form.querySelector("input[type=checkbox]:checked, [aria-invalid]");
      if (details && window.innerWidth < 900 && !set) details.open = false;
      if (details && window.innerWidth >= 900) details.open = true;
    };
    fold();
    window.addEventListener("resize", fold);
    const onChange = (event: Event) => {
      const input = event.target as HTMLInputElement;
      if (input.type !== "checkbox") return;
      const query = new URLSearchParams();
      for (const [k, v] of new FormData(form))
        if (typeof v === "string" && v.trim()) query.append(k, v);
      router.replace(`/recipes?${query.toString()}`, { scroll: false });
    };
    form.addEventListener("change", onChange);
    return () => {
      window.removeEventListener("resize", fold);
      form.removeEventListener("change", onChange);
    };
  }, [router]);

  useEffect(() => {
    if (!on) return;
    const onKey = (event: KeyboardEvent) => {
      const at = event.target as HTMLElement;
      if (event.key !== "/" || event.metaKey || event.ctrlKey || event.altKey) return;
      if (at.closest("input, textarea, select, [contenteditable=true]")) return;
      event.preventDefault();
      document.getElementById("q")?.focus();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [on]);

  if (!on) return null;
  return (
    <p className="finder__hint recipe__small muted">
      Press <kbd>/</kbd> to search ·{" "}
      <button
        type="button"
        className="linkish"
        onClick={() => {
          offForNow = true;
          try {
            localStorage.setItem(OFF, "1");
          } catch {
            // storage blocked: off until the page is reloaded
          }
          window.dispatchEvent(new Event(CHANGED));
        }}
      >
        Turn off
      </button>
    </p>
  );
}
