# M2-04 what-can-i-make — plan

Engine (`makeNow`, `oneAway`, `buyNext`, M0-07) over the caller's own bar, beside My Bar.
No new table, no new dependency. Cross-module: `apps/api` bar routes call `@stirred/engine`
(already a dependency through the landing demo). Water is always assumed, as in the demo.

## API
- `GET /bar/matches` (session; 401 without): computes over the caller's stored bar only.
- `GET /shelf/matches?ingredient=…` (public, no user data): the signed-out shelf's ids;
  an unknown id answers 400 `unknown_ingredient`.
- One shape `BarMatches`: `makeNow[]` {id, name, method, glass?, abv, swaps[]},
  `oneAway[]` {id, name, method, missing: {id, name}}, `buyNext[]` {ingredient, count,
  recipes: [{id, name}]} (top 10). Every list complete except buy next; engine order (name,
  then id; buy next by drinks unlocked, then name).

## Scenarios
- **Make now, all of it.** Given a bar of Gin, Sweet Vermouth, Campari, Lemon juice, Lime
  juice, Sugar, Simple Syrup and Club soda, when Ana opens /bar, then "You can make 7" lists
  all seven by name (Americano, Electric Current Fizz, Gimlet, John Collins, Negroni, …), each
  linking to /recipes/<id> with its thumbnail, method and finished ABV (Negroni 19.8%,
  derived, same as its recipe page).
- **One bottle away.** The same bar lists Boulevardier "+ Bourbon Whiskey", Bramble "+ Crème
  de mûre", Daiquiri "+ Light Rum" among the one-away recipes, each naming the missing bottle.
- **Buy next.** Rows ranked by drinks unlocked: "[Bottle] · [n] more drinks" with the recipe
  names linked; ties by bottle name. Adding the top bottle moves its recipes to make now.
- **Child satisfies parent.** A bar with Bourbon Whiskey (not "Whiskey") makes a recipe that
  asks for any whiskey; a bar with only "Whiskey" does not make one that asks for bourbon.
- **Empty bar.** "Add a few bottles and we'll show what you can make." — no lists.
- **Nothing yet.** A bar with only Gin: "Nothing you can make yet" plus one away and buy next.
- **Signed out.** The shelf cookie's bar gives the same results through `/shelf/matches`.
- **Isolation.** Bob (bar: Light Rum + basics) never sees Ana's Negroni in his make now; with
  no session `/bar/matches` answers 401 and never falls back to someone's bar.
- **Without JavaScript.** Plain server render; adding a bottle (form post) re-renders results.
- **Landing demo.** When the demo can make more than it lists, it says "+ [n] more" and its
  "Start my bar" form shows them all on /bar.

## Tests (cheapest layer)
- api integration: `/bar/matches` for the scenario bar (7 make now incl. Negroni with abv;
  Boulevardier missing Bourbon Whiskey; buy next sorted); 401; isolation (two users);
  `/shelf/matches` unknown id 400.
- engine already proves matching order and child/parent on fixtures (no new unit test).
- e2e `bar.spec.ts`: signed-out shelf → results list all make-now with links; add Bourbon
  Whiskey → Boulevardier moves to make now; no-JS render; axe light/dark 1440 and 360.

## End-to-end check
Signed out at /bar, add Gin, Sweet Vermouth, Campari and the basics: "You can make 7" lists
seven linked recipes; click Negroni → /recipes/negroni. Add Bourbon Whiskey → Boulevardier
appears under make now.
