# Landing page — design spec

*Approved 2026-11-01. Built in M0-08. Uses the Bar Napkin system (`patterns.md`) in both themes.
Reference mockup: `mockups/landing.dc.html`; photos in `mockups/photos/`. Anything in
[BRACKETS] is a fact the build fills from real data or a human decision, never invented.*

## Goal and actions
- **Goal:** one experience of the engine within 30 seconds: tick bottles, see what you can make,
  see the one bottle you're missing.
- **Audience:** home bartenders with 5 to 30 bottles who hit a paywall or a stale app elsewhere;
  adults only (zero-proof dropped 2026-11-01).
- **Primary action:** **Start my bar** (bar builder; usable before sign-up). Secondary: the inline
  demo, **Just browse** (library), **Sign in**.

## Sections, top to bottom (desktop 1440; content max 1200)
1. **Header:** wordmark "Stirred & Strained" (Caveat "&" in accent) · Recipes · My Bar ·
   Search "Find a drink…" · theme button (sun/moon) · Sign in · **Start my
   bar**.
2. **Hero** (copy left, napkin demo right):
   - Caveat aside: "your home bar, sorted".
   - H1: **What can you make tonight?** (highlighter under "tonight?").
   - Sub: "Tell us what's on your shelf. We'll show you what you can mix right now, what you're
     one bottle away from, and which bottle to grab next. Real recipes, properly credited."
   - Buttons: **Start my bar** · **Just browse**. Aside: "free · no ads · your recipes stay
     yours".
   - Demo napkin "What's on your shelf?": 12 bottle chips (London dry gin, Bourbon, Rye whiskey,
     White rum, Blanco tequila, Sweet vermouth, Dry vermouth, Bitter aperitivo, Orange liqueur,
     Angostura, Ginger beer, Grenadine), checkbox "Plus the usual: lemons, limes, sugar, soda
     water" (on). Results: "you can make N!" (up to 5: name · method) and "one bottle away…" (up
     to 3: name + missing bottle). Footer: "Nothing's saved yet. Start my bar to keep it." Aside
     with arrow: "tick a few, it updates live".
3. **Why it's different** — three sticky notes: "Recipes with receipts." · "We know bourbon is
   whiskey." · "How strong is it, really?" (copy in the mockup).
4. **A few to get you going** — Caveat "start here", sub "Four favourites, written up properly.
   Pick your units and every amount follows.", an ml/cl/oz control, four recipe cards with photos:
   Negroni, Old Fashioned, Margarita, John Collins (blurbs,
   ingredients, method, strength line, credit). Cards come from the house library (featured flag); amounts follow the unit.
5. **Which bottle should you buy next?** — copy left with "How we work it out →" and aside "(this
   is the bit other apps charge for)"; right a ruled table for the example bar "gin, bourbon,
   sweet vermouth, Angostura & the usual": Buy this · New recipes · Like. Rows from `buyNext`.
6. **Every recipe, the way a bartender would jot it down** — Daiquiri card (unit control, rows,
   strength strip, IBA credit) with four handwritten callouts: who made it ·
   ml, cl or oz · how strong, after the ice · swaps that actually work.
8. **Your recipes live right next to ours.** — search-results card (Daiquiri house, My Daiquiri #2
   "yours!", Hemingway Daiquiri one away) and copy; aside "private unless you say otherwise".
9. **Straight talk** — dashed box: "It's free. All of it." (no paid plan, no ads) ·
   "No robots wrote these recipes."
10. **Closing** — "So… what's on your shelf?", "Tick a few bottles and see what tonight could look
    like.", **Start my bar**, aside "takes a couple of minutes".
11. **Footer** — brand + "good drinks from what you've got"; The app; Behind the bar (Where our
    recipes come from, How we work out strength, [contact]); The small print (Terms, Privacy,
    Cookies); responsible line; "Recipe data thanks to: [sources]"; © [entity]; Theme: Light ·
    Dark.

## Data
- Demo, "buy next" table and featured cards read from the API over the house library (M1-07);
  the web holds no matching logic. The demo lists IBA classics first, then by name.
- Strength values come from `packages/units` (ADR 0004) for the visitor's country: ABV and
  standard drinks (UK units, or grams where no standard drink is defined).

## States
- Demo empty: "Tick a bottle or two and we'll show you." Nothing makeable: "Nothing yet with just
  these, but check the right-hand list." Results debounce 250 ms; one live-region summary ("4
  recipes you can make, 3 one bottle away").
- Works without JavaScript: the demo is a GET form with a submit button; results render on the
  server.

## Age gate
- First visit: the age gate is its own page, `/age` (single-question page in
  `docs/design/patterns.md`, M1-11), not a dialog over this one; "No" shows "Come back
  when you're [age]." in place of every page but the small print.

## SEO
- `<title>` "Stirred & Strained: what can you make tonight?"; meta description from the hero sub;
  JSON-LD `WebSite` with `SearchAction`; featured cards link to their recipe pages (which carry
  `Recipe` markup).
