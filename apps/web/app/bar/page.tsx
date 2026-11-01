// My Bar (M2-03, docs/design/my-bar.md): what's on your shelf, added by name or a category at a
// time, kept in the account or (signed out) on this device. What it makes (M2-04) sits beside it.
import type { IngredientEntry } from "@stirred/schema";
import type { Metadata } from "next";
import Link from "next/link";
import { Fragment } from "react";
import { api } from "../../lib/api.ts";
import { allIngredients, barMatches, currentBar } from "../../lib/bar.ts";
import "../recipes/search.css";
import { addByName, addTicked, removeItem } from "./actions.ts";
import "./bar.css";
import { Matches } from "./matches.tsx";

export const metadata: Metadata = { title: "My Bar · Stirred & Strained" };

type Search = Record<string, string | string[] | undefined>;
const many = (v: string | string[] | undefined) => [v ?? []].flat();
const one = (v: string | string[] | undefined) => many(v)[0];
const SUGGESTIONS = 8;

/** "Gin", "Gin and Rum", "Gin, Rum and Tequila". */
const listed = (names: string[]) =>
  names.length < 2 ? (names[0] ?? "") : `${names.slice(0, -1).join(", ")} and ${names.at(-1)}`;

function Path({ path, id }: { path: string[]; id?: string }) {
  return (
    <span className="path" id={id}>
      {path.map((p, i) => (
        <Fragment key={i}>
          {i > 0 && (
            <>
              <span aria-hidden="true"> › </span>
              <span className="vh">, </span>
            </>
          )}
          {p}
        </Fragment>
      ))}
    </span>
  );
}

/** What the last post did, in one sentence (the query carries ids; names come from the list). */
function statusText(sp: Search, nameOf: (id: string) => string): string | null {
  const added = many(sp.added).map(nameOf);
  const already = many(sp.already).map(nameOf);
  const removed = one(sp.removed);
  const gone = one(sp.gone);
  if (removed) return `${nameOf(removed)} removed.`;
  if (gone) return `${nameOf(gone)} wasn't on your bar any more.`;
  if (added.length === 0 && already.length === 0) return null;
  if (added.length === 0)
    return already.length === 1
      ? `${already[0]} was already on your bar.`
      : `${listed(already)} were already on your bar.`;
  const head =
    added.length === 1
      ? `Added ${added[0]}.`
      : added.length <= 5
        ? `Added ${added.length}: ${listed(added)}.`
        : `Added ${added.length} to your bar.`;
  const tail =
    already.length === 0
      ? ""
      : ` ${listed(already)} ${already.length === 1 ? "was" : "were"} already there.`;
  return head + tail;
}

type Node = { item: IngredientEntry; children: Node[] };

/** Everything under each category, as a tree (names are unique, so a path names its parent). */
function categoryTrees(items: IngredientEntry[]) {
  const key = (path: string[]) => path.join("›");
  const nodes = new Map(
    items.map((i) => [key([...i.path, i.name]), { item: i, children: [] } as Node]),
  );
  for (const node of nodes.values()) {
    if (node.item.path.length > 0) nodes.get(key(node.item.path))?.children.push(node);
  }
  const byName = (a: Node, b: Node) => a.item.name.localeCompare(b.item.name);
  for (const node of nodes.values()) node.children.sort(byName);
  return [...nodes.values()].filter((n) => n.item.kind === "category").sort(byName);
}

const count = (node: Node): number => node.children.reduce((n, c) => n + 1 + count(c), 0);

function CheckTree({ nodes, kept }: { nodes: Node[]; kept: Set<string> }) {
  return (
    <ul className="check-tree">
      {nodes.map(({ item, children }) => (
        <li key={item.id}>
          <label className="check">
            <input type="checkbox" name="ingredients" value={item.id} />
            {item.name}
            {kept.has(item.id) && (
              <span className="check__kept">
                <span aria-hidden="true">✓</span> on your bar
              </span>
            )}
          </label>
          {children.length > 0 && <CheckTree nodes={children} kept={kept} />}
        </li>
      ))}
    </ul>
  );
}

