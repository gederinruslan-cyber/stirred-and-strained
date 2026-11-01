// My recipes (M2-06, docs/design/custom-recipes.md): the visitor's own specs, the ones they
// deleted (never thrown away), and one status line for what the last post did.
import { ButtonLink, Tag } from "@stirred/ui";
import type { Metadata } from "next";
import Link from "next/link";
import { api } from "../../lib/api.ts";
import { apiHeaders } from "../../lib/session.ts";
import "../recipes/search.css";
import { RecipeThumb } from "../recipes/thumb.tsx";
import { restoreRecipe } from "./actions.ts";
import "./my-recipes.css";

export const metadata: Metadata = { title: "My recipes · Stirred & Strained" };

type Search = Record<string, string | string[] | undefined>;
const one = (v: string | string[] | undefined) => [v ?? []].flat()[0];
const day = (iso: string) =>
  new Date(iso).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  });

function Head({ signedIn }: { signedIn: boolean }) {
  return (
    <div className="my-recipes__head">
      <p className="hand hand-aside my-recipes__aside" aria-hidden="true">
        the ones you make at home
      </p>
      <h1 className="h2 my-recipes__title">My recipes</h1>
      <p className="my-recipes__lead">
        Your own specs, private to you. They show up in search and on your bar like ours.
      </p>
      {signedIn && <ButtonLink href="/my-recipes/new">New recipe</ButtonLink>}
    </div>
  );
}

export default async function MyRecipesPage({ searchParams }: { searchParams: Promise<Search> }) {
  const sp = await searchParams;
  const headers = await apiHeaders();
  const res = headers.authorization ? await api.GET("/my/recipes", { headers }) : null;
  if (!res?.data) {
    if (res && res.response.status !== 401) throw new Error("the api did not answer /my/recipes");
    return (
      <div className="container section my-recipes">
        <Head signedIn={false} />
        <div className="my-recipes__note sticky sticky--yellow">
          <p>
            Your own recipes live in your account.{" "}
            <Link href="/sign-in?back=%2Fmy-recipes">Sign in</Link> or{" "}
            <Link href="/sign-up?back=%2Fmy-recipes">create an account</Link> to write one down.
          </p>
        </div>
      </div>
    );
  }
  const { items, deleted } = res.data;
  const nameOf = (id: string | undefined) =>
    [...items, ...deleted].find((r) => r.id === id)?.name ?? "That recipe";
  const deletedId = one(sp.deleted);
  const status = deletedId
    ? { text: `Deleted ${nameOf(deletedId)}.`, undo: deletedId }
    : one(sp.undone)
      ? { text: `${nameOf(one(sp.undone))} is back.` }
      : one(sp.restored)
        ? { text: `Restored ${nameOf(one(sp.restored))}.` }
        : one(sp.error)
          ? { text: "Something went wrong on our side. Nothing changed. Try again in a minute." }
          : null;

  return (
    <div className="container section my-recipes">
      <Head signedIn />
      {status && (
        <p className="my-recipes__status" role="status" tabIndex={-1} autoFocus>
          {status.text}
          {status.undo && deleted.some((d) => d.id === status.undo) && (
            <>
              {" "}
              <form action={restoreRecipe} className="inline-form">
                <input type="hidden" name="id" value={status.undo} />
                <input type="hidden" name="how" value="undo" />
                <button type="submit" className="linkish">
                  Undo<span className="vh"> deleting {nameOf(status.undo)}</span>
                </button>
              </form>
            </>
          )}
        </p>
      )}
      <section aria-labelledby="mine-h">
        <h2 id="mine-h" className="vh">
          Your recipes
        </h2>
        {items.length === 0 ? (
          <div className="sticky sticky--white my-recipes__empty">
            <p className="my-recipes__empty-title">No recipes of your own yet.</p>
            <p>
              Write down the one you make at home. Pick the ingredients, give the amounts, and
              we&apos;ll work out how strong it is.
            </p>
          </div>
        ) : (
          <ol className="results">
            {items.map((r) => (
              <li key={r.id} className="result">
                <RecipeThumb r={r} />
                <div className="result__text">
                  <Link href={`/my-recipes/${r.id}`} className="result__name">
                    {r.name}
                  </Link>{" "}
                  <Tag kind="yours">yours!</Tag>
                  <p className="result__meta">{[r.method, r.glass].filter(Boolean).join(" · ")}</p>
                </div>
                <span className="result__abv">{r.abv.toFixed(1)}% ABV</span>
              </li>
            ))}
          </ol>
        )}
      </section>
      {deleted.length > 0 && (
        <section aria-labelledby="deleted-h" className="my-recipes__deleted">
          <h2 id="deleted-h" className="my-recipes__h2">
            Deleted
          </h2>
          <p className="my-recipes__small muted">
            Nothing here is thrown away. Restore one to put it back in search and on your bar.
          </p>
          <ul className="results">
            {deleted.map((r) => (
              <li key={r.id} className="result">
                <RecipeThumb r={{ id: r.id, yours: true }} />
                <div className="result__text">
                  <span className="result__name muted">{r.name}</span>
                  <p className="result__meta">Deleted {day(r.deletedAt)}</p>
                </div>
                <form action={restoreRecipe} className="inline-form">
                  <input type="hidden" name="id" value={r.id} />
                  <input type="hidden" name="how" value="restore" />
                  <button type="submit" className="linkish">
                    Restore<span className="vh"> {r.name}</span>
                  </button>
                </form>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
