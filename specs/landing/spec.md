# Landing page

## Requirement: The demo shows what you can make, on the real engine and the house library
- **Scenario: first visit.** The shelf starts with gin, sweet vermouth and Campari plus the usual
  (lemon and lime juice, sugar, simple syrup, club soda). "You can make" lists up to five recipes
  (name · method), IBA classics first and then by name: Americano, John Collins, Negroni; "one
  bottle away" lists up to three with the missing bottle, starting with Boulevardier + Bourbon
  Whiskey. One live summary announces the counts. When it can make more than it lists, "+ [n]
  more" follows (first visit: "+ 2 more") and the foot reads "Start my bar with these to see them
  all and keep them."
- **Scenario: ticking a bottle.** Ticking Bourbon Whiskey updates the lists without a reload or a
  scroll jump, and Boulevardier moves to "you can make".
- **Scenario: opening a result.** Every recipe name in both lists links to its recipe page;
  Boulevardier opens /recipes/boulevardier.
- **Scenario: keeping it.** "Start my bar" under the results adds the ticked bottles (and the
  usual, when ticked) to My Bar and opens /bar; every other "Start my bar" and the header's "My
  Bar" open /bar.
- **Scenario: empty shelf.** With nothing ticked and the usual off: "Tick a bottle or two and
  we'll show you."
- **Scenario: without JavaScript.** The shelf is a form; submitting it renders the results for the
  ticked bottles (Light Rum → Daiquiri).
- **Scenario: unknown bottle.** Asking the demo about a bottle it does not offer is refused.

## Requirement: Featured recipes and units
- **Scenario: house recipes.** The featured cards are Negroni, Old Fashioned, Margarita and
  John Collins, each sourced and credited. There is no zero-proof switch, band or tag.
- **Scenario: units.** The ml/cl/oz control changes every amount on the featured cards and the
  Daiquiri card: Negroni gin 30 ml → 1 oz, Daiquiri rum 60 ml → 2 oz; it
  works without JavaScript.
- **Scenario: strength line.** An alcoholic card shows its finished ABV and the drink count for
  the visitor's country, rounded once at display: a US visitor sees the Negroni at "19.8% ABV ·
  1.4 standard drinks", a UK visitor in UK units, and a visitor from a country without a standard
  drink in grams of alcohol.

## Requirement: Buy next
- **Scenario: example bar.** For gin, bourbon, sweet vermouth, Angostura and the usual, the table
  ranks the bottles that complete the most one-away recipes (Campari first: Americano,
  Boulevardier, Negroni).
