# My recipes

## Requirement: A user writes their own recipes, with amounts and strength like house recipes
- **Scenario: create.** Given Ana is signed in, when she saves "Ana's Negroni", built, in a rocks
  glass, with 1 oz Gin, 30 ml Campari and 3 cl Sweet Vermouth, then its page at
  /my-recipes/<id> shows the lines in her unit (Gin 30 ml), the "yours!" tag, the strength by
  ADR 0004 within 0.1% ABV of the house Negroni (19.8% ABV · 1.4 standard drinks for a US
  visitor) with the method's caption, and steps written from the method ("Fill a rocks glass
  with ice."); the status says "Saved Ana's Negroni.". The gin is kept as 29.5735295625 ml, and
  editing shows "1" "oz" back.
- **Scenario: the form.** Ingredients are picked from every ingredient by name (the list shows
  each one's path); amounts take ml, cl, oz, dash, barspoon, drop, piece or top; a row can be
  optional; blank rows are skipped; the form shows the lines plus 4 blank rows (at least 8, at
  most 30). Steps are the user's plain text, one per line ("<b>Garnish</b>" shows literally);
  empty steps are written from the method and glass.
- **Scenario: what to fix.** Saving with no method and the ingredient "Unobtainium" shows "Fix 2
  things before saving:" with "Choose a method." and "We don't know “Unobtainium”. Pick one from
  the list.", focused, every typed value kept. A line with no amount says "Give an amount for
  Lime juice." (a top needs none); only garnish pieces say "Add at least one line in ml, cl or oz
  so we can work out how strong it is."
- **Scenario: refusals.** The api refuses an unknown ingredient (400 `unknown_ingredient`), an
  unknown glass (400 `unknown_glass`), a recipe with no line that has volume (400 `no_volume`), a
  name over 80 characters and more than 30 lines; without a session it answers 401.

## Requirement: User recipes are never lost
- **Scenario: edit and history.** Changing Campari to 25 ml says "Saved your changes to Ana's
  Negroni."; History lists Edited then Created, newest first, each opening the spec as saved then
  (Created still shows Campari 30 ml); the newest is "(this version)".
- **Scenario: delete and undo.** "Delete recipe" lands on /my-recipes with "Deleted Ana's
  Negroni." and Undo; Undo says "Ana's Negroni is back.". A deleted recipe stays under "Deleted"
  with Restore ("Restored Ana's Negroni."), cannot be edited, and is out of search and matches
  until restored. Nothing is purged; deletes and restores are kept in the history.
- **Scenario: house data.** A re-seed that would delete an ingredient someone's recipe uses fails.

## Requirement: Own recipes are searched and matched for their owner only
- **Scenario: search.** Signed in, searching "ana's" finds Ana's Negroni tagged "yours!" with the
  photo placeholder, linking to its page; Bob and a signed-out visitor find nothing.
- **Scenario: matches.** With Gin, Campari and Sweet Vermouth on her bar it is in "You can make";
  without Campari it is one bottle away (+ Campari) and Campari's buy-next row links it; Bob's
  matches never show it.
- **Scenario: isolation.** Each of the three tables keeps rows to their owner (row-level security
  with no user set shows nothing); Bob's read, edit, delete or restore of Ana's id answers 404 and
  changes nothing; opening her page shows "We can't find that recipe.".
- **Scenario: signed out.** /my-recipes says "Your own recipes live in your account." with sign
  in and create an account; the form and pages redirect to sign in and come back.
