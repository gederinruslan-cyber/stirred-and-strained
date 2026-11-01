// A small sample library that runs the landing page on the real engine until the house
// library exists (M1-07 replaces it). Classic specs follow the IBA list and are to be checked
// against it before launch; amounts are canonical (ml or counted units).
import type { IngredientNode, Substitution } from "@stirred/engine";

type Amount = { value: number; unit: "ml" | "dash" | "barspoon" | "piece" | "top" };
export type SampleNode = IngredientNode & { abv: number };
export type SampleLine = { ingredient: string; amount?: Amount; text?: string; optional?: boolean };
export type SampleRecipe = { id: string; name: string; method: string; lines: SampleLine[] };

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

export const SAMPLE_RECIPES: SampleRecipe[] = [
  {
    id: "negroni",
    name: "Negroni",
    method: "stirred",
    lines: [l("gin", ml(30)), l("bitter-aperitivo", ml(30)), l("sweet-vermouth", ml(30))],
  },
  {
    id: "americano",
    name: "Americano",
    method: "built",
    lines: [l("bitter-aperitivo", ml(30)), l("sweet-vermouth", ml(30)), l("soda-water", TOP)],
  },
  {
    id: "boulevardier",
    name: "Boulevardier",
    method: "stirred",
    lines: [l("bourbon", ml(45)), l("bitter-aperitivo", ml(30)), l("sweet-vermouth", ml(30))],
  },
  {
    id: "old-fashioned",
    name: "Old Fashioned",
    method: "stirred",
    lines: [
      l("american-whiskey", ml(45)),
      l("sugar", { value: 1, unit: "piece" }),
      l("angostura", { value: 2, unit: "dash" }),
      l("water", undefined, { text: "a splash" }),
    ],
  },
  {
    id: "manhattan",
    name: "Manhattan",
    method: "stirred",
    lines: [
      l("rye", ml(50)),
      l("sweet-vermouth", ml(20)),
      l("angostura", { value: 1, unit: "dash" }),
    ],
  },
  {
    id: "dry-martini",
    name: "Dry Martini",
    method: "stirred",
    lines: [l("gin", ml(60)), l("dry-vermouth", ml(10))],
  },
  {
    id: "margarita",
    name: "Margarita",
    method: "shaken",
    lines: [l("blanco-tequila", ml(50)), l("orange-liqueur", ml(20)), l("lime-juice", ml(15))],
  },
  {
    id: "tommys-margarita",
    name: "Tommy's Margarita",
    method: "shaken",
    lines: [l("blanco-tequila", ml(60)), l("lime-juice", ml(30)), l("agave-syrup", ml(15))],
  },
  {
    id: "paloma",
    name: "Paloma",
    method: "built",
    lines: [l("blanco-tequila", ml(50)), l("lime-juice", ml(5)), l("grapefruit-soda", TOP)],
  },
  {
    id: "daiquiri",
    name: "Daiquiri",
    method: "shaken",
    lines: [l("white-rum", ml(60)), l("lime-juice", ml(20)), l("sugar", ml(15))],
  },
  {
    id: "hemingway-daiquiri",
    name: "Hemingway Daiquiri",
    method: "shaken",
    lines: [
      l("white-rum", ml(60)),
      l("maraschino", ml(15)),
      l("grapefruit-juice", ml(40)),
      l("lime-juice", ml(15)),
    ],
  },
  {
    id: "mojito",
    name: "Mojito",
    method: "built",
    lines: [
      l("white-rum", ml(45)),
      l("lime-juice", ml(20)),
      l("sugar", ml(15)),
      l("mint", { value: 6, unit: "piece" }),
      l("soda-water", TOP),
    ],
  },
  {
    id: "gimlet",
    name: "Gimlet",
    method: "shaken",
    lines: [l("gin", ml(60)), l("lime-juice", ml(15)), l("sugar", ml(15))],
  },
  {
    id: "tom-collins",
    name: "Tom Collins",
    method: "built",
    lines: [l("gin", ml(45)), l("lemon-juice", ml(30)), l("sugar", ml(15)), l("soda-water", TOP)],
  },
  {
    id: "whiskey-sour",
    name: "Whiskey Sour",
    method: "shaken",
    lines: [l("bourbon", ml(45)), l("lemon-juice", ml(25)), l("sugar", ml(20))],
  },
  {
    id: "gin-buck",
    name: "Gin Buck",
    method: "built",
    lines: [l("gin", ml(45)), l("lime-juice", ml(10)), l("ginger-beer", TOP)],
  },
  {
    id: "moscow-mule",
    name: "Moscow Mule",
    method: "built",
    lines: [l("vodka", ml(45)), l("lime-juice", ml(10)), l("ginger-beer", TOP)],
  },
  // House recipes still to be written: amounts stay out until they are.
  {
    id: "zero-proof-gin-buck",
    name: "Zero-proof Gin Buck",
    method: "built",
    lines: [l("zero-proof-gin"), l("lime-juice"), l("ginger-beer", TOP)],
  },
  {
    id: "zero-proof-gin-sour",
    name: "Zero-proof Gin Sour",
    method: "shaken",
    lines: [l("zero-proof-gin"), l("lemon-juice"), l("sugar")],
  },
];
