# My Bar

## Requirement: A bar holds the ingredients a user keeps
- **Scenario: add by name.** Given Ana is signed in with an empty bar, when she adds "bourbon
  whiskey" (any case, accents ignored), then her bar lists Bourbon Whiskey under Spirits with its
  path "Spirits › Whiskey", and the page says "Added Bourbon Whiskey."; adding it again says
  "Bourbon Whiskey was already on your bar." and changes nothing.
- **Scenario: suggestions.** `GET /ingredients?q=whiskey` lists Whiskey first, then names
  starting with or containing the word (Bourbon Whiskey, Rye whiskey), then anything under a
  match that does not name it (Blended Scotch Whisky, under Scotch whiskey); each with its kind
  and path, category first; at most 20. "RYE" finds Rye whiskey, "creme de mure" finds Crème de
  mûre. A typed name that is not one exact match shows "No exact match for “whisk”. Did you mean
  one of these?" with up to 8 "Add [name]" buttons; no match at all says "We don't have “…” in
  the bar yet."
- **Scenario: a kind of bottle.** Adding the type "Whiskey" keeps Whiskey, not every whiskey: it
  counts only where a recipe asks for any whiskey.
- **Scenario: bulk add.** Opening "Spirits" lists everything under it as checkboxes (kept ones
  marked "on your bar"); ticking Gin, Light Rum and the kept Bourbon Whiskey and pressing "Add
  ticked" says "Added 2: Gin and Light Rum. Bourbon Whiskey was already there." Nothing ticked:
  "Tick at least one, then press Add ticked."
- **Scenario: remove.** "Remove Gin" says "Gin removed."; an item already gone says "Gin wasn't
  on your bar any more."
- **Scenario: refusals.** The bar api without a session answers 401; an unknown ingredient id
  answers 400 `unknown_ingredient` and adds nothing.
- **Scenario: isolation.** Bob's bar never shows Ana's items; Bob removing Gin that only Ana keeps
  answers 404 and Ana keeps it; with no user set the table shows nothing.
- **Scenario: house data.** A re-seed that would delete an ingredient someone keeps fails.

## Requirement: The shelf before sign-up
- **Scenario: signed out.** The same page keeps the shelf on this device (ingredient ids only, 30
  days after the last change) and says so, with "Create an account" and "sign in".
- **Scenario: moving in.** On sign-in, confirm or reset the shelf merges into the account
  without duplicates and the device copy is dropped; ingredients the library no longer knows are
  dropped; if the api cannot take it, the shelf waits for the next sign-in.
- **Scenario: without JavaScript.** Add, pick a suggestion, bulk add and remove are plain form
  posts; each lands back on /bar with one status line.

## Requirement: Beside the bar, what it makes (M2-04)
- **Scenario: make now, all of it.** With Gin, Sweet Vermouth, Campari, Lemon juice, Lime juice,
  Sugar, Simple Syrup and Club soda, "You can make 7" lists every one by name (Americano,
  Electric Current Fizz, Gimlet, Gin Rickey, John Collins, Negroni, Tom Macy's Gimlet), each with
  its thumbnail, a link to its recipe, "[method] · [glass]" and the finished ABV from the same
  model as its recipe page (Negroni 19.8%); a swap it relies on reads "using [X] for [Y]".
  Water is always assumed. Lists over 15 show 12 and fold the rest into "Show the other [n]".
- **Scenario: one bottle away.** The same bar lists Boulevardier "+ Bourbon Whiskey" and Daiquiri
  "+ Light Rum" among every recipe missing exactly one required line, each with "Add [bottle]".
- **Scenario: buy next.** Up to 10 bottles ranked by how many one-away recipes each completes
  ("[n] more recipes"), then by name, each naming those recipes and offering "Add [bottle]";
  owning the top bottle moves every recipe it names to make now.
- **Scenario: a kind of bottle.** Bourbon Whiskey makes a recipe that asks for any whiskey; a bar
  with only "Whiskey" does not make Boulevardier, which asks for bourbon.
- **Scenario: states.** Empty bar: "Add a few bottles and we'll show what you can make." Nothing
  makeable: "Nothing you can make yet" with one away and buy next below. Every status line ends
  " You can make [n] now." ("Nothing you can make yet." at 0).
- **Scenario: signed out.** The shelf cookie's ids give the same results (`GET /shelf/matches`,
  public, an unknown id answers 400 `unknown_ingredient`).
- **Scenario: isolation.** `GET /bar/matches` reads only the caller's bar: Bob (Light Rum and the
  basics) sees Daiquiri, never Ana's Negroni; without a session it answers 401.
- **Scenario: without JavaScript.** "Add [bottle]" is a form post to the add action; the page
  comes back with the recipe it completed under make now.

## Requirement: House swaps count until you turn one off (M2-05)
- **Scenario: the swaps.** 21 one-way swaps a bartender would accept, each with its reason (rye ↔
  bourbon, Tennessee → bourbon; armagnac and brandy → cognac; tequila blanco ↔ reposado, añejo →
  reposado; triple sec ↔ Cointreau; Lillet Blanc ↔ Cocchi Americano; champagne ↔ prosecco,
  sparkling wine → either; simple syrup ↔ sugar, simple → demerara syrup, honey → honey syrup;
  Pernod → absinthe). None for Chartreuse, citrus, mezcal or rum styles.
- **Scenario: on by default.** With rye, sweet vermouth and Campari (signed in or out), Boulevardier
  is makeable "using Rye whiskey for Bourbon Whiskey"; a one-away result lists the swaps it relies
  on the same way.
- **Scenario: turn one off.** "Swaps we count" closes the shelf column: a closed fold "Show all 21
  swaps" (" · [k] off" when any are off), rows by what they replace, "[X] for [Y]", the reason, an
  On/Off tag and "Turn off" / "Turn on". Turning rye → bourbon off moves Boulevardier to one bottle
  away (+ Bourbon Whiskey) for that user only; status "Rye whiskey won't stand in for Bourbon
  Whiskey any more." / "… can stand in for Bourbon Whiskey again."; a row whose substitute is on the
  bar says "You have [X]". Works as a plain form post.
- **Scenario: signed out.** The list is read-only, every swap on, with "Sign in or create an
  account to turn any of them off."
- **Scenario: isolation and errors.** `substitution_refusal` rows are the owner's alone (RLS); `PUT
  /substitutions/{substitute}/{replaces}` `{allowed}` answers 204, 401 signed out, 404 for a swap
  not on the list; `GET /substitutions` gives the caller's on/off (signed out: all on).

