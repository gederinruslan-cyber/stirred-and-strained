import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const css = readFileSync(join(import.meta.dirname, "..", "src", "tokens.css"), "utf8");

function block(selector: string): Record<string, string> {
  const start = css.indexOf(selector);
  const open = css.indexOf("{", start);
  const body = css.slice(open + 1, css.indexOf("}", open));
  return Object.fromEntries(
    [...body.matchAll(/--([\w-]+):\s*(#[0-9a-f]{6});/gi)].map((m) => [m[1], m[2]]),
  );
}

const THEMES = {
  light: block(":root {"),
  "dark (OS)": block(':root:not([data-theme="light"])'),
  "dark (chosen)": block(':root[data-theme="dark"]'),
};

/** WCAG 2.2 relative luminance and contrast ratio. */
function luminance(hex: string): number {
  const [r, g, b] = [1, 3, 5].map((i) => {
    const c = parseInt(hex.slice(i, i + 2), 16) / 255;
    return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * r! + 0.7152 * g! + 0.0722 * b!;
}
const contrast = (a: string, b: string) => {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (hi! + 0.05) / (lo! + 0.05);
};

// [text, background, minimum]: 4.5 for body text, 3 for large handwritten accents.
const PAIRS: [string, string, number][] = [
  ...["paper", "card", "sticky-y", "sticky-g", "seg", "rowhl", "hl"].map(
    (bg): [string, string, number] => ["ink", bg, 4.5],
  ),
  ["muted", "paper", 4.5],
  ["muted", "card", 4.5],
  ["note", "sticky-y", 4.5],
  ["note", "sticky-g", 4.5],
  ["note", "card", 4.5],
  ["accent", "paper", 4.5],
  ["accent", "card", 4.5],
  ["accent-hover", "paper", 4.5],
  ["on-accent", "accent", 4.5],
  ["on-accent", "accent-hover", 4.5],
  ["accent", "sticky-y", 3],
  ["accent", "sticky-g", 3],
  ["accent", "rowhl", 3],
  ["zero", "card", 4.5],
  ["zero", "paper", 4.5],
  ["zero", "sticky-g", 4.5],
  ["zero-text", "sticky-g", 4.5],
  ["paper", "ink", 4.5],
  ["ft-ink", "ft-bg", 4.5],
  ["ft-muted", "ft-bg", 4.5],
  ["ft-accent", "ft-bg", 4.5],
];

describe("token contrast", () => {
  it("defines the same tokens in every theme", () => {
    expect(Object.keys(THEMES["dark (OS)"]).sort()).toEqual(Object.keys(THEMES.light).sort());
    expect(THEMES["dark (chosen)"]).toEqual(THEMES["dark (OS)"]);
  });

  for (const [theme, tokens] of Object.entries(THEMES)) {
    it.each(PAIRS)(`${theme}: --%s on --%s meets %s:1`, (text, bg, min) => {
      expect(contrast(tokens[text]!, tokens[bg]!)).toBeGreaterThanOrEqual(min);
    });
  }
});
