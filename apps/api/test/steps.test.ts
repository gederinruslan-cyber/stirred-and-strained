import { describe, expect, it } from "vitest";
import { stepsFor } from "../src/recipes/steps.ts";

describe("stepsFor: our own words, from method and glass", () => {
  it.each([
    ["shaken", "Coupe", [], ["Shake everything hard with ice.", "Strain into a chilled coupe."]],
    [
      "stirred",
      "Nick and Nora",
      [],
      ["Stir everything with ice until well chilled.", "Strain into a chilled Nick and Nora."],
    ],
    [
      "stirred",
      "Lowball",
      [],
      ["Stir everything with ice until well chilled.", "Strain into a rocks glass over fresh ice."],
    ],
    [
      "built",
      "Highball",
      ["club soda"],
      [
        "Fill a highball with ice.",
        "Pour in the rest and give it a gentle stir.",
        "Top up with club soda.",
      ],
    ],
    [
      "muddled",
      "Lowball",
      [],
      ["Muddle the fresh ingredients in a rocks glass.", "Add the rest and ice, then stir."],
    ],
    [
      "layered",
      null,
      [],
      ["Pour each ingredient slowly over the back of a spoon into a glass, in the order listed."],
    ],
  ] as const)("%s in a %s", (method, glass, tops, steps) => {
    expect(stepsFor(method, glass, [...tops])).toEqual(steps);
  });
});
