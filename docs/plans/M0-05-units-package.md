# M0-05 units-package

## Scenarios
- Given 30 ml, then it displays "30 ml", "3 cl", "1 oz"; 45 ml → "45 ml", "4.5 cl", "1½ oz";
  22.5 ml → "23 ml", "2.3 cl", "¾ oz"; 15 ml → "½ oz".
- Given a volume, rounding happens once at display: ml to the whole ml, cl to 0.1 cl, oz to
  the nearest ¼ oz (1 US fl oz = 29.5735295625 ml, NIST HB 44 App. C).
- Given 0 ml, it displays "0 ml" / "0 cl" / "0 oz". Given a non-zero volume that would round to
  zero (0.3 ml; 3 ml in oz), it displays "< 1 ml" / "< 0.1 cl" / "< ¼ oz", never zero.
- Given 2 dashes, it displays "2 dashes" in every display unit; 1 barspoon → "1 barspoon";
  ½ barspoon → "½ barspoon"; `top` → "top up". Counted values round to the nearest ½, a
  non-zero one never below ½.
- Given 30 ml scaled to 4 servings, then 120 ml exactly ("4 oz"). Given 20 ml × 3 servings,
  then 60 ml → "2 oz" (scale first, round once), not 3 × "¾ oz" = "2¼ oz".
- Given a negative, NaN or infinite value, creating a quantity throws.
- Properties (fast-check), over every display unit, 0, tiny (0–1 ml) and large (up to 20 l):
  formatting is total; a non-zero amount never displays as zero; oz output is within ⅛ oz of
  the true value; ml within 0.5 ml; scaling by a then b equals scaling by a·b before display.

## Shape
- `packages/units/src/{constants,quantity,format}.ts`; dev dep `fast-check`.
- No strength yet (M1-01/M1-02).
