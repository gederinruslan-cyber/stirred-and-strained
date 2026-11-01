import { createTaxonomy, makeNow, oneAway } from "@stirred/engine";
import { describe, expect, it } from "vitest";
import {
  ALWAYS,
  BASICS,
  DEMO_BOTTLES,
  SAMPLE_NODES,
  SAMPLE_RECIPES,
  SAMPLE_SUBSTITUTIONS,
} from "../src/sample/library.ts";

const tax = createTaxonomy(SAMPLE_NODES, SAMPLE_SUBSTITUTIONS);

describe("sample library", () => {
  it("resolves every line and demo chip to a node", () => {
    const lines = SAMPLE_RECIPES.flatMap((r) => r.lines.map((l) => l.ingredient));
    for (const id of [...lines, ...DEMO_BOTTLES, ...BASICS, ...ALWAYS])
      expect(tax.nodes.has(id), id).toBe(true);
  });

  it("runs the landing demo: gin, sweet vermouth, bitter aperitivo and the basics", () => {
    const bar = ["london-dry-gin", "sweet-vermouth", "bitter-aperitivo", ...BASICS, ...ALWAYS];
    const now = makeNow(tax, bar, SAMPLE_RECIPES).map((r) => r.recipe.id);
    expect(now).toEqual(expect.arrayContaining(["negroni", "americano", "gimlet", "tom-collins"]));
    const away = oneAway(tax, bar, SAMPLE_RECIPES).map((r) => [r.recipe.id, r.missing.ingredient]);
    expect(away).toContainEqual(["boulevardier", "bourbon"]);
  });
});
