# M1-10 · drop-zero-proof

Human decision 2026-11-01 (NH-6): the app is for adults and drops zero-proof entirely. Removes
the mode, switch, tag, landing band, zero filters and the "zero-proof session"; the age gate's
"No" becomes a plain page. CLAUDE.md, rules and specs lose the zero-proof parity invariant. No
new table or dependency; the strength maths keeps handling 0% ingredients (juice, syrup).

## Scenarios
- **No zero-proof anywhere.** The header has no zero-proof switch; the landing has no zero-proof
  band or card (the fourth featured card is John Collins, an IBA classic); search has no zero
  mode; no recipe shows a zero-proof tag; `/prefs` ignores `zero`.
- **No no-alcohol recipes.** The import skips a recipe whose every line is 0% ABV and records
  why (Shirley Temple, Neruda… 9 recipes); the library has 595 recipes.
- **Age gate "No".** Answering "No, I'm under 18" (UK) shows "Come back when you're 18." on
  every page except cookies, privacy and terms, with the footer's help line; no recipe, bottle
  or strength is shown and nothing links into the library.
- **Gate copy.** The gate no longer promises a zero-proof side.
- **Unchanged.** "Yes" works as before; strength of drinks with juice and syrup is unchanged
  (Negroni 19.8%, Daiquiri as before).

## Check
- Unit: seed transform skips no-alcohol recipes. e2e: age "No" page and nothing behind it,
  header without the switch, landing without the band, axe on the new page light/dark
  1440/360. `pnpm verify:full`. Review: not needed (removal; no user data).
