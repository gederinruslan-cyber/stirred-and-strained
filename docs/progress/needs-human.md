# Needs human

*Open items only; delete an item once resolved (git keeps the history). Mark `blocking` only
if no other ready work exists.*

Template:

```
## NH-<n> · <title> · open | blocking
- **Feature:** <ID>
- **Question:** <the decision, in one sentence>
- **Options:** <A / B, with the recommendation first>
- **Why a human:** money | deploy/public | legal/licensing | privacy | naming | repeated failure | demo
```

## NH-2 · Working name · open
- **Feature:** M3-02
- **Question:** Keep "Stirred & Strained" as the public name (domain, trademark check)?
- **Decided so far:** working name until M3; the check runs in M3-02 and the human decides then.
- **Why a human:** naming

## NH-3 · Seed sources final look · open
- **Feature:** M1-06 (cannot ship before this)
- **Question:** Approve `data/SOURCES.md`: import Bar Assistant open data (MIT, pinned commit)
  taking facts only, credit each recipe's original source, skip the 15 recipes without one, use
  IBA pages entry by entry to check the classics, no bulk scrape of iba-world.com.
- **Options:** A: approve as written (recommended) / B: IBA-tagged and zero-proof recipes only
  (≈100) until counsel confirms the EU database-right point / C: changes.
- **Why a human:** legal/licensing. Note: the EU database right (Directive 96/9/EC) can protect
  a compilation even when each entry is a fact; to confirm with counsel before launch (M3-02).

## NH-4 · Strength model sign-off · open
- **Feature:** M1-01 (blocks M1-02, and through it M1-07 onwards)
- **Question:** Accept ADR 0004 (`docs/adr/0004-strength-model.md`)? Measured parts: Arnold's
  shaken and stirred dilution. Choices with no published measurement, each erring toward showing
  a stronger drink: built = stirred, blended = shaken, muddled = built, a "top up" = 90 ml of 0%
  mixer; a dash = 0.8 ml; Germany and Switzerland at 10 g (their governments say 10–12 g);
  Japan and unlisted countries show grams of alcohol instead of standard drinks.
- **Options:** A: accept as written (recommended) / B: change any of the values above.
- **Why a human:** legal (responsible-drinking figures shown to the public)
