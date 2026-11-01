// The export as a file reads it (M2-08): the rows a user owns, with the names of what they point
// at, amounts canonical and unrounded.
import type { UserExport, UserLine, UserSpec } from "@stirred/db";
import type { AccountExport } from "@stirred/schema";
import type { Library } from "../recipes/library.ts";

export function exportFor(lib: Library, data: UserExport, now = new Date()): AccountExport {
  const ingredient = (id: string) => ({ id, name: lib.tax.nodes.get(id)?.name ?? id });
  const line = (l: UserLine) => ({
    ingredient: ingredient(l.ingredient),
    amount: l.value === null || l.unit === null ? null : { value: l.value, unit: l.unit },
    entered: l.entered,
    optional: l.optional,
  });
  const spec = (s: UserSpec) => ({
    name: s.name,
    method: s.method,
    glass: s.glass,
    steps: s.steps,
    lines: s.lines.map(line),
  });
  const own = new Map(data.recipes.map((r) => [r.id, r.name]));
  return {
    format: "stirred-and-strained-export/1",
    exportedAt: now.toISOString(),
    account: data.account,
    sessions: data.sessions,
    bar: data.bar.map((b) => ({ ingredient: ingredient(b.ingredient), addedAt: b.addedAt })),
    swapsTurnedOff: data.swapsOff.map((s) => ({
      substitute: ingredient(s.substitute),
      replaces: ingredient(s.replaces),
      turnedOffAt: s.refusedAt,
    })),
    recipes: data.recipes.map((r) => ({
      id: r.id,
      ...spec(r),
      createdAt: r.createdAt,
      updatedAt: r.updatedAt,
      deletedAt: r.deletedAt,
      history: r.events.map((e) => ({ kind: e.kind, at: e.at, spec: e.spec && spec(e.spec) })),
    })),
    marks: data.marks.map((m) => ({
      recipe: m.own
        ? { id: m.own, name: own.get(m.own) ?? m.own, yours: true }
        : { id: m.house!, name: lib.byId.get(m.house!)?.name ?? m.house!, yours: false },
      favourite: m.favourite,
      rating: m.rating,
      note: m.note,
      noteBefore: m.noteBefore,
      updatedAt: m.updatedAt,
    })),
  };
}
