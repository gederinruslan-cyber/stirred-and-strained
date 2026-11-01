// How to make a house recipe, in our own words, from its method and glass: house recipes carry
// no stored steps yet, and the source's prose is never used (data/SOURCES.md).

/** The glass as a phrase ("a chilled coupe", "a rocks glass"). */
const GLASS: Record<string, string> = {
  Lowball: "rocks glass",
  Highball: "highball",
  Coupe: "coupe",
  Cocktail: "cocktail glass",
  "Nick and Nora": "Nick and Nora",
  Wine: "wine glass",
  Hurricane: "hurricane glass",
  Tiki: "tiki mug",
  Champagne: "flute",
  "Glass mug": "glass mug",
  Fizzio: "fizz glass",
  Julep: "julep cup",
  Shot: "shot glass",
  Absinthe: "absinthe glass",
  Margarita: "margarita glass",
  "Copper mug": "copper mug",
};

/** Glasses a drink is served in over ice; the rest are served up, chilled. */
const ON_ICE = new Set([
  "Lowball",
  "Highball",
  "Hurricane",
  "Tiki",
  "Glass mug",
  "Julep",
  "Copper mug",
]);

export const glassName = (glass: string | null) => (glass && GLASS[glass]) || "glass";

/** Every glass a recipe can name, by id, with its phrase. */
export const GLASSES = Object.entries(GLASS).map(([id, name]) => ({ id, name }));

/** Steps from the method; `tops` names what goes on last ("club soda"). */
export function stepsFor(method: string, glass: string | null, tops: string[]): string[] {
  const g = glassName(glass);
  const top = tops.length > 0 ? [`Top up with ${tops.join(" and ")}.`] : [];
  const strain =
    glass && ON_ICE.has(glass)
      ? `Strain into a ${g} over fresh ice.`
      : `Strain into a chilled ${g}.`;
  switch (method) {
    case "shaken":
      return ["Shake everything hard with ice.", strain, ...top];
    case "stirred":
      return ["Stir everything with ice until well chilled.", strain, ...top];
    case "built":
      return [
        `Fill a ${g} with ice.`,
        top.length > 0
          ? "Pour in the rest and give it a gentle stir."
          : "Pour in everything and give it a gentle stir.",
        ...top,
      ];
    case "muddled":
      return [
        `Muddle the fresh ingredients in a ${g}.`,
        "Add the rest and ice, then stir.",
        ...top,
      ];
    case "blended":
      return [
        "Blend everything with a scoop of crushed ice until smooth.",
        `Pour into a ${g}.`,
        ...top,
      ];
    default:
      return [
        `Pour each ingredient slowly over the back of a spoon into a ${g}, in the order listed.`,
      ];
  }
}
