// The export as a page to read or print (M2-08). Amounts read in the unit the user typed, rounded
// once by packages/units; the user's own text is escaped so it reads as typed.
import type { AccountExport } from "@stirred/schema";
import { formatQuantity, quantity, type DisplayUnit } from "@stirred/units";
import { glassName } from "../recipes/steps.ts";

type Spec = AccountExport["recipes"][number]["history"][number]["spec"] & {};
type Line = Spec["lines"][number];

const esc = (text: string) => text.replace(/[\\`*_[\]<>#|]/g, "\\$&");
const day = (iso: string) => iso.slice(0, 10);
const time = (iso: string) => `${iso.slice(0, 10)} ${iso.slice(11, 16)} UTC`;
const count = (items: unknown[]) => `(${items.length})`;
const quote = (text: string) =>
  text
    .split("\n")
    .map((l) => `> ${esc(l)}`)
    .join("\n");

function amount(l: Line): string {
  if (!l.amount) return "";
  const shown: DisplayUnit =
    l.entered === "cl" || l.entered === "oz" || l.entered === "ml" ? l.entered : "ml";
  return `${formatQuantity(quantity(l.amount.value, l.amount.unit), shown)} `;
}
const lineText = (l: Line) =>
  `${amount(l)}${esc(l.ingredient.name)}${l.optional ? " (optional)" : ""}`;

function recipe(r: AccountExport["recipes"][number]): string[] {
  const out = [`### ${esc(r.name)}${r.deletedAt ? ` (deleted ${day(r.deletedAt)})` : ""}`, ""];
  out.push([r.method, r.glass && glassName(r.glass)].filter(Boolean).join(" · "), "");
  out.push(...r.lines.map((l) => `- ${lineText(l)}`), "");
  const steps = r.steps?.split("\n").filter(Boolean) ?? [];
  out.push(
    ...(steps.length > 0
      ? steps.map((s, i) => `${i + 1}. ${esc(s)}`)
      : ["Steps written from the method."]),
    "",
  );
  out.push("History:", "");
  for (const h of r.history) {
    const spec = h.spec ? `: ${esc(h.spec.name)}, ${h.spec.lines.map(lineText).join(", ")}` : "";
    out.push(`- ${time(h.at)}, ${h.kind}${spec}`);
  }
  return [...out, ""];
}

function mark(m: AccountExport["marks"][number]): string[] {
  const out = [`### ${esc(m.recipe.name)}${m.recipe.yours ? " (yours)" : ""}`, ""];
  const facts = [m.favourite && "Favourite", m.rating !== null && `Rated ${m.rating}/5`];
  if (facts.some(Boolean)) out.push(facts.filter(Boolean).join(" · "), "");
  if (m.note !== null) out.push(quote(m.note), "");
  if (m.noteBefore !== null) out.push("Earlier note, kept for undo:", "", quote(m.noteBefore), "");
  return out;
}

export function markdown(data: AccountExport): string {
  const section = (title: string, items: unknown[], empty: string, body: string[]) => [
    `## ${title} ${count(items)}`,
    "",
    ...(items.length > 0 ? body : [empty, ""]),
  ];
  const list = (lines: string[]) => [...lines, ""];
  return [
    "# Your Stirred & Strained data",
    "",
    `Exported ${time(data.exportedAt)} for ${esc(data.account.email)}, ` +
      `with us since ${day(data.account.createdAt)}. The JSON export holds the same, for another app.`,
    "",
    ...section(
      "Your bar",
      data.bar,
      "Nothing on your bar.",
      list(data.bar.map((b) => `- ${esc(b.ingredient.name)}`)),
    ),
    ...section(
      "Swaps you turned off",
      data.swapsTurnedOff,
      "None: every swap counts.",
      list(
        data.swapsTurnedOff.map((s) => `- ${esc(s.substitute.name)} for ${esc(s.replaces.name)}`),
      ),
    ),
    ...section(
      "Your recipes",
      data.recipes,
      "No recipes of your own.",
      data.recipes.flatMap(recipe),
    ),
    ...section(
      "Favourites, ratings and notes",
      data.marks,
      "No favourites, ratings or notes.",
      data.marks.flatMap(mark),
    ),
    ...section(
      "Signed in",
      data.sessions,
      "Not signed in anywhere.",
      list(data.sessions.map((s) => `- Since ${day(s.createdAt)}, until ${day(s.expiresAt)}`)),
    ),
  ]
    .join("\n")
    .replace(/\n+$/, "\n");
}
