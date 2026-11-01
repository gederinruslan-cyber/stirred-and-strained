import { describe, expect, it } from "vitest";
import type { Snapshot } from "../src/seed/snapshot.ts";
import { IBA_LICENCE, LICENCE, transform, type Rules } from "../src/seed/transform.ts";

type Cocktail = Snapshot["cocktails"][number];
const line = (
  ingredient: string,
  amount: number | null,
  units: string,
  max: number | null = null,
) => ({
  ingredient,
  amount,
  units,
  max,
  optional: false,
});
const cocktail = (over: Partial<Cocktail> = {}): Cocktail => ({
  id: "sour",
  name: "Sour",
  method: "Shake",
  glass: "Coupe",
  tags: ["Sour", "Virgin"],
  source: "https://www.example.com/sour",
  author: null,
  lines: [
    line("bourbon", 1.5, "oz"),
    line("lemon-juice", 22.5, "ml"),
    line("angostura", 2, "dashes", 3),
  ],
  ...over,
});
const snapshot = (cocktails: Cocktail[]): Snapshot => ({
  source: "fixture",
  commit: "0000000",
  ingredients: [
    { id: "spirits", name: "Spirits", parent: null, abv: 40, brand: false },
    { id: "whiskey", name: "Whiskey", parent: "spirits", abv: 40, brand: false },
    { id: "bourbon", name: "Bourbon", parent: "whiskey", abv: 45, brand: false },
    { id: "rye", name: "Rye", parent: "whiskey", abv: 45, brand: false },
    { id: "makers", name: "Maker's Mark", parent: "bourbon", abv: 45, brand: true },
    { id: "juices", name: "Juices", parent: null, abv: 0, brand: false },
    { id: "lemon-juice", name: "Lemon juice", parent: "juices", abv: 0, brand: false },
    { id: "angostura", name: "Angostura", parent: null, abv: 44.7, brand: false },
    { id: "salt", name: "Salt", parent: null, abv: 0, brand: false },
  ],
  cocktails,
});
const rules = (over: Partial<Rules> = {}): Rules => ({
  categories: { pantry: "Pantry", bitters: "Bitters" },
  moveUnder: {},
  abv: {},
  alcoholicCategories: ["spirits", "bitters"],
  placements: { angostura: "bitters", salt: "pantry" },
  exclusions: {},
  ibaChecked: [],
  corrections: {},
  substitutions: [],
  exact: {},
  ...over,
});

