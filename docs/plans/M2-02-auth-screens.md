# M2-02 auth-screens

Screens for the M2-01 api (ADR 0005, `specs/auth/spec.md`). Web stays UI only: server actions
call the generated client; the session token lives only in an http-only cookie.

## Scenarios
- **Sign up.** Given the age is answered, when Ana opens "Sign in" in the header, follows
  "Create an account" and submits `ana@example.test` / "negroni-1919", then /sign-up shows
  "Check your email" naming the address, with the link's rules (one use, 24 hours, type the
  same password). An address that already has an account sees the identical page.
- **Short password.** "negroni" (7) is refused before anything is sent: "Use 10 to 128
  characters." The email stays filled in; the password field is empty.
- **Confirm.** Opening the mailed `/confirm?token=…` and typing the same password signs her in
  (cookie `session`, http-only, SameSite=Lax, expires with the session) and lands on `/`; the
  header now shows "Sign out" instead of "Sign in". Before the age is answered, the link goes
  through the gate and back to itself.
- **Bad link.** A wrong password, a used or expired link: "That link didn't work" with why it
  can happen and a link to sign up again (the link is spent either way). Nothing else changes.
- **Sign in.** Right email (any case) and password: signed in, back to where she came from
  (`?back=`, local paths only). Wrong password, unknown email and unconfirmed sign-up all show
  the same "That email and password don't match." The email stays; the password is cleared.
- **Rate limited.** The api's 429 shows "Too many tries. Wait a few minutes and try again."
- **Sign out.** The header's "Sign out" (a POST button) ends this session in the api, clears
  the cookie and returns to the page. A stale or deleted session cookie shows signed out and is
  dropped on the next sign-out or sign-in.
- **Forgot.** /forgot with any address shows the same "Check your email" (one hour). The mailed
  `/reset?token=…` asks for a new password (10–128); success signs in and lands on `/`; a used or
  expired link shows "That link didn't work" with a link to ask again.
- **Signed in already.** /sign-in and /sign-up redirect a signed-in visitor to `/`.
- **Without JavaScript.** Every form above is a plain POST to a server action and renders its
  result or error on the server.
- **Isolation.** The web never reads another user's session: it only forwards its own cookie as
  `Authorization: Bearer`; `/auth/me` answers for that session alone.

## Design
`ui-ux-designer` pass inside Bar Napkin: a single-form page (napkin card like the age gate),
Text field pattern (moves from `search.css` to `@stirred/ui` styles: third caller), errors as
`p.field__error` + `aria-invalid`, a status message for "check your email".

## Build
- `apps/web/lib/session.ts`: read the cookie, `authed()` headers (Bearer + the client's
  X-Forwarded-For entry), set/clear the cookie (`Secure` when PUBLIC_ORIGIN is https).
- Pages `/sign-in`, `/sign-up`, `/confirm`, `/forgot`, `/reset`; actions in `app/(auth)/actions.ts`.
- Header: `me` from the layout; "Sign out" form when signed in.
- No api, schema or table change.

## End-to-end check
e2e (`auth.spec.ts`): sign up → read the link from Mailpit's API → confirm → header shows
"Sign out" → sign out → sign in (wrong then right) → forgot → reset link from Mailpit → new
password signs in; the same flow's key steps without JavaScript; axe on each screen in light
and dark at 1440 and 360.
