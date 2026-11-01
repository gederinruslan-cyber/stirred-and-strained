# M2-03 my-bar

New table `bar_item` (one bar per user; `bar` as its own table waits for shared bars, v1+).
Cross-module: api reads the taxonomy it already holds; web gains a `shelf` cookie.

## Scenarios
- **Add by name.** Given Ana is signed in with an empty bar, when she types "bourbon" and picks
  "Bourbon Whiskey" (Spirits › Whiskey › Bourbon Whiskey), then her bar lists Bourbon Whiskey
  under Spirits; adding it again changes nothing.
- **Hierarchy-aware suggestions.** `GET /ingredients?q=whiskey` lists Whiskey first, then names
  containing the word (Bourbon Whiskey, Rye whiskey), then anything under a match that does not
  name it; each with its path (category first). "rye" also finds "Rye whiskey". At most 20.
- **Kind of bottle.** Adding the type "Whiskey" keeps "Whiskey" (not every whiskey): a recipe
  asking for bourbon still needs bourbon (engine rule: child satisfies parent, never reverse).
- **Bulk add by category.** Opening "Spirits" lists its types and brands as checkboxes; ticking
  Gin, Light Rum and Tequila Blanco and pressing "Add ticked" adds the three in one request.
- **Remove.** "Remove Gin" takes it off; the page says "Gin removed."
- **Before sign-up.** Signed out, the same page keeps the shelf in a `shelf` cookie (ingredient
  ids only, 30 days, http-only, SameSite=Lax) and says it lives on this device until she signs
  up. On sign-in, confirm or reset the shelf moves into the account, merged without duplicates
  (bar Gin + shelf Gin, Campari → Gin, Campari), and the cookie is dropped. Ids the taxonomy no
  longer knows are dropped silently.
- **From the demo.** The landing demo's "Start my bar" keeps the ticked bottles (and the usual,
  when ticked) on the shelf and opens /bar; the header's "My Bar" and every "Start my bar" CTA
  open /bar.
- **Isolation.** B listing sees only B's items; B removing Gin that only A has answers 404 and
  A keeps it; RLS returns nothing with no user set (harness `expectIsolated`).
- **Refusals.** `/bar` api calls without a session answer 401; an unknown ingredient id answers
  400 `unknown_ingredient` and adds nothing.
- **Without JavaScript.** Add (type a name, submit), pick from the server's suggestion list when
  the name is not exact, bulk add and remove all work as plain form posts.
- **Re-seed.** A seed that would delete an ingredient someone keeps fails (FK restrict); house
  data never silently takes a bottle away.

## API (contract)
- `GET /ingredients` items gain `kind` and `path` (ancestor names); optional `q` for suggestions.
- `GET /bar` → `{ items: IngredientEntry[] }`; `POST /bar/items { ingredients: string[] }` → the
  bar; `DELETE /bar/items/:ingredientId` → 204 or 404.

## Tests
- db int: isolation harness on bar_item; add is idempotent; remove of a missing item = 0.
- api unit (house fixture): suggestion ranking and paths. api int: 401, 400, 404 for B, merge.
- e2e: signed-out shelf → sign up → confirm → items kept; add by name, bulk add, remove; no-JS
  add via the suggestion list; axe light/dark at 1440 and 360 on /bar.
