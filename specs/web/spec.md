# Web

## Requirement: Every screen uses the Bar Napkin design system in light and dark
- **Scenario: readable in both themes.** Every text colour pair meets WCAG AA in light and dark:
  4.5:1 for body text, 3:1 for large handwritten accents.
- **Scenario: no accessibility violations.** The pages have no WCAG 2.2 A/AA violations in light
  and dark, at desktop width and at 360 px, and never scroll sideways at 360 px.

## Requirement: The theme follows the visitor
- **Scenario: OS preference.** With no saved choice, the page uses the OS colour scheme.
- **Scenario: chosen theme.** Pressing the header theme button switches at once; the choice is
  remembered for a year and the next page renders in it from the server.
- **Scenario: without JavaScript.** The header and footer theme controls and the zero-proof switch
  are forms that save the choice and return to the same page; a return path that is not a local
  path (another site, a backslash, or any tab, newline or other control character) returns to
  the home page.

## Requirement: The app shell
- **Scenario: header and footer.** Every page has a skip link (first on Tab), the wordmark,
  Recipes, My Bar, the zero-proof switch, search ("Find a drink…"), the theme button, Sign in and
  Start my bar; the footer has The app, Behind the bar, The small print, the responsible-drinking
  line and the theme control.

## Requirement: A locale-aware age gate comes before any alcoholic content
- **Scenario: country from the browser.** Given a first visit with the browser language en-GB,
  when any page is requested, then the gate asks "Are you 18 or over?" naming the United Kingdom
  before any recipe is shown; given en-US it asks for 21; given an unknown region, 21. The
  country never comes from the visitor's IP address.
- **Scenario: highest age applies.** Where the age differs inside a country, the gate asks for
  the highest one (Canada 19, India 25).
- **Scenario: change country.** Choosing another country on the gate asks again with that
  country's age, also without JavaScript.
- **Scenario: yes.** "Yes" returns to the page asked for (local pages only) and the gate is not
  shown again for a year.
- **Scenario: no.** "No" returns to the page with zero-proof mode on and locked: the switch shows
  on and cannot be turned off, and only zero-proof recipes and bottles are shown.
- **Scenario: always reachable.** The cookie, privacy and terms pages open without the gate.
- **Scenario: accessible.** The gate passes WCAG 2.2 AA in light and dark at 1440 and 360 px,
  and the keyboard reaches both answers and the country picker.

## Requirement: The footer points to local help
- **Scenario: help line.** The footer names the visitor's country help line (United Kingdom:
  Drinkline, 0300 123 1110) from a government service, with a general helpline finder for
  anywhere else; no footer copy encourages drinking more.

## Requirement: Every house recipe has its own page
- **Scenario: page.** `/recipes/negroni` for a US visitor shows "Negroni", "built · rocks glass",
  gin, Campari and sweet vermouth at 30 ml each, "19.8% ABV · 1.4 standard drinks" with "after
  the ice, by Arnold's dilution model", the steps, and "Spec via iba-world.com" linking to the
  source with the licence. The id in the URL is the recipe's stable slug.
- **Scenario: units remembered.** Choosing oz shows "1 oz" on every measured line, and the choice
  holds on the next recipe and on the landing, also without JavaScript. Counted units stay
  counted, a range keeps one unit ("2–3 dashes"), a top reads "top up".
- **Scenario: steps in our words.** Steps come from the method and glass, never the source's
  prose: shaken into a coupe → "Shake everything hard with ice." "Strain into a chilled coupe.";
  into a glass served on ice → "Strain into a rocks glass over fresh ice."; a top line adds
  "Top up with club soda."
- **Scenario: variations.** A recipe lists the house recipes whose name contains its name as whole
  words (Negroni → Coffee Negroni, Negroni Sbagliato…), and a variation says "A twist on the
  Negroni", linking back to the closest original.
- **Scenario: zero-proof.** Shirley Temple shows the zero-proof tag and "0% ABV · nothing to
  count". In a locked zero-proof session an alcoholic recipe answers 404 "That one's not on the
  zero-proof side of the bar." without any part of its spec, and only zero-proof variations are
  linked.
- **Scenario: unknown.** An unknown recipe answers 404 "We can't find that recipe." with a way
  back to the start.
- **Scenario: machine-readable.** The page carries schema.org/Recipe JSON-LD with the name,
  ingredients in ml ("30 ml Gin"), the steps and the source.
- **Scenario: accessible.** The page passes WCAG 2.2 AA in light and dark at 1440 and 360 px.

## Requirement: Find a recipe with filters beside the results
- **Scenario: search.** Searching "negroni" from the header opens `/recipes?q=negroni` with
  "14 recipes for “negroni”", each row linking to its page with method · glass · family and the
  finished ABV (or the zero-proof tag); no glass shows the method alone.
- **Scenario: filters.** Filters sit left of the results at 1440 px and fold into a "Filters"
  disclosure at 360 px: With/Without ingredients (a typed name such as "whiskey" becomes a ticked
  chip; an unknown name says "We don't have “…” in the bar yet."), base spirit, strength from/to,
  method, glass, family and flavour chips with counts, top eight then "[n] more".
- **Scenario: without and with JavaScript.** One GET form works without JavaScript (Apply,
  paging "← Previous · Page p of P · Next →"); with it a ticked filter applies in place and keeps
  the place.
- **Scenario: shortcut.** "/" focuses the search unless typing in a field, and "Turn off" stops
  it.
- **Scenario: nothing found.** "Nothing matches all of that." offers one link per active filter
  that drops just that filter ("Drop Bourbon Whiskey", "All names, not just “manhattan”") and
  "Clear all filters".
- **Scenario: accessible.** The page passes WCAG 2.2 AA in light and dark at 1440 and 360 px.
