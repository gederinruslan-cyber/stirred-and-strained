// Writes the facts-only snapshot of Bar Assistant open data (data/SOURCES.md) from a local
// checkout at the pinned commit. Descriptions, instructions, garnish prose, images and computed
// ABV are dropped here, so they never enter the repository.
//   node packages/db/src/seed/extract.ts <checkout> data/seed/bar-assistant.json
import { execFileSync } from "node:child_process";
import { readdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { PINNED_COMMIT, type Snapshot } from "./snapshot.ts";

const [checkout, out] = process.argv.slice(2);
if (!checkout || !out) throw new Error("usage: extract.ts <bar-assistant checkout> <out.json>");
const commit = execFileSync("git", ["-C", checkout, "rev-parse", "--short=7", "HEAD"])
  .toString()
  .trim();
if (commit !== PINNED_COMMIT)
  throw new Error(`checkout is at ${commit}, pinned is ${PINNED_COMMIT}`);

const read = (kind: string) =>
  readdirSync(join(checkout, "data", kind))
    .sort()
    .map((slug) =>
      JSON.parse(readFileSync(join(checkout, "data", kind, slug, "data.json"), "utf8")),
    );

const snapshot: Snapshot = {
  source: "https://github.com/bar-assistant/data",
  commit,
  ingredients: read("ingredients").map((i) => ({
    id: i._id,
    name: i.name,
    parent: i._parent_id,
    abv: i.strength,
    brand: Boolean(i.distillery),
  })),
  cocktails: read("cocktails").map((c) => ({
    id: c._id,
    name: c.name,
    method: c.method,
    glass: c.glass,
    tags: c.tags,
    source: c.source,
    author: c.author,
    lines: [...c.ingredients]
      .sort((a, b) => a.sort - b.sort)
      .map((l) => ({
        ingredient: l._id,
        amount: l.amount,
        max: l.amount_max,
        units: l.units,
        optional: l.optional,
      })),
  })),
};
writeFileSync(out, JSON.stringify(snapshot, null, 1) + "\n");
console.log(
  `extract: ${snapshot.ingredients.length} ingredients, ${snapshot.cocktails.length} cocktails`,
);
