// Ingredients as the pickers show them: with their kind and path, and the My Bar suggestions
// (M2-03): the name itself, then names that start with or contain the words, then anything that
// sits under one of those (Blended Scotch Whisky under Scotch whiskey, for "whiskey").
import type { IngredientEntry } from "@stirred/schema";
import { words, type Library } from "./recipes/library.ts";

const LIMIT = 20;

export function entry(lib: Library, id: string): IngredientEntry {
  const node = lib.tax.nodes.get(id)!;
  const path: string[] = [];
  for (let at = node.parentId; at !== null; at = lib.tax.nodes.get(at)?.parentId ?? null) {
    path.unshift(lib.tax.nodes.get(at)!.name);
  }
  return { id, name: node.name, kind: node.kind, path };
}

/** 0 the name, 1 starts with it, 2 a word starts with it, 3 contains it; null no match. */
function rank(name: string, q: string): number | null {
  const n = words(name);
  const t = q.trim();
  if (n === q) return 0;
  if (n.startsWith(` ${t}`)) return 1;
  if (n.includes(` ${t}`)) return 2;
  if (n.includes(t)) return 3;
  return null;
}

export function suggest(lib: Library, text: string): IngredientEntry[] {
  const q = words(text);
  if (q.trim() === "") return [];
  const named = new Map<string, number>();
  for (const node of lib.tax.nodes.values()) {
    const r = rank(node.name, q);
    if (r !== null) named.set(node.id, r);
  }
  const ranked = [...lib.tax.nodes.values()].flatMap((node) => {
    if (named.has(node.id)) return [{ node, r: named.get(node.id)! }];
    for (let at = node.parentId; at !== null; at = lib.tax.nodes.get(at)?.parentId ?? null) {
      if (named.has(at)) return [{ node, r: 4 }];
    }
    return [];
  });
  return ranked
    .sort((a, b) => a.r - b.r || a.node.name.localeCompare(b.node.name))
    .slice(0, LIMIT)
    .map(({ node }) => entry(lib, node.id));
}
