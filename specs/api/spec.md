# API

## Requirement: The contract comes from the route schemas
- **Scenario: generated contract.** The api's routes declare their request and response schemas;
  the committed OpenAPI 3.1 contract and the typed client are generated from them.
- **Scenario: drift.** A route schema changed without regenerating fails verification, naming
  the files that differ.
- **Scenario: response checked.** A response that does not match its schema is a 500 with a
  generic body, never an unchecked shape.

## Requirement: Mutating requests are gated
- **Scenario: content type.** A POST, PUT, PATCH or DELETE carrying a body that is not
  `application/json` answers 415.
- **Scenario: origin.** A mutating request whose Origin is not the web's answers 403 (including
  `null`); a server-side call without an Origin passes. GET is never gated.
- **Scenario: errors.** Server errors answer `{ "error": "internal_error" }` with no internals.

## Requirement: The browser never talks to the api directly
- **Scenario: server only.** Web pages reach the api only from server code; the browser cannot
  read api responses (no CORS).

## Requirement: House recipes are served with provenance and derived strength
- **Scenario: get.** `GET /recipes/negroni?country=US` answers gin, Campari and sweet vermouth at
  30 ml each, built, with its source, credit and licence, and a finished strength of ≈19.8% ABV
  and 1.40 US standard drinks; `country=GB` gives 2.49 UK units; no country gives grams.
- **Scenario: unknown.** An unknown recipe id answers 404 `{ "error": "not_found" }`.
- **Scenario: list.** `GET /recipes` pages through every house recipe ordered by name then id
  (24 per page by default, at most 100); a page below 1 or a page size above 100 answers 400.
- **Scenario: every recipe has a strength.** Every house recipe has a derived ABV and drink
  count; a zero-proof recipe shows 0% and 0.
- **Scenario: start-up.** The api refuses to start on a database without the house library and
  says to run the seed.

## Requirement: House recipes can be searched and narrowed
- **Scenario: name.** `q=negroni` finds Negroni, Coffee Negroni, Negroni Sbagliato and the rest,
  case and accents ignored ("frappe" finds Absinthe Frappé), ordered by name then id.
- **Scenario: ingredients through the hierarchy.** `include=whiskey` finds recipes made with
  bourbon or rye; `include=bourbon-whiskey` does not find a rye-only Manhattan; `exclude=campari`
  drops every recipe with Campari; an unknown ingredient answers 400.
- **Scenario: facets.** Base spirit (the largest spirit line's type under spirits: bourbon →
  Whiskey, light rum → Rum; none → No spirit), method, glass, family and flavour (from the
  source's tags under our own labels). Values within a facet are OR, facets are AND, and each
  facet counts its values over the current results.
- **Scenario: strength range.** `abvMin`/`abvMax` keep recipes whose finished ABV is within the
  range; zero-proof drinks sit at 0.
- **Scenario: zero-proof.** In zero-proof mode only the 9 zero-proof house recipes are searched.
- **Scenario: ingredient names.** `GET /ingredients` lists every ingredient by name for pickers.
