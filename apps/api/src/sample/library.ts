// A small sample library that runs the landing page on the real engine until the house
// library exists (M1-07 replaces it). Classic specs follow the IBA list and are to be checked
// against it before launch; amounts are canonical (ml or counted units).
import type { IngredientNode, Substitution } from "@stirred/engine";

type Amount = { value: number; unit: "ml" | "dash" | "barspoon" | "piece" | "top" };
export type SampleNode = IngredientNode & { abv: number };
export type SampleLine = {
  ingredient: string;
  /** Display name when it differs from the ingredient's ("Bourbon or rye"). */
  label?: string;
  amount?: Amount;
  /** A note or a non-measured amount ("aged rum works too", "a splash"). */
  text?: string;
  optional?: boolean;
};
export type SampleRecipe = {
  id: string;
  name: string;
  method: string;
  lines: SampleLine[];
  /** How to make it, in our own words. */
  steps?: string;
  source?: string;
};

const node = (
  id: string,
  name: string,
  kind: SampleNode["kind"],
  parentId: string | null,
  abv = 0,
) => ({ id, name, kind, parentId, abv }) satisfies SampleNode;

export const SAMPLE_NODES: SampleNode[] = [
  node("spirits", "Spirits", "category", null, 40),
  node("gin", "Gin", "type", "spirits", 40),
  node("london-dry-gin", "London dry gin", "type", "gin", 40),
  node("whiskey", "Whiskey", "type", "spirits", 40),
  node("american-whiskey", "American whiskey", "type", "whiskey", 45),
  node("bourbon", "Bourbon", "type", "american-whiskey", 45),
  node("rye", "Rye whiskey", "type", "american-whiskey", 45),
  node("rum", "Rum", "type", "spirits", 40),
  node("white-rum", "White rum", "type", "rum", 40),
  node("tequila", "Tequila", "type", "spirits", 40),
  node("blanco-tequila", "Blanco tequila", "type", "tequila", 40),
  node("vodka", "Vodka", "type", "spirits", 40),
  node("liqueurs", "Liqueurs and aperitifs", "category", null, 25),
  node("bitter-aperitivo", "Bitter aperitivo", "type", "liqueurs", 25),
  node("orange-liqueur", "Orange liqueur", "type", "liqueurs", 40),
  node("maraschino", "Maraschino liqueur", "type", "liqueurs", 32),
  node("sweet-vermouth", "Sweet vermouth", "type", "liqueurs", 16),
  node("dry-vermouth", "Dry vermouth", "type", "liqueurs", 18),
  node("bitters", "Bitters", "category", null, 44.7),
  node("angostura", "Angostura bitters", "type", "bitters", 44.7),
  node("zero-proof", "Zero-proof spirits", "category", null),
  node("zero-proof-gin", "Zero-proof gin", "type", "zero-proof"),
  node("pantry", "Pantry and mixers", "category", null),
  node("lemon-juice", "Lemon juice", "type", "pantry"),
  node("lime-juice", "Lime juice", "type", "pantry"),
  node("grapefruit-juice", "Grapefruit juice", "type", "pantry"),
  node("sugar", "Sugar or simple syrup", "type", "pantry"),
  node("agave-syrup", "Agave syrup", "type", "pantry"),
  node("soda-water", "Soda water", "type", "pantry"),
  node("water", "Water", "type", "pantry"),
  node("ginger-beer", "Ginger beer", "type", "pantry"),
  node("grapefruit-soda", "Grapefruit soda", "type", "pantry"),
  node("mint", "Fresh mint", "type", "pantry"),
];

export const SAMPLE_SUBSTITUTIONS: Substitution[] = [
  { substitute: "rye", replaces: "bourbon" },
  { substitute: "bourbon", replaces: "rye" },
];

/** The demo's chips, in display order. */
export const DEMO_BOTTLES = [
  "london-dry-gin",
  "bourbon",
  "rye",
  "white-rum",
  "blanco-tequila",
  "sweet-vermouth",
  "dry-vermouth",
  "bitter-aperitivo",
  "orange-liqueur",
  "angostura",
  "zero-proof-gin",
  "ginger-beer",
];
/** "Plus the usual": lemons, limes, sugar, soda water. Water is always assumed. */
export const BASICS = ["lemon-juice", "lime-juice", "sugar", "soda-water"];
export const ALWAYS = ["water"];

const ml = (value: number): Amount => ({ value, unit: "ml" });
const l = (
  ingredient: string,
  amount?: Amount,
  extra: Omit<SampleLine, "ingredient" | "amount"> = {},
): SampleLine => (amount ? { ingredient, amount, ...extra } : { ingredient, ...extra });
const TOP: Amount = { value: 1, unit: "top" };

const IBA = "IBA official cocktail";
const dashes = (value: number): Amount => ({ value, unit: "dash" });

