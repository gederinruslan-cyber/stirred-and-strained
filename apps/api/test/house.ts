// The house library built from the vendored seed, the same rows the import writes: api unit
// tests run on real house data without Postgres.
import { readSeed } from "@stirred/db";
import { createLibrary } from "../src/recipes/library.ts";

const seed = readSeed(new URL("../../../data/seed", import.meta.url).pathname);
export const house = createLibrary(
  seed.nodes,
  seed.substitutions,
  seed.recipes.map((r) => ({ ...r, steps: null })),
);
