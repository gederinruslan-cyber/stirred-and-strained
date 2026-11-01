import fc from "fast-check";
import { describe, expect, it } from "vitest";
import { buyNext, createTaxonomy, makeNow, matchLine, oneAway } from "../src/index.ts";
import type { IngredientNode, Substitution } from "../src/index.ts";
import { NODES, RECIPES, SUBSTITUTIONS } from "./fixtures/taxonomy.ts";

const tax = createTaxonomy(NODES, SUBSTITUTIONS);
const ids = (rs: { recipe: { id: string } }[]) => rs.map((r) => r.recipe.id);

describe("matchLine", () => {
  it("lets a child satisfy its parent, never the reverse", () => {
    expect(matchLine(tax, ["buffalo-trace"], { ingredient: "bourbon" })?.kind).toBe("direct");
    expect(matchLine(tax, ["buffalo-trace"], { ingredient: "american-whiskey" })?.kind).toBe(
      "direct",
    );
    expect(matchLine(tax, ["whiskey"], { ingredient: "bourbon" })).toBeNull();
  });

  it("accepts only the node itself on an exact line", () => {
    const campari = { ingredient: "campari", exact: true };
    expect(matchLine(tax, ["campari"], campari)?.kind).toBe("direct");
    expect(matchLine(tax, ["contratto", "bitter-aperitivo"], campari)).toBeNull();
  });

  it("follows substitution edges one way and one hop", () => {
    expect(matchLine(tax, ["rittenhouse"], { ingredient: "bourbon" })).toEqual({
      kind: "swap",
      using: "rittenhouse",
    });
    expect(matchLine(tax, ["buffalo-trace"], { ingredient: "rye" })).toBeNull();
    expect(matchLine(tax, ["scotch"], { ingredient: "bourbon" })).toBeNull();
  });

  it("prefers a direct match over a swap, then the smallest id", () => {
    expect(matchLine(tax, ["rye", "buffalo-trace"], { ingredient: "bourbon" })).toEqual({
      kind: "direct",
      using: "buffalo-trace",
    });
    expect(matchLine(tax, ["tanqueray", "gin"], { ingredient: "gin" })).toEqual({
      kind: "direct",
      using: "gin",
    });
  });
});

describe("makeNow, oneAway, buyNext", () => {
  const bar = [
    "tanqueray",
    "campari",
    "sweet-vermouth",
    "rittenhouse",
    "lemon-juice",
    "sugar",
    "soda-water",
  ];

  it("makes what the bar covers, with the swaps it used, ordered by name", () => {
    const now = makeNow(tax, bar, RECIPES);
    expect(ids(now)).toEqual([
      "boulevardier",
      "bourbon-highball",
      "campari-soda",
      "gin-sour",
      "manhattan",
      "negroni",
      "whiskey-sour",
    ]);
    expect(now.find((r) => r.recipe.id === "boulevardier")?.swaps).toEqual([
      { line: { ingredient: "bourbon" }, using: "rittenhouse" },
    ]);
    expect(now.find((r) => r.recipe.id === "negroni")?.swaps).toEqual([]);
  });

  it("ignores optional lines", () => {
    expect(ids(makeNow(tax, ["gin", "lime-juice", "soda-water"], RECIPES))).toEqual(["gin-rickey"]);
  });

  it("names the one missing ingredient", () => {
    const away = oneAway(tax, ["gin", "sweet-vermouth", "lemon-juice"], RECIPES);
    expect(away.map((r) => [r.recipe.id, r.missing.ingredient])).toEqual([
      ["gin-sour", "sugar"],
      ["manhattan", "rye"],
      ["negroni", "bitter-aperitivo"],
    ]);
  });

  it("ranks bottles to buy by how many one-away recipes they complete", () => {
    const next = buyNext(tax, ["gin", "sweet-vermouth", "soda-water"], RECIPES);
    expect(next.map((b) => [b.ingredient.id, b.unlocks.map((r) => r.id)])).toEqual([
      // Campari is a bitter aperitivo, so it completes the Negroni too; rye stands in for bourbon.
      ["campari", ["campari-soda", "negroni"]],
      ["rye", ["bourbon-highball", "manhattan"]],
      ["bitter-aperitivo", ["negroni"]],
      ["bourbon", ["bourbon-highball"]],
      ["lime-juice", ["gin-rickey"]],
    ]);
  });

  it("gives the same answers whatever order the bar and recipes arrive in", () => {
    const owned = NODES.map((x) => x.id);
    fc.assert(
      fc.property(
        fc.subarray(owned),
        fc.shuffledSubarray(RECIPES, { minLength: RECIPES.length }),
        (picked, shuffledRecipes) => {
          const reversed = [...picked].reverse();
          const key = (r: { recipe: { id: string } }) => r.recipe.id;
          expect(makeNow(tax, reversed, shuffledRecipes).map(key)).toEqual(
            makeNow(tax, picked, RECIPES).map(key),
          );
          expect(oneAway(tax, reversed, shuffledRecipes).map(key)).toEqual(
            oneAway(tax, picked, RECIPES).map(key),
          );
          expect(buyNext(tax, reversed, shuffledRecipes)).toEqual(buyNext(tax, picked, RECIPES));
        },
      ),
    );
  });
});

describe("createTaxonomy", () => {
  const spirits = NODES[0]!;
  const type = (id: string, parentId: string): IngredientNode => ({
    id,
    name: id,
    kind: "type",
    parentId,
  });
  it.each<[string, IngredientNode[], Substitution[]]>([
    ["an unknown parent", [type("x", "nope")], []],
    ["a duplicate id", [spirits, spirits], []],
    ["a cycle", [type("a", "b"), type("b", "a")], []],
    ["an edge to an unknown node", [spirits], [{ substitute: "spirits", replaces: "nope" }]],
  ])("refuses %s", (_, nodes, subs) => {
    expect(() => createTaxonomy(nodes, subs)).toThrow();
  });
});
