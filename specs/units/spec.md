# Units

## Requirement: Amounts are canonical and displayed in ml, cl or oz
Liquid volume is kept in ml; cl and oz exist only on screen. 1 US fl oz = 29.5735295625 ml
(NIST Handbook 44, Appendix C).

- **Scenario: common amounts.** 30 ml shows as "30 ml", "3 cl", "1 oz"; 45 ml as "45 ml",
  "4.5 cl", "1½ oz"; 22.5 ml as "23 ml", "2.3 cl", "¾ oz"; 15 ml as "½ oz".
- **Scenario: one rounding step.** ml rounds to the whole ml, cl to 0.1 cl, oz to the nearest
  ¼ oz; a shown amount is within half a step of the true one.
- **Scenario: zero and tiny amounts.** 0 ml shows as "0 ml", "0 cl", "0 oz". A non-zero amount
  never shows as zero: 0.3 ml shows as "< 1 ml" and "< 0.1 cl", 3 ml as "< ¼ oz".
- **Scenario: counted units.** Counted amounts read the same in every display unit and round to
  the nearest ½, never below ½ when non-zero: 2 dashes → "2 dashes", 1 dash → "1 dash",
  ½ barspoon → "½ barspoon", 1½ barspoons → "1½ barspoons", 0.1 dash → "½ dash"; a top-up reads
  "top up".
- **Scenario: invalid amounts.** A negative, NaN or infinite amount is refused.

## Requirement: Scaling works on canonical amounts, then rounds once
- **Scenario: servings.** 30 ml for 4 servings is 120 ml ("4 oz"). 20 ml for 3 servings is
  60 ml ("2 oz"), not three times "¾ oz".
- **Scenario: top-ups.** A top-up stays a top-up when scaled.
- **Scenario: order does not matter.** Scaling by a, then b, equals scaling by a·b before
  display.