export default async function BarPage({ searchParams }: { searchParams: Promise<Search> }) {
  const sp = await searchParams;
  const [list, bar] = await Promise.all([allIngredients(), currentBar()]);
  const byId = new Map(list.map((i) => [i.id, i]));
  const nameOf = (id: string) => byId.get(id)?.name ?? id;
  const items = bar === "down" ? [] : bar.ids.flatMap((id) => byId.get(id) ?? []);
  const kept = new Set(items.map((i) => i.id));
  const signedIn = bar !== "down" && bar.signedIn;
  const matches = bar === "down" ? "down" : await barMatches(bar);
  const makes =
    matches === "down"
      ? ""
      : matches.makeNow.length === 0
        ? " Nothing you can make yet."
        : ` You can make ${matches.makeNow.length} now.`;

  const said = statusText(sp, nameOf);
  const status = said && said + makes;
  const error = one(sp.error);
  const typed = one(sp.name);
  const suggestions = typed
    ? ((await api.GET("/ingredients", { params: { query: { q: typed } } })).data?.items ?? [])
    : [];
  const addError =
    error === "empty"
      ? "Type a name first."
      : typed
        ? suggestions.length > 0
          ? `No exact match for “${typed}”. Did you mean one of these?`
          : `We don't have “${typed}” in the bar yet. Try a shorter word, like “whiskey”, or open a category below.`
        : null;

  const groups = new Map<string, IngredientEntry[]>();
  for (const i of [...items].sort((a, b) => a.name.localeCompare(b.name))) {
    const cat = i.path[0] ?? i.name;
    groups.set(cat, [...(groups.get(cat) ?? []), i]);
  }
  const trees = categoryTrees(list);

  return (
    <div className="container section">
      <div className="bar-page__head">
        <p className="hand bar-page__aside" aria-hidden="true">
          your shelf, written down
        </p>
        <h1 className="h2 bar-page__title">My Bar</h1>
        <p className="bar-page__lead">
          Add what you&apos;ve got. Type a name, or open a category and tick a few.
        </p>
        {items.length > 0 && (
          <a href="#results" className="bar-page__jump">
            See what you can make ↓
          </a>
        )}
      </div>
      <div className="bar-page">
        <div className="bar-page__shelf">
          {bar !== "down" && !signedIn && (
            <div className="bar-note sticky sticky--yellow">
              <p>
                You&apos;re not signed in, so this bar lives on this device for 30 days after your
                last change. <Link href="/sign-up?back=/bar">Create an account</Link> to keep it, or{" "}
                <Link href="/sign-in?back=/bar">sign in</Link>; either way it moves into your
                account.
              </p>
            </div>
          )}
          {status && (
            <p className="bar-status" role="status" tabIndex={-1} autoFocus>
              {status}
            </p>
          )}
          {error === "down" && (
            <div className="form-error" role="alert" tabIndex={-1} autoFocus>
              Something went wrong on our side. Nothing changed. Try again in a minute.
            </div>
          )}

          <section aria-labelledby="add-h" className="bar-section">
            <h2 id="add-h" className="bar-h2">
              Add to your bar
            </h2>
            <form action={addByName} className="bar-add" noValidate>
              <div className="bar-add__row">
                <label className="field bar-add__field">
                  <span>Bottle or ingredient</span>
                  <input
                    type="text"
                    name="name"
                    list="bar-names"
                    autoComplete="off"
                    placeholder="Bourbon, Campari, limes…"
                    defaultValue={typed}
                    autoFocus={addError !== null}
                    aria-describedby={addError ? "add-help add-error" : "add-help"}
                    {...(addError ? { "aria-invalid": true } : {})}
                  />
                </label>
                <button type="submit" className="btn btn--primary">
                  Add
                </button>
              </div>
              <p id="add-help" className="field__help">
                Know the exact bottle? Add that. A kind like “Whiskey” only counts where a recipe
                asks for any whiskey.
              </p>
              <datalist id="bar-names">
                {list.map((i) => (
                  <option key={i.id} value={i.name} label={[...i.path, i.name].join(" › ")} />
                ))}
              </datalist>
              {addError && (
                <p id="add-error" className="field__error">
                  {addError}
                </p>
              )}
              {suggestions.length > 0 && (
                <ul className="suggest">
                  {suggestions.slice(0, SUGGESTIONS).map((s) => (
                    <li key={s.id}>
                      <button
                        type="submit"
                        name="pick"
                        value={s.id}
                        className="btn btn--secondary"
                        aria-describedby={`s-${s.id}`}
                      >
                        Add {s.name}
                      </button>
                      <Path path={[...s.path, s.name]} id={`s-${s.id}`} />
                    </li>
                  ))}
                </ul>
              )}
            </form>
          </section>

          <section aria-labelledby="shelf-h" className="bar-section">
            <h2 id="shelf-h" className="bar-h2">
              On your shelf{" "}
              <span className="muted bar-count">
                · {items.length} {items.length === 1 ? "ingredient" : "ingredients"}
              </span>
            </h2>
            {bar === "down" ? (
              <div className="form-error">
                We couldn&apos;t load your bar just now. Reload the page in a minute.
              </div>
            ) : items.length === 0 ? (
              <div className="sticky sticky--white bar-empty">
                <p className="bar-empty__title">Nothing on your shelf yet.</p>
                <p>Type a name above, or open a category below and tick what you have.</p>
              </div>
            ) : (
              <form action={removeItem} className="shelf">
                {[...groups.entries()]
                  .sort(([a], [b]) => a.localeCompare(b))
                  .map(([cat, rows]) => (
                    <div key={cat}>
                      <h3 className="shelf__cat">{cat}</h3>
                      <ul className="shelf__items">
                        {rows.map((i) => (
                          <li key={i.id} className="shelf__item">
                            <span className="shelf__text">
                              <span className="shelf__name">{i.name}</span>
                              {i.path.length > 0 && <Path path={i.path} />}
                            </span>
                            <button
                              type="submit"
                              name="remove"
                              value={i.id}
                              className="shelf__remove"
                            >
                              Remove<span className="vh"> {i.name}</span>
                            </button>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
              </form>
            )}
          </section>

          <section aria-labelledby="bulk-h" className="bar-section">
            <h2 id="bulk-h" className="bar-h2">
              Add a few at once
            </h2>
            <p className="muted bar-small">Open a category, tick what you have, then Add ticked.</p>
            <form action={addTicked} className="bulk">
              {error === "ticks" && (
                <div className="form-error" role="alert" tabIndex={-1} autoFocus>
                  Tick at least one, then press Add ticked.
                </div>
              )}
              {trees.map((cat) => (
                <details key={cat.item.id} className="bulk__cat">
                  <summary>
                    <span className="bulk__name">{cat.item.name}</span>
                    <span className="bulk__count muted">
                      {count(cat)}
                      <span className="vh"> ingredients</span>
                    </span>
                  </summary>
                  <fieldset>
                    <legend className="vh">{cat.item.name}</legend>
                    <CheckTree nodes={cat.children} kept={kept} />
                  </fieldset>
                  <button type="submit" className="btn btn--primary bulk__add">
                    Add ticked
                  </button>
                </details>
              ))}
            </form>
          </section>
        </div>
        {bar !== "down" && <Matches matches={matches} />}
      </div>
    </div>
  );
}
