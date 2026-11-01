# M2-05 substitutions

Swaps a bartender would accept, on by default, each one refusable per user; lines a drink is
named for are `exact` and never swapped. Engine already does one-way, one-hop edges and `exact`.

## Decisions
- **Default: on.** Every edge counts until the user turns it off. Results always say which swap
  they used ("using Rye Whiskey for Bourbon Whiskey"), so nothing is hidden; signed out (shelf
  cookie, landing demo) uses the defaults. Only refusals are stored.
- **Starting set: 25 one-way edges** in `data/seed/rules.json` `substitutions`, each with a
  reason shown to the user: rye ↔ bourbon, Tennessee → bourbon; armagnac → cognac, brandy →
  cognac; tequila blanco ↔ reposado, añejo → reposado; triple sec ↔ Cointreau; Lillet Blanc ↔
  Cocchi Americano; champagne ↔ prosecco, sparkling wine → champagne / prosecco; simple syrup ↔
  sugar, simple → demerara syrup, honey → honey syrup; Pernod → absinthe. Nothing for
  Chartreuse, citrus, mezcal or rum styles.
- **Exact lines** in `rules.json` `exact` (recipe → ingredient → reason): the drinks named for
  the bottle (Bourbon Lift / Renewal / Stone Sour, Champagne Cocktail, Grasshopper Blanco,
  Absinthe Colada / Frappé / Old Fashioned).
- Schema change (new table, two columns): migration 0005 adds `ingredient_substitution.reason`,
  `recipe_line.exact`, and `substitution_refusal (user_id, substitute, replaces)` with RLS and a
  cascade from the edge (a refusal of an edge the seed drops goes with it).
- Engine: `refuse(tax, edges)` returns the taxonomy without those edges; `oneAway` also lists
  the swaps the satisfied lines used.

## Scenarios
- **Import validates.** Given an edge naming an unknown id, a redundant edge (cognac → brandy:
  cognac already counts) or an `exact` entry for a line the recipe lacks or an ingredient no edge
  targets, the import fails naming it. 25 edges and 8 exact lines import; re-import is a no-op;
  an edge removed from the seed is deleted.
- **Default on.** Given a bar of Rittenhouse-level rye, sweet vermouth, Campari, When matches are
  asked (signed in or out), Then Boulevardier is makeable "using Rye Whiskey for Bourbon Whiskey".
- **Refuse.** Given that user turns rye → bourbon off, Then Boulevardier is one bottle away
  (+ Bourbon Whiskey) for them, and still makeable for another user with the same bar; turning it
  back on restores it. Refusing an unknown edge answers 404; signed out answers 401.
- **Exact.** Given a bar of rye, lemon, cassis, simple syrup, Angostura, Bourbon Renewal stays one
  bottle away (+ Bourbon Whiskey) even with rye → bourbon on; its recipe page marks the bourbon
  line as exact.
- **Isolation.** `substitution_refusal` rows of user A are invisible to and unchangeable by B
  (expectIsolated); the api reads only the caller's refusals.
- **One away shows swaps.** A one-away recipe that relies on a swap lists it.
- **Landing stays true.** The sticky note no longer says a bourbon recipe wants bourbon; it says
  rye can stand in and we say so, and the drinks named for a bottle need it.

## API
- `GET /substitutions` → every edge `{substitute, replaces, reason, allowed}` (signed out: all
  allowed). `PUT /substitutions/{substitute}/{replaces}` `{allowed}` → 204 · 401 · 404.
- `GET /bar/matches` applies the caller's refusals; recipe lines carry `exact: true`.

## Web
- `/bar`: a Swaps section (ui-ux-designer pass) listing every edge with its reason and a per-row
  Turn off / Turn on button (POST server action, redirect back, status line + "You can make N
  now."); signed out: the list read-only with a sign-in prompt.
- Recipe page: exact lines tagged. Landing demo: makeable rows show the swap they use.

## End-to-end check
Sign up, add rye, sweet vermouth and Campari: Boulevardier "using Rye Whiskey for Bourbon Whiskey";
turn the swap off: Boulevardier moves to one bottle away; turn it on again; Bourbon Renewal's page
shows the exact tag. No-JS run of the toggle. Axe light/dark at 1440 and 360 on /bar.
