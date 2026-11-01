// Find a recipe (M1-09): one GET form, filters beside results; works without JavaScript.
// Design: docs/design/search-page.md. The api does the matching; the web only maps typed
// ingredient names to ids and builds links.
import { Chip } from "@stirred/ui";
import type { RecipeList } from "@stirred/schema";
import type { Metadata } from "next";
import Link from "next/link";
import { api } from "../../lib/api.ts";
import { FinderScript } from "./finder-script.tsx";
import "./search.css";

type Search = Record<string, string | string[] | undefined>;
type Props = { searchParams: Promise<Search> };

const PAGE_SIZE = 24;
const FACETS = [
  ["base", "Base spirit"],
  ["method", "Method"],
  ["glass", "Glass"],
  ["family", "Family"],
  ["flavour", "Flavour"],
] as const;
type FacetKey = (typeof FACETS)[number][0];

const many = (v: string | string[] | undefined) =>
  [v ?? []]
    .flat()
    .map((s) => s.trim())
    .filter(Boolean);
const one = (v: string | string[] | undefined) => many(v)[0];
const fold = (s: string) => s.normalize("NFKD").replace(/[̀-ͯ]/g, "").toLowerCase().trim();
const percent = (v: string | undefined) => {
  const n = v === undefined || v === "" ? NaN : Number(v);
  return Number.isFinite(n) ? Math.min(100, Math.max(0, n)) : undefined;
};
const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

export async function generateMetadata({ searchParams }: Props): Promise<Metadata> {
  const q = one((await searchParams).q);
  return { title: `${q ? `“${q}” · ` : ""}Find a recipe · Stirred & Strained` };
}

