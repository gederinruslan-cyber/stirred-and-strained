# Landing page

## Requirement: The demo shows what you can make, on the real engine
- **Scenario: first visit.** The shelf starts with London dry gin, sweet vermouth and bitter
  aperitivo plus the usual (lemons, limes, sugar, soda water). "You can make" lists up to five
  recipes (name · method), including Negroni and Americano; "one bottle away" lists up to three
  with the missing bottle, including Boulevardier + Bourbon. One live summary announces the counts.
- **Scenario: ticking a bottle.** Ticking Bourbon updates the lists without a reload or a scroll
  jump, and Boulevardier moves to "you can make".
- **Scenario: empty shelf.** With nothing ticked and the usual off: "Tick a bottle or two and
  we'll show you."
- **Scenario: without JavaScript.** The shelf is a form; submitting it renders the results for the
  ticked bottles (White rum → Daiquiri).
- **Scenario: unknown bottle.** Asking the demo about a bottle it does not offer is refused.

## Requirement: Zero-proof mode
- **Scenario: mode on.** With zero-proof on, the demo lists only zero-proof recipes (zero-proof gin
  and the usual → Zero-proof Gin Sour); the band's button reads "Show everything" and turns the
  mode off.

## Requirement: Featured recipes and units
- **Scenario: units.** The ml/cl/oz control changes every amount on the featured cards and the
  Daiquiri card: Negroni gin 30 ml → 1 oz, Daiquiri rum 60 ml → 2 oz; it works without JavaScript.
- **Scenario: strength line.** Zero-proof recipes read "0% ABV · nothing to count"; alcoholic
  recipes show placeholders until strength is calculated.
- **Scenario: house recipes in progress.** A house recipe whose amounts are not written yet shows
  "[ml]", never a guessed amount.

## Requirement: Buy next
- **Scenario: example bar.** For gin, bourbon, sweet vermouth, Angostura and the usual, the table
  ranks the bottles that complete the most one-away recipes (bitter aperitivo first: Americano,
  Boulevardier, Negroni).
