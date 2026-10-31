---
paths:
  - "apps/web/**"
  - "packages/ui/**"
---

# Web rules (apply when touching these files)

- `apps/web` holds no business logic and reaches the API only through the generated client
  (`packages/api-client`) from server code. Matching, strength and unit conversion are never
  reimplemented in the web; display goes through `packages/units` formatters.
- Desktop-first: design for wide screens (filters beside results, side-by-side compare,
  keyboard shortcuts in search and My Bar), and stay usable at 360 px without horizontal
  scroll.
- Recipe pages render on the server with schema.org/Recipe markup and a stable, readable URL.
- Every alcoholic recipe shows finished ABV and standard drinks; every house recipe shows its
  attribution; anything AI touched shows its label. Zero-proof drinks are never visually
  second-class.
- Forms work without JavaScript where practical (server actions); never keep a password across
  a failed submit.
- Accessibility: WCAG 2.2 AA; real buttons, links and labels; 4.5:1 contrast; 24 px minimum
  targets (44 px on touch layouts); keyboard and screen reader usable; light and dark; reduced
  motion; colour is never the only signal.
- Patterns and copy live in `docs/design/patterns.md`; reuse before inventing. A new component
  or token is a decision to call out, not to slip in.
