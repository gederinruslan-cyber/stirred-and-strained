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
