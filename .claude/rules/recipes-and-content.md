---
paths:
  - "data/**"
  - "scripts/seed/**"
  - "packages/db/src/seed/**"
  - "apps/api/src/modules/recipes/**"
  - "apps/api/src/modules/import/**"
---

# Recipe content and licensing rules (apply when touching these files)

- Every house recipe carries `source` (name and URL), `attribution` (creator, bar, year where
  known) and `licence`. Recipe text (method, notes) is written by us; quantities and
  ingredient lists are facts and may be taken from open sources with attribution.
- Images: none without a licence record (`own`, a named licence with its URL, or a contract
  reference). Never hotlink or copy images from another site.
- The seed import fails, not warns, on a recipe without provenance, an ingredient that does not
  resolve in the taxonomy, or a quantity without a canonical unit.
- A variation links to its canonical spec (`variation_of`); it never overwrites it.
- Anything AI generated or AI tagged carries `ai_assisted` and is shown with a label; it is
  never marked `tested`.
- No brand promotion in house copy. Brand names appear only as ingredient nodes.
- Before using a new external data source, record its licence in `data/SOURCES.md` and add a
  needs-human item if the licence is unclear.
