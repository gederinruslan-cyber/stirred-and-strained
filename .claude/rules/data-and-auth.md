---
paths:
  - "packages/db/**"
  - "apps/api/src/**"
  - "apps/api/db/**"
---

# Data layer and auth rules (apply when touching these files)

- Every table that holds user data carries `user_id`. Every read and write of user data goes
  through the scoped data-access layer in `packages/db`; the raw pool is confined to that
  package. House (curated) data is read-only at runtime.
- A request for another user's row answers **404, never 403**. Every user-owned resource gets
  one integration test proving user A cannot read or change user B's data.
- User recipes, bars and notes are soft-deleted with an undo window and a change history; a
  hard delete happens only through account erase.
- Migrations are plain SQL with a down script each; runtime processes never connect as a
  superuser.
- No session token, password, reset token or email in logs. Log fields are an allow-list
  (`reqId`), never request bodies or query values.
- Every POST/PUT/PATCH/DELETE passes the origin and content-type gate; nothing below HTTP reads
  a cookie or header to decide the user.
- If you add a dependency that touches the database, auth or HTTP parsing, say so in the
  commit message so the reviewer looks at it.
