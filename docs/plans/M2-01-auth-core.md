# M2-01 auth-core — plan

ADR 0005. API only: screens and the web cookie arrive with M2-02 (one-line amendment: the
http-only cookie is set by web, so M2-01 hands web the token and fixes the cookie's rules in
the ADR). New: migration `0003_auth` (tables `app_user`, `session`, `auth_token`; security
definer functions), api module `src/auth/`, Mailpit in compose. No new npm dependency.

## Scenarios
- **Sign-up never reveals an account.** Given no account for `ana@example.test`, When
  `POST /auth/sign-up {email, password: "negroni-1919"}`, Then 202 `{status: "check-email"}`
  and one mail to that address with a confirm link. The same request for an address that has an
  account answers the identical 202 and body.
- **Confirming signs in.** When `POST /auth/confirm {token, password}` with the mailed token, Then 200
  `{session}` and `GET /auth/me` with `Authorization: Bearer <session>` answers the email. The
  same token again answers 400 `invalid_token`; so does one past 24 h.
- **No pre-registration.** Given Bob signed up with Ana's address (pw "bobs-password"), When Ana
  signs up with "anas-password" and confirms her own link, Then only "anas-password" signs in.
- **Sign-in.** Right email and password → 200 `{session}`. Wrong password, unknown email or an
  unconfirmed account → the same 401 `invalid_credentials`. Email matches case-insensitively.
- **Password rules.** 9 characters → 400; 10 → accepted; 129 → 400.
- **Sign-out.** `POST /auth/sign-out` with a session → 204; that session then answers 401 on
  `/auth/me`; other sessions of the same user still work.
- **Reset.** `POST /auth/reset {email}` → 202 for any address; a mail only for a confirmed
  account. `POST /auth/reset/confirm {token, password}` → 200 `{session}`; every older session
  answers 401; the old password fails, the new one signs in; the token works once, 1 h.
- **Expired session.** A session past `expires_at` answers 401.
- **Rate limits.** The 11th sign-in for one email inside 15 min → 429 `rate_limited`, even with
  the right password; sign-up and reset: the 6th per email per hour → 429.
- **Isolation.** Through the repository and `withUser`, user B cannot read, change or delete
  user A's `app_user` or `session` row (`expectIsolated`); the api role cannot read
  `auth_token` or other users' rows directly.
- **No secrets out.** Responses never contain a password hash or token hash; the api has no
  logger output for auth; tokens are stored only as SHA-256.

## Tests
Unit: password hash/verify and parameters, rate limiter windows. Integration (real Postgres):
every scenario above through `buildApp().inject` with the in-memory mailer, plus the isolation
harness. e2e: none (no screen); verify:full runs once because compose gains Mailpit.

## Steps
1. Migration + down, repository and definer functions, isolation test.
2. Password + token + limiter units (red first).
3. Routes, schema, contract regenerate; integration tests.
4. Mailpit in compose and verify ports; `MAIL_URL` wiring.
