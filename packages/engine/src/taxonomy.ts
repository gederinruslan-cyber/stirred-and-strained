/** category > type > brand; a type may sit under another type (bourbon under american whiskey). */
export type IngredientNode = {
  readonly id: string;
  readonly name: string;
  readonly kind: "category" | "type" | "brand";
  readonly parentId: string | null;
};

/** One-way: `substitute` (or anything under it) can stand in for `replaces`. Edges never chain. */
export type Substitution = { readonly substitute: string; readonly replaces: string };

export type Taxonomy = {
  readonly nodes: ReadonlyMap<string, IngredientNode>;
  /** requirement id → the substitutes that can stand in for it */
  readonly substitutesFor: ReadonlyMap<string, readonly string[]>;
};

/** Indexes and checks a taxonomy: unknown parents, duplicate ids, cycles and dangling edges throw. */
export function createTaxonomy(
  nodes: readonly IngredientNode[],
  substitutions: readonly Substitution[],
): Taxonomy {
  const byId = new Map<string, IngredientNode>();
  for (const node of nodes) {
    if (byId.has(node.id)) throw new Error(`duplicate ingredient id "${node.id}"`);
    byId.set(node.id, node);
  }
  for (const node of nodes) {
    const seen = new Set<string>();
    for (let at: IngredientNode | undefined = node; at?.parentId != null;) {
      if (seen.has(at.id)) throw new Error(`ingredient "${node.id}" is in a parent cycle`);
      seen.add(at.id);
      at = byId.get(at.parentId);
      if (!at) throw new Error(`ingredient "${node.id}" has an unknown ancestor`);
    }
  }
  const substitutesFor = new Map<string, string[]>();
  for (const { substitute, replaces } of substitutions) {
    if (!byId.has(substitute) || !byId.has(replaces)) {
      throw new Error(`substitution ${substitute} → ${replaces} names an unknown ingredient`);
    }
    substitutesFor.set(replaces, [...(substitutesFor.get(replaces) ?? []), substitute]);
  }
  return { nodes: byId, substitutesFor };
}

/** The same taxonomy without the refused edges (a user's "don't swap these"). */
export function refuse(tax: Taxonomy, refused: readonly Substitution[]): Taxonomy {
  const substitutesFor = new Map<string, string[]>();
  for (const [replaces, subs] of tax.substitutesFor) {
    const kept = subs.filter(
      (s) => !refused.some((r) => r.substitute === s && r.replaces === replaces),
    );
    if (kept.length > 0) substitutesFor.set(replaces, kept);
  }
  return { nodes: tax.nodes, substitutesFor };
}

/** True when `id` is `ancestor` or sits anywhere under it. */
export function isWithin(tax: Taxonomy, id: string, ancestor: string): boolean {
  for (let at: string | null = id; at !== null; at = tax.nodes.get(at)?.parentId ?? null) {
    if (at === ancestor) return true;
  }
  return false;
}
