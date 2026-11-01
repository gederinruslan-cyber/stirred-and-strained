# M1-11 · age-gate-and-responsible-footer

A locale-aware age gate before any alcoholic content, and a footer that points to local help.
Legal sign-off needed on copy, table and behaviour (NH-5) before it ships.

## Decisions
- **Country** from the `Accept-Language` region (en-GB → GB), changeable on the gate; never IP
  geolocation (no third party, no personal data). Unknown → the default.
- **Ages** (research 2026-11-01, sources in `apps/api/src/legal/drinking-age.ts`): US 21; CA 19
  (highest province; AB, MB, QC are 18); GB, IE, FR, ES, IT, NL, PL, AU, NZ, BR, MX 18; DE 18
  (spirits); JP 20; KR 19; IN 25 (highest state; some states prohibit); default 21.
- **Answer kept** in a cookie `age` = `ok` | `zero` for a year, with the country; nothing else.
- **"No"** gives a zero-proof-only session: zero-proof mode on and locked, alcoholic recipes and
  bottles hidden (decision 2026-11-01).
- **Help line** per country from government services (industry-funded bodies avoided);
  fallback findahelpline.com.

## Scenarios
- Given a first visit with `Accept-Language: en-GB`, when any page is requested, then the gate
  asks "Are you 18 or over?" naming the United Kingdom, before any recipe is shown.
- Given `en-US`, the question says 21; given an unknown region, 21.
- Choosing another country on the gate re-asks with that country's age (works without JS).
- "Yes" returns to the page asked for (local paths only) and the gate is not shown again.
- "No" returns to the page with zero-proof on; the zero-proof switch is shown on and cannot be
  turned off; the demo lists only zero-proof recipes.
- The footer names the visitor's country help line (UK: Drinkline 0300 123 1110) and keeps
  "Drink well, not a lot" copy; no copy encourages excess.
- Axe: the gate passes WCAG 2.2 AA in light and dark at 1440 and 360 px; keyboard reaches both
  answers and the country picker.

## Build
- api: `GET /age-rules?country=XX` → `{ country, name, age, help }` (table in the api).
- web: `proxy.ts` sends a visitor without the cookie to `/age?back=…`; `/age` page + POST
  route sets the cookie; `readPrefs` treats `age=zero` as zero-proof locked; footer reads help.

## Check
- Unit: country resolution from Accept-Language. e2e: gate (GB 18, US 21), yes, no → locked
  zero-proof, axe. Existing e2e set the `age=ok` cookie up front.