// prettier-ignore
export const SAMPLE_RECIPES: SampleRecipe[] = [
  { id: "negroni", name: "Negroni", method: "stirred", source: IBA,
    steps: "Stir over ice, strain onto one big cube, add a slice of orange.",
    lines: [l("gin", ml(30), { label: "London dry gin" }), l("bitter-aperitivo", ml(30)), l("sweet-vermouth", ml(30))] },
  { id: "americano", name: "Americano", method: "built", source: IBA,
    lines: [l("bitter-aperitivo", ml(30)), l("sweet-vermouth", ml(30)), l("soda-water", TOP)] },
  { id: "boulevardier", name: "Boulevardier", method: "stirred", source: IBA,
    lines: [l("bourbon", ml(45)), l("bitter-aperitivo", ml(30)), l("sweet-vermouth", ml(30))] },
  { id: "old-fashioned", name: "Old Fashioned", method: "stirred", source: IBA,
    steps: "Soak the sugar with the bitters and a splash of water, add whiskey and ice, stir, finish with orange peel.",
    lines: [l("american-whiskey", ml(45), { label: "Bourbon or rye" }), l("sugar", { value: 1, unit: "piece" }, { label: "Sugar cube" }),
      l("angostura", dashes(2)), l("water", undefined, { text: "a splash" })] },
  { id: "manhattan", name: "Manhattan", method: "stirred", source: IBA,
    lines: [l("rye", ml(50)), l("sweet-vermouth", ml(20)), l("angostura", dashes(1))] },
  { id: "dry-martini", name: "Dry Martini", method: "stirred", source: IBA,
    lines: [l("gin", ml(60)), l("dry-vermouth", ml(10))] },
  { id: "margarita", name: "Margarita", method: "shaken", source: IBA,
    steps: "Shake hard with ice and strain into a glass with a salted rim.",
    lines: [l("blanco-tequila", ml(50)), l("orange-liqueur", ml(20)), l("lime-juice", ml(15), { label: "Fresh lime juice" })] },
  { id: "tommys-margarita", name: "Tommy's Margarita", method: "shaken", source: IBA,
    lines: [l("blanco-tequila", ml(60)), l("lime-juice", ml(30)), l("agave-syrup", ml(15))] },
  { id: "paloma", name: "Paloma", method: "built", source: IBA,
    lines: [l("blanco-tequila", ml(50)), l("lime-juice", ml(5)), l("grapefruit-soda", TOP)] },
  { id: "daiquiri", name: "Daiquiri", method: "shaken", source: IBA,
    steps: "Shake hard with ice and fine-strain into a chilled coupe.",
    lines: [l("white-rum", ml(60), { text: "aged rum works too" }), l("lime-juice", ml(20), { label: "Fresh lime juice" }),
      l("sugar", ml(15), { label: "Sugar syrup (1:1)" })] },
  { id: "hemingway-daiquiri", name: "Hemingway Daiquiri", method: "shaken", source: IBA,
    lines: [l("white-rum", ml(60)), l("maraschino", ml(15)), l("grapefruit-juice", ml(40)), l("lime-juice", ml(15))] },
  { id: "mojito", name: "Mojito", method: "built", source: IBA,
    lines: [l("white-rum", ml(45)), l("lime-juice", ml(20)), l("sugar", ml(15)), l("mint", { value: 6, unit: "piece" }, { label: "Mint leaves" }), l("soda-water", TOP)] },
  { id: "gimlet", name: "Gimlet", method: "shaken", source: IBA,
    lines: [l("gin", ml(60)), l("lime-juice", ml(15)), l("sugar", ml(15))] },
  { id: "tom-collins", name: "Tom Collins", method: "built", source: IBA,
    lines: [l("gin", ml(45)), l("lemon-juice", ml(30)), l("sugar", ml(15)), l("soda-water", TOP)] },
  { id: "whiskey-sour", name: "Whiskey Sour", method: "shaken", source: IBA,
    lines: [l("bourbon", ml(45)), l("lemon-juice", ml(25)), l("sugar", ml(20))] },
  { id: "gin-buck", name: "Gin Buck", method: "built", source: "Classic",
    lines: [l("gin", ml(45), { label: "London dry gin" }), l("lemon-juice", ml(15)), l("ginger-beer", TOP)] },
  { id: "moscow-mule", name: "Moscow Mule", method: "built", source: IBA,
    lines: [l("vodka", ml(45)), l("lime-juice", ml(10)), l("ginger-beer", TOP)] },
  // House recipes still to be written: amounts stay out until they are.
  { id: "zero-proof-gin-buck", name: "Zero-proof Gin Buck", method: "built", source: "House recipe · [credit]",
    steps: "Build over ice in a tall glass, top with ginger beer, give it one gentle stir.",
    lines: [l("zero-proof-gin"), l("lemon-juice", undefined, { label: "Fresh lemon juice" }), l("ginger-beer", TOP)] },
  { id: "zero-proof-gin-sour", name: "Zero-proof Gin Sour", method: "shaken", source: "House recipe · [credit]",
    lines: [l("zero-proof-gin"), l("lemon-juice"), l("sugar")] },
];

const ABV = new Map(SAMPLE_NODES.map((n) => [n.id, n.abv]));
/** Zero-proof when every line's ingredient is 0% ABV (derived, never typed in). */
export const isZeroProof = (recipe: SampleRecipe) =>
  recipe.lines.every((line) => ABV.get(line.ingredient) === 0);