export default async function FindPage({ searchParams }: Props) {
  const sp = await searchParams;
  const { data: ingredientList } = await api.GET("/ingredients");
  if (!ingredientList) throw new Error("the api did not answer /ingredients");
  const byId = new Map(ingredientList.items.map((i) => [i.id, i]));
  const byName = new Map(ingredientList.items.map((i) => [fold(i.name), i]));

  // Chips carry ids; typed fields carry names. Unknown text is shown back as an error.
  const resolve = (values: string[]) => {
    const ids: string[] = [];
    const unknown: string[] = [];
    for (const v of values) {
      const hit = byId.get(v) ?? byName.get(fold(v));
      if (hit) {
        if (!ids.includes(hit.id)) ids.push(hit.id);
      } else unknown.push(v);
    }
    return { ids, unknown };
  };
  const include = resolve(many(sp.include));
  const exclude = resolve(many(sp.exclude));

  const q = one(sp.q);
  let abvMin = percent(one(sp.abvMin));
  let abvMax = percent(one(sp.abvMax));
  if (abvMin !== undefined && abvMax !== undefined && abvMin > abvMax)
    [abvMin, abvMax] = [abvMax, abvMin];
  const chosen: Record<FacetKey, string[]> = {
    base: many(sp.base),
    method: many(sp.method),
    glass: many(sp.glass),
    family: many(sp.family),
    flavour: many(sp.flavour),
  };
  const page = Math.max(1, Math.floor(Number(one(sp.page) ?? 1)) || 1);

  const { data, response } = await api.GET("/recipes", {
    params: {
      query: {
        page,
        pageSize: PAGE_SIZE,
        ...(q ? { q } : {}),
        include: include.ids,
        exclude: exclude.ids,
        ...chosen,
        ...(abvMin === undefined ? {} : { abvMin }),
        ...(abvMax === undefined ? {} : { abvMax }),
      },
    },
  });
  if (!data) throw new Error(`the api did not answer /recipes (${response.status})`);

  // The current search as query pairs, to build "drop one filter" and paging links.
  const pairs: [string, string][] = [
    ...(q ? [["q", q] as [string, string]] : []),
    ...include.ids.map((id) => ["include", id] as [string, string]),
    ...exclude.ids.map((id) => ["exclude", id] as [string, string]),
    ...FACETS.flatMap(([key]) => chosen[key].map((v) => [key, v] as [string, string])),
    ...(abvMin === undefined ? [] : [["abvMin", String(abvMin)] as [string, string]]),
    ...(abvMax === undefined ? [] : [["abvMax", String(abvMax)] as [string, string]]),
  ];
  const href = (keep: (p: [string, string]) => boolean, extra: [string, string][] = []) => {
    const query = new URLSearchParams([...pairs.filter(keep), ...extra]).toString();
    return query ? `/recipes?${query}` : "/recipes";
  };
  const active = pairs.filter(([k]) => k !== "q").length;
  const pages = Math.max(1, Math.ceil(data.total / PAGE_SIZE));
  const label = (key: FacetKey, value: string) =>
    data.facets[key].find((f) => f.value === value)?.label ?? value;

  return (
    <div className="container section">
      <form
        role="search"
        aria-label="Recipe search"
        method="get"
        action="/recipes"
        className="finder"
      >
        <div className="finder__bar">
          <h1 className="h2">Find a recipe</h1>
          <div className="finder__search">
            <label className="search finder__q">
              <span className="vh">Recipe name</span>
              <input
                id="q"
                type="search"
                name="q"
                defaultValue={q}
                placeholder="Negroni, daiquiri…"
                aria-keyshortcuts="/"
              />
            </label>
            <button type="submit" className="btn btn--primary">
              Search
            </button>
          </div>
          <FinderScript />
        </div>

        <div className="finder__body">
          <details className="filters" open>
            <summary className="btn btn--secondary">
              {active > 0 ? `Filters (${active} on)` : "Filters"}
            </summary>
            <div className="filters__head">
              <h2 className="filters__title">Filters</h2>
              {active > 0 && (
                <Link href={q ? `/recipes?q=${encodeURIComponent(q)}` : "/recipes"}>Clear all</Link>
              )}
            </div>

            <fieldset className="facet">
              <legend>Ingredients</legend>
              <p id="ing-help" className="recipe__small muted">
                Pick a bottle or a kind, like whiskey; everything under it counts.
              </p>
              <datalist id="ingredient-names">
                {ingredientList.items.map((i) => (
                  <option key={i.id} value={i.name} />
                ))}
              </datalist>
              {(
                [
                  ["include", "With", "e.g. whiskey", include],
                  ["exclude", "Without", "e.g. Campari", exclude],
                ] as const
              ).map(([name, text, hint, picked]) => (
                <div key={name} className="facet__ingredients">
                  <label className="field">
                    <span>{text}</span>
                    <input
                      type="text"
                      name={name}
                      list="ingredient-names"
                      placeholder={hint}
                      aria-describedby={
                        picked.unknown.length > 0 ? `ing-help ${name}-error` : "ing-help"
                      }
                      {...(picked.unknown.length > 0 ? { "aria-invalid": true } : {})}
                    />
                  </label>
                  {picked.unknown.length > 0 && (
                    <p id={`${name}-error`} className="field__error">
                      We don&apos;t have “{picked.unknown.join(", ")}” in the bar yet. Pick a name
                      from the list.
                    </p>
                  )}
                  {picked.ids.length > 0 && (
                    <div className="facet__chips">
                      {picked.ids.map((id) => (
                        <Chip key={id} name={name} value={id} defaultChecked>
                          {byId.get(id)!.name}
                        </Chip>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </fieldset>

            {FACETS.map(([key, legend], i) => (
              <div key={key}>
                {i === 1 && (
                  <fieldset className="facet">
                    <legend>Strength (% ABV)</legend>
                    <div className="facet__range">
                      {(
                        [
                          ["abvMin", "From", abvMin],
                          ["abvMax", "To", abvMax],
                        ] as const
                      ).map(([name, text, value]) => (
                        <label key={name} className="field field--number">
                          <span>{text}</span>
                          <span className="field__suffix">
                            <input
                              type="number"
                              name={name}
                              min="0"
                              max="100"
                              step="0.5"
                              inputMode="decimal"
                              defaultValue={value}
                            />
                            <span aria-hidden="true">%</span>
                          </span>
                        </label>
                      ))}
                    </div>
                  </fieldset>
                )}
                <Facet
                  name={key}
                  legend={legend}
                  values={data.facets[key]}
                  checked={chosen[key]}
                  display={key === "method" ? cap : (s) => s}
                />
              </div>
            ))}

            <button type="submit" className="btn btn--primary filters__apply">
              Apply
            </button>
          </details>

          <section aria-labelledby="results-h" className="finder__results">
            <Results
              data={data}
              q={q}
              page={page}
              pages={pages}
              href={href}
              loosen={[
                ...exclude.ids.map((id) => ({
                  text: `Allow ${byId.get(id)!.name}`,
                  href: href(([k, v]) => !(k === "exclude" && v === id)),
                })),
                ...include.ids.map((id) => ({
                  text: `Drop ${byId.get(id)!.name}`,
                  href: href(([k, v]) => !(k === "include" && v === id)),
                })),
                ...FACETS.flatMap(([key]) =>
                  chosen[key].map((v) => ({
                    text: `Drop ${key === "method" ? cap(v) : label(key, v)}`,
                    href: href(([k, x]) => !(k === key && x === v)),
                  })),
                ),
                ...(abvMin !== undefined || abvMax !== undefined
                  ? [
                      {
                        text: "Any strength",
                        href: href(([k]) => k !== "abvMin" && k !== "abvMax"),
                      },
                    ]
                  : []),
                ...(q
                  ? [{ text: `All names, not just “${q}”`, href: href(([k]) => k !== "q") }]
                  : []),
              ]}
            />
          </section>
        </div>
      </form>
    </div>
  );
}

function Facet({
  name,
  legend,
  values,
  checked,
  display,
}: {
  name: string;
  legend: string;
  values: RecipeList["facets"]["base"];
  checked: string[];
  display: (label: string) => string;
}) {
  // Checked values stay visible even when the results no longer contain them.
  const shown = [
    ...values,
    ...checked
      .filter((c) => !values.some((v) => v.value === c))
      .map((c) => ({ value: c, label: c, count: 0 })),
  ];
  if (shown.length < 2 && checked.length === 0) return null;
  const chip = (v: (typeof shown)[number]) => (
    <Chip key={v.value} name={name} value={v.value} defaultChecked={checked.includes(v.value)}>
      {display(v.label)}{" "}
      <span className="chip__count">
        {v.count}
        <span className="vh"> recipes</span>
      </span>
    </Chip>
  );
  const top = shown.slice(0, 8);
  const rest = shown.slice(8);
  return (
    <fieldset className="facet">
      <legend>{legend}</legend>
      <div className="facet__chips">{top.map(chip)}</div>
      {rest.length > 0 && (
        <details
          className="facet__more"
          open={rest.some((v) => checked.includes(v.value)) || undefined}
        >
          <summary>{rest.length} more</summary>
          <div className="facet__chips">{rest.map(chip)}</div>
        </details>
      )}
    </fieldset>
  );
}

function Results({
  data,
  q,
  page,
  pages,
  href,
  loosen,
}: {
  data: RecipeList;
  q: string | undefined;
  page: number;
  pages: number;
  href: (keep: (p: [string, string]) => boolean, extra?: [string, string][]) => string;
  loosen: { text: string; href: string }[];
}) {
  const n = data.total;
  const noun = n === 1 ? "recipe" : "recipes";
  const from = (page - 1) * data.pageSize + 1;
  const to = from + data.items.length - 1;
  const sentence = `${n} ${noun}${q ? ` for “${q}”` : ""}`;
  return (
    <>
      <h2 id="results-h" className="finder__count">
        {sentence}
        {pages > 1 && n > 0 && (
          <span className="muted">
            {" "}
            · {from}–{to} shown
          </span>
        )}
      </h2>
      <p className="vh" role="status">
        {sentence}
      </p>
      {n === 0 ? (
        <div className="finder__empty sticky sticky--white">
          <p className="finder__empty-title">Nothing matches all of that.</p>
          {loosen.length > 0 && <p>Try loosening one thing:</p>}
          <ul>
            {loosen.map((l) => (
              <li key={l.href + l.text}>
                <Link href={l.href}>{l.text}</Link>
              </li>
            ))}
            <li>
              <Link href="/recipes">Clear all filters</Link>
            </li>
          </ul>
        </div>
      ) : (
        <ol className="results">
          {data.items.map((r) => (
            <li key={r.id} className="result">
              <div>
                <Link href={`/recipes/${r.id}`} className="result__name">
                  {r.name}
                </Link>
                <p className="result__meta">
                  {[r.method, r.glass, r.family?.toLowerCase() === r.glass ? undefined : r.family]
                    .filter(Boolean)
                    .join(" · ")}
                </p>
              </div>
              <span className="result__abv">{r.abv.toFixed(1)}% ABV</span>
            </li>
          ))}
        </ol>
      )}
      {pages > 1 && n > 0 && (
        <nav className="pager" aria-label="Pages">
          {page > 1 && (
            <Link href={href(() => true, [["page", String(page - 1)]])}>← Previous</Link>
          )}
          <span>
            Page {page} of {pages}
          </span>
          {page < pages && (
            <Link href={href(() => true, [["page", String(page + 1)]])}>Next →</Link>
          )}
        </nav>
      )}
    </>
  );
}
