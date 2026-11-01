# Favourites, ratings and notes

## Requirement: A signed-in user keeps their own take on any recipe they can open
- **Scenario: favourite.** Given Ana is signed in, when she presses "Add to favourites" on
  /recipes/negroni, then "Your take" says "Negroni is in your favourites." and the button reads
  "Remove from favourites"; removing says "Negroni is out of your favourites.".
- **Scenario: rating.** She picks "4 stars" in "Your rating" (1 to 5 stars, or "No rating") and
  presses Save: "Saved your take on Negroni." and 4 stars stay checked. Nothing saves on change.
  The api refuses a rating outside 1–5 (400).
- **Scenario: note.** "Less Campari next time, 25 ml" is kept and shown back in "Your note" ("Only
  you can see this. Up to 1000 characters."); "<b>salt</b>" shows literally; spaces around it are
  trimmed and a blank note is no note. Over 1000 characters says "Keep the note to 1000 characters
  or fewer." with every typed character kept. A note never goes into a URL or a log.
- **Scenario: a note is never lost.** After a save that changed or cleared the note, the status
  offers Undo; Undo puts the previous note back ("Your note on Negroni is back as it was.") and a
  second undo redoes the change. Only the last change is kept.
- **Scenario: own recipes.** The same panel sits on Ana's own recipe pages (not on a deleted one).
  Deleting her recipe takes it out of her lists and filters; restoring it brings back its
  favourite, rating and note.
- **Scenario: signed out.** The panel says "Sign in to keep a favourite, a rating and a note. New
  here? Create an account.", both coming back to the recipe; the api answers 401.

## Requirement: Marks are listed and filtered for their owner only
- **Scenario: My recipes.** "Favourites" lists Ana's favourites by name, each with "♥", its
  rating as "4★" and "Your note: …"; with none it says "No favourites yet." and "Press “Add to
  favourites” on any recipe and it lands here."; "Rated or noted" lists the rest, highest rating
  first (Daiquiri, 3★).
- **Scenario: search.** Signed in, /recipes shows a "Yours" group first among the filters with
  "Favourites [n]" and "Rated 4+ [n]" (OR within the group, AND with the rest; "Drop Favourites"
  when nothing matches); "Rated 4+" lists Negroni (4) and not Daiquiri (3). Result rows show "♥"
  and "4★", read as ", in your favourites" and ", you rated it 4 of 5". Signed out there is no
  "Yours" group and a `mark` in the URL is ignored.
- **Scenario: isolation.** Bob sees none of Ana's marks on recipe pages, in his lists or in search
  counts; Bob reading, marking or undoing a note on Ana's own recipe id answers 404 and writes
  nothing; with no user set the table shows nothing. An unknown recipe id answers 404.
- **Scenario: house data.** A re-seed that would delete a recipe someone has marked fails.
