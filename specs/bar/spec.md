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
