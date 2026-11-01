# Seed data sources

What the house library is built from, what we take, and how each source is credited. We take
**facts only**: ingredient lists, amounts, method (stirred, shaken, built…), glass and garnish.
Every description and every step is written by us. Each recipe's photo is the first image of
the same Bar Assistant entry (`scripts/fetch-photos.sh`).

Researched 2026-11-01. Decision (2026-11-01, needs-human NH-1): use both sources below with
credit, all text ours.

## Why facts can be taken

- US Copyright Office, Circular 33 "Works Not Protected by Copyright" (rev. 03/2021), _Recipes_:
  "A mere listing of ingredients or contents, or a simple set of directions, is
  uncopyrightable." https://www.copyright.gov/circs/circ33.pdf
- Compendium (Third) §313.4(F), "Mere Listing of Ingredients or Contents" (first example: a
  list of ingredients for a recipe).
  https://www.copyright.gov/comp3/chap300/ch300-copyrightable-authorship.pdf
- **EU database right** (Directive 96/9/EC, art. 7): extracting a _substantial part_ of a
  database built with substantial investment can infringe even when each entry is a fact.
  https://eur-lex.europa.eu/eli/dir/1996/9/oj/eng — _to confirm with counsel before launch
  (M3-02)._ Mitigations below: an openly licensed compilation, per-recipe credit, our own text.

## 1. Bar Assistant open data (primary import)

|                    |                                                                                                                                                                                       |
| ------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Where              | https://github.com/bar-assistant/data, branch `v5`, pinned at commit `5a504d4` (2026-09-13)                                                                                           |
| Licence            | MIT, "Copyright (c) 2026 Bar Assistant" — https://github.com/bar-assistant/data/blob/v5/LICENSE                                                                                       |
| Size               | 663 cocktails, 296 ingredients (ABV on every ingredient, a parent hierarchy, categories)                                                                                              |
| We take            | Ingredient names, hierarchy and ABV; per cocktail: ingredient lines (amount, unit, optional, substitutes), method, glass, garnish, the `source` URL and `author`, and its first photo |
| We do not take     | `description`, `instructions` (largely third-party text the maintainer cannot license), the computed cocktail `abv` (strength is derived by us, never imported)                       |
| Licence notice     | The MIT notice is shipped in `data/LICENSES/bar-assistant-data.txt` and shown on the attribution page (M3-02)                                                                         |
| Credit on a recipe | `Spec via <original source> (<author, if any>) · data: Bar Assistant (MIT)` with a link to the original `source` URL. A recipe with no `source` (15 of 663) is **not imported**.      |
| No-alcohol recipes | Dropped (decision 2026-11-01): recipes with no alcohol at all are not imported.                                                                                                       |

## 2. IBA official cocktails (reference for the classics)

|                    |                                                                                                                                                                                                                                                            |
| ------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Where              | https://iba-world.com/cocktails/all-cocktails/ — 102 cocktails in three categories (The Unforgettables, Contemporary Classics, New Era); the site shows no revision year (secondary sources: 2024 revision)                                                |
| Licence            | None published; the footer reads "© IBA 2026 – All rights reserved". No terms of use or credit format.                                                                                                                                                     |
| We take            | The facts of each spec, entry by entry, to check and correct the 89 Bar Assistant recipes sourced to iba-world.com. We do **not** bulk-scrape the site, and we do not use the GitHub dumps (2023-era; MIT covers only scraper code, or no licence at all). |
| Credit on a recipe | `IBA official cocktail · <category> · spec checked against iba-world.com` with a link to the cocktail page                                                                                                                                                 |
| Test               | The import pins the landing classics (Negroni, Old Fashioned, Margarita, Daiquiri) to the IBA amounts (M1-06).                                                                                                                                             |

## Rules the import enforces (M1-06)

- A recipe without a source URL and a credit line fails the import.
- Every ingredient resolves to one node in our taxonomy (category > type > brand); an
  unresolved ingredient fails the import.
- Every amount converts to ml or a counted unit through `packages/units`; oz is converted once
  at import with NIST's 29.5735295625 ml/oz; an unknown unit fails the import.
- Re-running the import on the same pinned snapshot changes nothing.
