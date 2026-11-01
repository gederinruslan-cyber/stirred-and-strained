# M0-06 design-tokens-and-app-shell

Design pass: the approved Bar Napkin system (`docs/design/patterns.md`, mockup) is the pass for
this feature; no new pattern is introduced.

## Scenarios
- **Tokens.** Every colour token exists in light and dark (`packages/ui/src/tokens.css`); a unit
  test reads that file and checks every text pair in both themes: 4.5:1 for body text, 3:1 for
  large handwritten accents (e.g. `--ink` on `--paper`, `--note` on `--sticky-y`, `--on-accent`
  on `--accent`, footer text on `--ft-bg`).
- **Theme follows the OS.** Given no saved choice, the page renders with the OS colour scheme.
- **Theme override, remembered.** Given the visitor presses the header theme button (or a footer
  Light/Dark control), the page switches at once and the choice is saved in a `theme` cookie
  for a year; the next page load renders that theme on the server (no flash). Without
  JavaScript the controls are forms that set the cookie and return to the same page; a return
  path that is not a local path falls back to `/`.
- **Zero-proof switch.** The header switch is a `role="switch"` with its state; pressing it
  saves a `zero` cookie (read by M0-08 and later features); works without JavaScript.
- **Shell.** Header (wordmark, Recipes, My Bar, zero-proof switch, search "Find a drink…",
  theme button, Sign in, Start my bar), skip link, footer (four columns, responsible line first
  in the small print, theme control). Usable at 360 px without horizontal scroll.
- **Components** in `@stirred/ui`: buttons, chips, switch, segmented control, search input,
  napkin card, recipe card with photo frame, sticky note, tags, table card, dialog.
- **Accessibility.** e2e: the home page has no axe violations (WCAG 2.2 A/AA) in light and dark;
  keyboard reaches the skip link first and every header control; theme toggle persists.

## Shape
- Fonts through `next/font/google` (self-hosted at build). Dev dep `@axe-core/playwright`.
- Theme and zero-proof cookies are set by web route handlers (`/prefs`), never the api.
