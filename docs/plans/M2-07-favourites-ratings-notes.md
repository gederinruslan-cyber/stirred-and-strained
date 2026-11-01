# M2-07 favourites-ratings-notes

A signed-in user keeps a favourite, a 1–5 rating and a private note on any recipe they can open
(house or their own). New table `recipe_mark` (migration 0007, RLS like 0006): one row per user
and recipe, `house_recipe_id` (text, references recipe, **restrict**: a re-seed that would delete
a marked recipe fails) xor `user_recipe_id` (uuid, references user_recipe, cascade only on a hard
delete, which never happens). A row with nothing left (not favourite, no rating, no note) is
deleted. No new dependency; api → db only through `withUser`.

## Scenarios
- **Favourite.** Given Ana is signed in, when she presses "Add to favourites" on /recipes/negroni,
  then the status says "Negroni is in your favourites." and the button reads "Remove from
  favourites"; /my-recipes lists Negroni under "Favourites". Removing says "Negroni is out of your
  favourites." and the list is empty again.
- **Rating.** She rates Negroni 4 and Daiquiri 3 (radio group "Your rating", 1 to 5 stars, with
  "Save"); the page shows 4 checked. A rating outside 1–5 is refused by the api (400).
- **Note.** "Less Campari next time, 25 ml" is kept and shown back in the field; "<b>x</b>" shows
  literally; over 1000 characters is refused with "Keep the note to 1000 characters or fewer."
  and the typed text kept; an empty note removes it. Notes and ids are never logged.
- **Filters.** Signed in, /recipes offers "Yours": Favourites (n) and Rated 4+ (n), OR within the
  group like every facet; Rated 4+ lists Negroni and not Daiquiri; search results show "♥" and
  "4★" beside rated or favourite names. Signed out the group is not shown and the api ignores it.
- **Own recipes.** Ana favourites and rates Ana's Negroni 5 with a note; deleting it drops it from
  Favourites and the filters; restoring brings back the favourite, rating and note.
- **Isolation.** Bob sees none of Ana's marks (list, search counts, recipe page); Bob marking
  Ana's own recipe id answers 404 and writes nothing; with no user set the table shows nothing.
- **Unknown or signed out.** An unknown recipe id answers 404; without a session the mark routes
  answer 401 and the recipe page says "Sign in to keep a favourite, a rating and a note."
- **No JavaScript.** Every control is a form post that comes back to the same page with a status.

## API
`GET /my/marks` (favourites, rated and noted, live recipes only, as summaries with the mark);
`GET /my/marks/:id`; `PATCH /my/marks/:id` `{favourite?, rating?: 1–5|null, note?: string|null}`
→ 204. `/recipes` takes `mark=favourite|rated4` and returns `favourite`/`rating` on items and a
`mark` facet when signed in.

## End-to-end check
`e2e/tests/marks.spec.ts`: sign up, favourite + rate 4 + note Negroni, rate Daiquiri 3, see both in
/my-recipes and "Rated 4+" on /recipes; no-JS run of the same post; signed-out prompt; axe light
and dark at 1440 and 360. Integration: isolation, delete/restore keeps the mark, re-seed restrict.
