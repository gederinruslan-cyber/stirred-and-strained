# Accounts

## Requirement: Sign-up confirms the address and never reveals an account
- **Scenario: new address.** Given no account for `ana@example.test`, when she signs up with
  "negroni-1919", then the api answers 202 `{ "status": "check-email" }` and mails her a link
  that works once, for 24 hours.
- **Scenario: address with an account.** The same sign-up for an address that already has an
  account answers the identical 202 and body, and also mails a link.
- **Scenario: confirming.** Opening the link and typing the password chosen in that sign-up
  signs her in (a 30-day session). A wrong password, the same link again, or a link after 24
  hours answers 400 `invalid_token`; a link is spent on its first use.
- **Scenario: someone else's link.** Given Bob signed up with Ana's address and his own
  password, when Ana opens his link and types hers, then nothing is created or changed. Given
  Cara has an account and Mallory signs up with her address, Cara opening Mallory's link with her
  own password leaves her password and sessions as they were.
- **Scenario: password length.** 9 characters is refused (400); 10 to 128 are accepted; 129 is
  refused. No composition rules.

## Requirement: Sign-in and sign-out
- **Scenario: sign-in.** The right email (any letter case) and password start a session. A wrong
  password, an unknown email and an unconfirmed sign-up all answer the same 401
  `invalid_credentials`.
- **Scenario: sign-out.** Signing out ends that session only; the user's other sessions stay.
- **Scenario: expiry.** A session older than 30 days answers 401.

## Requirement: Password reset
- **Scenario: asking.** A reset request answers the same 202, equally fast, for any address and
  mails a link (one hour, one use) only to an existing account.
- **Scenario: using the link.** Choosing a new password through it ends every session of the
  account and signs in; the old password stops working; the link then answers 400.

## Requirement: Rate limits and secrets
- **Scenario: guessing.** The 11th sign-in for one email within 15 minutes answers 429
  `rate_limited`, even with the right password; the 6th sign-up or reset for one email within an
  hour answers 429.
- **Scenario: nothing secret out.** No answer carries a password, a hash or a token other than
  the new session; tokens are stored only as their SHA-256; nothing about auth is logged.
- **Scenario: isolation.** One user can never read, change or end another user's account or
  sessions.
