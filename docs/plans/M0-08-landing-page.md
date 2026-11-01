# M0-08 landing-page

Design pass: the approved landing spec and mockup (`docs/design/landing-page.md`); no new pattern.

## Scenarios
- **Demo, defaults.** Given a first visit, the demo has London dry gin, sweet vermouth and bitter
  aperitivo ticked plus the basics; "you can make" lists up to 5 (name · method), including
  Negroni and Americano; "one bottle away" lists up to 3 with the missing bottle (Boulevardier +
  Bourbon among them). A live region announces one summary ("N recipes you can make, M one
  bottle away").
- **Demo, changes.** Given the visitor ticks Bourbon, the lists update without a page reload
  (debounced 250 ms) and Boulevardier moves to "you can make". Unticking everything and the
  basics shows "Tick a bottle or two and we'll show you."
- **Demo without JavaScript.** The demo is a GET form with a submit button; results render on
  the server for the submitted bottles.
- **Matching lives in the api.** `GET /landing` (chips, featured recipes, Daiquiri, the Gin Buck
  pair, the buy-next example) and `GET /demo?bottle=…&basics=…&zero=…` come from the engine over
  the sample library; an unknown bottle id answers 400. The web holds no matching logic.
- **Zero-proof mode.** Given the zero-proof switch is on, the demo lists only zero-proof recipes
  (with zero-proof gin + basics: Zero-proof Gin Sour); the band's button reads "Show everything"
  and turns it off.
- **Units.** The ml/cl/oz control changes every amount on the featured cards and the Daiquiri
  card (Negroni 30 ml → 3 cl → 1 oz); works without JavaScript.
- **Buy next.** The table for "gin, bourbon, sweet vermouth, Angostura & the usual" comes from
  `buyNext` (top 4: bottle, count, example recipes).
- **Strength line.** Zero-proof recipes read "0% ABV · nothing to count"; alcoholic ones keep the
  "[x.x]" placeholders until strength lands (M1-02).
- **Both themes, desktop and 360 px**, no axe violations; photos served from our own copies.
- **SEO.** Title, meta description, JSON-LD `WebSite` with `SearchAction`.

## Shape
- Schemas in `packages/schema`; routes in `apps/api/src/landing.ts`; sample library gains
  labels, steps and source for the featured recipes. Web: `apps/web/app/landing/*`; amounts
  through `@stirred/units`.
- Age gate stays in M1-11.
