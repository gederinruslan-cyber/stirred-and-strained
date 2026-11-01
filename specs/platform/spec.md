# Platform

## Requirement: The api reports its health and the database's
- **Scenario: database reachable.** Given Postgres is reachable, when a client requests
  `GET /health`, then the api answers 200 `{ "status": "ok", "db": "up" }`.
- **Scenario: database unreachable.** Given Postgres is not reachable, when a client requests
  `GET /health`, then the api answers 503 `{ "status": "degraded", "db": "down" }` within about
  two seconds, and the body carries no connection details.

## Requirement: The home page is served
- **Scenario: home page.** Given the stack is running, when a browser opens `/`, then the page
  answers 200 with a level-one heading.
