// The fixture taxonomy every engine test uses (never seed data).
import type { IngredientNode, Substitution } from "../../src/index.ts";

const n = (id: string, name: string, kind: IngredientNode["kind"], parentId: string | null) =>
  ({ id, name, kind, parentId }) satisfies IngredientNode;

export const NODES: IngredientNode[] = [
  n("spirits", "Spirits", "category", null),
  n("whiskey", "Whiskey", "type", "spirits"),
  n("american-whiskey", "American whiskey", "type", "whiskey"),
  n("bourbon", "Bourbon", "type", "american-whiskey"),
  n("buffalo-trace", "Buffalo Trace", "brand", "bourbon"),
  n("rye", "Rye whiskey", "type", "american-whiskey"),
  n("rittenhouse", "Rittenhouse", "brand", "rye"),
  n("scotch", "Scotch whisky", "type", "whiskey"),
  n("gin", "Gin", "type", "spirits"),
  n("tanqueray", "Tanqueray", "brand", "gin"),
  n("aperitifs", "Aperitifs", "category", null),
  n("bitter-aperitivo", "Bitter aperitivo", "type", "aperitifs"),
  n("campari", "Campari", "brand", "bitter-aperitivo"),
  n("contratto", "Contratto Bitter", "brand", "bitter-aperitivo"),
  n("sweet-vermouth", "Sweet vermouth", "type", "aperitifs"),
  n("pantry", "Pantry", "category", null),
  n("lemon-juice", "Lemon juice", "type", "pantry"),
  n("lime-juice", "Lime juice", "type", "pantry"),
  n("sugar", "Sugar", "type", "pantry"),
  n("soda-water", "Soda water", "type", "pantry"),
];

// Rye can stand in for bourbon (not the reverse); scotch for rye (never chained to bourbon).
export const SUBSTITUTIONS: Substitution[] = [
  { substitute: "rye", replaces: "bourbon" },
  { substitute: "scotch", replaces: "rye" },
];

const line = (ingredient: string, extra: { exact?: boolean; optional?: boolean } = {}) => ({
  ingredient,
  ...extra,
});

export const RECIPES = [
  {
    id: "negroni",
    name: "Negroni",
    lines: [line("gin"), line("bitter-aperitivo"), line("sweet-vermouth")],
  },
  {
    id: "boulevardier",
    name: "Boulevardier",
    lines: [line("bourbon"), line("bitter-aperitivo"), line("sweet-vermouth")],
  },
  { id: "manhattan", name: "Manhattan", lines: [line("rye"), line("sweet-vermouth")] },
  {
    id: "whiskey-sour",
    name: "Whiskey Sour",
    lines: [line("whiskey"), line("lemon-juice"), line("sugar")],
  },
  {
    id: "campari-soda",
    name: "Campari Soda",
    lines: [line("campari", { exact: true }), line("soda-water")],
  },
  {
    id: "gin-rickey",
    name: "Gin Rickey",
    lines: [line("gin"), line("lime-juice"), line("soda-water"), line("sugar", { optional: true })],
  },
  { id: "gin-sour", name: "Gin Sour", lines: [line("gin"), line("lemon-juice"), line("sugar")] },
  {
    id: "bourbon-highball",
    name: "Bourbon Highball",
    lines: [line("bourbon"), line("soda-water")],
  },
];