describe("seed transform", () => {
  it("places ingredients in category > type > brand, childless roots under their named category", () => {
    const { nodes } = transform(snapshot([]), rules());
    const kind = (id: string) => nodes.find((n) => n.id === id);
    expect(kind("spirits")).toMatchObject({ kind: "category", parentId: null });
    expect(kind("bourbon")).toMatchObject({ kind: "type", parentId: "whiskey", abv: 45 });
    expect(kind("makers")).toMatchObject({ kind: "brand", parentId: "bourbon" });
    expect(kind("salt")).toMatchObject({ kind: "type", parentId: "pantry", abv: 0 });
    expect(() => transform(snapshot([]), rules({ placements: { angostura: "bitters" } }))).toThrow(
      /"salt" needs a placement/,
    );
  });

  it("stores canonical amounts: oz to ml unrounded at 3 places, dashes counted with their range", () => {
    const [r] = transform(snapshot([cocktail()]), rules()).recipes;
    expect(r!.lines).toEqual([
      { ingredient: "bourbon", value: 44.36, unit: "ml", max: null, optional: false, exact: false },
      {
        ingredient: "lemon-juice",
        value: 22.5,
        unit: "ml",
        max: null,
        optional: false,
        exact: false,
      },
      { ingredient: "angostura", value: 2, unit: "dash", max: 3, optional: false, exact: false },
    ]);
    const [t] = transform(
      snapshot([
        cocktail({
          lines: [
            line("bourbon", 30, "ml"),
            line("lemon-juice", 0, "topup"),
            line("salt", 1, "tsp"),
          ],
        }),
      ]),
      rules(),
    ).recipes;
    expect(t!.lines.map((l) => [l.value, l.unit])).toEqual([
      [30, "ml"],
      [1, "top"],
      [4.929, "ml"],
    ]);
  });

  it("keeps provenance and drops nothing but facts it was given", () => {
    const [r] = transform(snapshot([cocktail({ author: "A. Bartender" })]), rules()).recipes;
    expect(r!.tags).toEqual(["Sour"]);
    expect(r).toMatchObject({
      method: "shaken",
      source: "https://www.example.com/sour",
      credit: "Spec via example.com (A. Bartender)",
      licence: LICENCE,
    });
  });

  it.each([
    ["no source", { source: null }, /"sour" has no source/],
    ["an unknown unit", { lines: [line("bourbon", 1, "part")] }, /"sour": unit "part"/],
    [
      "an unresolved ingredient",
      { lines: [line("unicorn-tears", 30, "ml")] },
      /"unicorn-tears" is not in the taxonomy/,
    ],
    ["no method", { method: null }, /"sour" has no known method/],
    ["no alcohol", { lines: [line("lemon-juice", 30, "ml")] }, /"sour" has no alcohol/],
  ])("fails on a recipe with %s, unless it is excluded with a reason", (_, over, error) => {
    expect(() => transform(snapshot([cocktail(over)]), rules())).toThrow(error);
    const out = transform(snapshot([cocktail(over)]), rules({ exclusions: { sour: "reason" } }));
    expect([out.recipes, out.excluded]).toEqual([[], ["sour"]]);
  });

  it("replaces a spec that differs from the IBA page with the checked IBA spec and credit", () => {
    const corrections = {
      sour: {
        source: "https://iba-world.com/iba-cocktail/whiskey-sour/",
        credit: "IBA official cocktail · The Unforgettables",
        lines: [{ ingredient: "bourbon", amount: 45, unit: "ml" as const }],
      },
    };
    const [r] = transform(snapshot([cocktail()]), rules({ corrections })).recipes;
    expect(r).toMatchObject({
      credit: "IBA official cocktail · The Unforgettables",
      licence: IBA_LICENCE,
      lines: [{ ingredient: "bourbon", value: 45, unit: "ml" }],
    });
  });

  it("fails on a recipe sourced to the IBA that was neither checked nor corrected", () => {
    const iba = cocktail({ source: "https://iba-world.com/sour/" });
    expect(() => transform(snapshot([iba]), rules())).toThrow(/not checked against its page/);
    expect(transform(snapshot([iba]), rules({ ibaChecked: ["sour"] })).recipes).toHaveLength(1);
  });

  it("moves a node under the parent the rules name, overriding the source's parent", () => {
    const { nodes } = transform(snapshot([]), rules({ moveUnder: { bourbon: "spirits" } }));
    expect(nodes.find((n) => n.id === "bourbon")?.parentId).toBe("spirits");
  });

  it("corrects an ingredient's ABV from the rules", () => {
    const { nodes } = transform(snapshot([]), rules({ abv: { whiskey: 43 } }));
    expect(nodes.find((n) => n.id === "whiskey")?.abv).toBe(43);
  });

  it("imports substitutions with their reason, and marks the lines a drink is named for exact", () => {
    const ryeForBourbon = { substitute: "rye", replaces: "bourbon", reason: "drier, spicier" };
    const out = transform(
      snapshot([cocktail()]),
      rules({ substitutions: [ryeForBourbon], exact: { sour: { bourbon: "named for it" } } }),
    );
    expect(out.substitutions).toEqual([ryeForBourbon]);
    expect(out.recipes[0]!.lines.map((l) => [l.ingredient, l.exact])).toEqual([
      ["bourbon", true],
      ["lemon-juice", false],
      ["angostura", false],
    ]);
  });

  it.each<[string, Partial<Rules>, RegExp]>([
    [
      "an edge to an unknown ingredient",
      { substitutions: [{ substitute: "rye", replaces: "unicorn", reason: "r" }] },
      /names an unknown ingredient/,
    ],
    [
      "a redundant edge",
      { substitutions: [{ substitute: "makers", replaces: "bourbon", reason: "r" }] },
      /"makers" already counts as "bourbon"/,
    ],
    [
      "an edge with no reason",
      { substitutions: [{ substitute: "rye", replaces: "bourbon", reason: " " }] },
      /rye → bourbon has no reason/,
    ],
    ["an exact line on a recipe not imported", { exact: { fizz: { bourbon: "r" } } }, /"fizz"/],
    [
      "an exact line the recipe lacks",
      {
        substitutions: [{ substitute: "bourbon", replaces: "rye", reason: "r" }],
        exact: { sour: { rye: "r" } },
      },
      /"sour" has no "rye" line/,
    ],
    ["an exact line no swap targets", { exact: { sour: { bourbon: "r" } } }, /no swap/],
  ])("fails on %s", (_, over, error) => {
    expect(() => transform(snapshot([cocktail()]), rules(over))).toThrow(error);
  });

  it("fails on a recipe using a 0% ingredient that sits under an alcoholic category", () => {
    const snap = snapshot([cocktail()]);
    snap.ingredients.find((i) => i.id === "bourbon")!.abv = 0;
    expect(() => transform(snap, rules())).toThrow(/recipe "sour".*"bourbon".*0% ABV/);
  });
});
