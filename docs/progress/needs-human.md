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

## NH-8 · Production email provider · open
- **Feature:** M3-04 (auth mail from M2-01, ADR 0005)
- **Question:** Which provider sends confirm and reset mail in production?
- **Options:** decide at deploy with the hosting choice; local and verify stacks use Mailpit
  (free, catches mail) until then.
- **Why a human:** money (and a vendor holding users' email addresses: privacy)
