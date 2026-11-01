# Your account: export and erase

## Requirement: A signed-in user can take everything they own with them, at any time
- **Scenario: the account page.** Signed in, "Account" (beside "Sign out" in the header) and "Your
  account" (footer) open /account: "Signed in as ana@example.test.", "Take your data with you"
  and "Delete your account". Signed out, /account sends the visitor to sign in and back.
- **Scenario: JSON.** "Download as JSON" saves `stirred-and-strained-<date>.json`: the email and
  account date; when each live session started and ends (never a token); every bar item with its
  name; the swaps turned off (Rye whiskey for Bourbon Whiskey); every own recipe, deleted ones too,
  with lines as stored (1 oz Campari is 29.5735295625 ml, with "oz" as typed), `deletedAt` and the
  whole history (created, edited, deleted, restored, each save with its spec); every favourite,
  rating and note, with the earlier note kept for undo.
- **Scenario: Markdown.** "Download as Markdown" saves the same as a page to read or print:
  sections for the bar, swaps turned off, recipes (a deleted one is marked "(deleted <date>)"),
  favourites, ratings and notes, and sign-ins; amounts in the unit typed, rounded once ("¾ oz
  Campari"); the user's own text escaped so it reads as typed ("Ana's \*Negroni\*").
- **Scenario: only your own.** Ben's bar, recipes and marks never appear in Ana's export; signed
  out, the export answers 401.

## Requirement: Erase removes the account and everything in it, only on purpose
- **Scenario: refused.** "Delete my account" with no password says "Enter your password."; without
  the tick "Tick the box to confirm. Nothing was deleted."; a wrong password "That's not your
  password. Nothing was deleted."; focus goes to the first field to fix, the password never comes
  back and the tick stays as sent. After 10 wrong passwords in 15 minutes: "Too many tries. Wait a
  few minutes and try again. Nothing was deleted."
- **Scenario: erase.** With her password and the tick, every row of Ana's in every user-owned table
  goes, with her account and any pending confirm or reset link for her address; her sessions end
  on every device and the cookie goes. /account/deleted says "Your account is deleted" with a way
  back to the start; signing in with her old password says "That email and password don't
  match."; every one of Ben's rows is untouched.
- **Scenario: no table forgotten.** Every table holding user rows follows the account (cascade), so
  a new user table cannot outlive an erase.
- **Scenario: rate-limit counts.** Limits are counted per address in memory for at most an hour and
  never stored, so an erase has nothing there to remove.
