// A user's own recipe (M2-06, docs/design/custom-recipes.md): the spec in the recipe page's
// layout, strength derived by the api like a house recipe's, and every saved version kept.
import type { UserRecipeDetail } from "@stirred/schema";
import { ButtonLink, PhotoNone, SegmentedControl, Tag } from "@stirred/ui";
import type { Metadata } from "next";
import { amountText, modelText, strengthText } from "../../../lib/amounts.ts";
import { readPrefs } from "../../../lib/prefs.ts";
import type { DisplayUnit } from "@stirred/units";
import { UNITS } from "../../landing/content.ts";
import "../../recipes/recipe.css";
import "../../recipes/search.css";
import { SubmitOnChange } from "../../recipes/[id]/submit-on-change.tsx";
import { deleteRecipe, restoreRecipe } from "../actions.ts";
import { myRecipe } from "../load.ts";
import "../my-recipes.css";

type Params = {
  params: Promise<{ id: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

const EVENT = { created: "Created", edited: "Edited", deleted: "Deleted", restored: "Restored" };
const day = (iso: string) =>
  new Date(iso).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  });

async function load(id: string) {
  const { age } = await readPrefs();
  return myRecipe(id, `/my-recipes/${id}`, age?.country);
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const r = await load((await params).id);
  return { title: `${r.name} · Stirred & Strained` };
}

function History({ r, unit }: { r: UserRecipeDetail; unit: DisplayUnit }) {
  const latest = r.history.findLastIndex((h) => h.spec);
  return (
    <section aria-labelledby="history-h">
      <h2 id="history-h" className="recipe__h2">
        History
      </h2>
      <ol className="history">
        {r.history
          .map((h, i) => ({ h, i }))
          .reverse()
          .map(({ h, i }) => {
            const when = (
              <>
                {EVENT[h.kind]} ·{" "}
                <time className="history__when" dateTime={h.at}>
                  {day(h.at)}
                </time>
              </>
            );
            if (!h.spec) return <li key={i}>{when}</li>;
            return (
              <li key={i}>
                <details className="history__entry">
                  <summary>
                    <span>
                      {when}
                      {i === latest && " (this version)"}
                    </span>
                  </summary>
                  <div className="history__spec">
                    <p>
                      {h.spec.name} · {[h.spec.method, h.spec.glass].filter(Boolean).join(" · ")}
                    </p>
                    <ul className="lines">
                      {h.spec.lines.map((l, n) => (
                        <li key={n}>
                          <span>
                            {l.ingredient.name}
                            {l.optional && <span className="muted"> (optional)</span>}
                          </span>
                          <span className="amount">{amountText(l, unit)}</span>
                        </li>
                      ))}
                    </ul>
                    <ol className="steps">
                      {h.spec.steps.map((s, n) => (
                        <li key={n}>{s}</li>
                      ))}
                    </ol>
                  </div>
                </details>
              </li>
            );
          })}
      </ol>
    </section>
  );
}

export default async function MyRecipePage({ params, searchParams }: Params) {
  const { id } = await params;
  const sp = await searchParams;
  const [r, { unit }] = await Promise.all([load(id), readPrefs()]);
  const saved = [sp.saved].flat()[0];
  const status = r.deletedAt
    ? null
    : saved === "new"
      ? `Saved ${r.name}.`
      : saved === "edit"
        ? `Saved your changes to ${r.name}.`
        : sp.restored
          ? `Restored ${r.name}.`
          : sp.error
            ? "Something went wrong on our side. Nothing changed. Try again in a minute."
            : null;

  return (
    <div className="container section recipe">
      {status && (
        <p className="my-recipes__status recipe-status" role="status" tabIndex={-1} autoFocus>
          {status}
        </p>
      )}
      {r.deletedAt && (
        <p className="my-recipes__status recipe-status" role="status">
          This recipe is deleted.{" "}
          <form action={restoreRecipe} className="inline-form">
            <input type="hidden" name="id" value={r.id} />
            <input type="hidden" name="how" value="page" />
            <button type="submit" className="linkish">
              Restore<span className="vh"> {r.name}</span>
            </button>
          </form>
        </p>
      )}
      <article
        aria-labelledby="recipe-h"
        className="napkin tilt recipe__card"
        style={{ "--tilt": "-0.6deg" } as React.CSSProperties}
      >
        <div className="tape" aria-hidden="true" />
        <div className="recipe__head">
          <h1 id="recipe-h" className="recipe__title">
            {r.name}
          </h1>
          <Tag kind="yours">yours!</Tag>
        </div>
        <p className="recipe__meta">{[r.method, r.glass].filter(Boolean).join(" · ")}</p>

        <section aria-labelledby="goes-in-h">
          <div className="jot__head">
            <h2 id="goes-in-h" className="recipe__h2">
              What goes in
            </h2>
            <SubmitOnChange action="/prefs" label="Units">
              <input type="hidden" name="back" value={`/my-recipes/${r.id}`} />
              <SegmentedControl name="unit" legend="Units" options={UNITS} value={unit} />
              <noscript>
                <button type="submit" className="btn btn--secondary">
                  Show
                </button>
              </noscript>
            </SubmitOnChange>
          </div>
          <ul className="lines">
            {r.lines.map((l, i) => (
              <li key={`${l.ingredient.id}-${i}`}>
                <span>
                  {l.ingredient.name}
                  {l.optional && <span className="muted"> (optional)</span>}
                </span>
                <span className="amount">{amountText(l, unit)}</span>
              </li>
            ))}
          </ul>
          <div className="strength">
            <strong>{strengthText(r)}</strong>
            <span className="strength__model">{modelText(r.method)}</span>
          </div>
        </section>

        <section aria-labelledby="how-h">
          <h2 id="how-h" className="recipe__h2">
            How to make it
          </h2>
          <ol className="steps">
            {r.steps.map((s, i) => (
              <li key={i}>{s}</li>
            ))}
          </ol>
        </section>
      </article>

      <aside className="recipe__side">
        <PhotoNone className="photo-frame recipe__photo" />
        {!r.deletedAt && (
          <div className="recipe__actions">
            <ButtonLink href={`/my-recipes/${r.id}/edit`} variant="secondary">
              Edit recipe
            </ButtonLink>
            <form action={deleteRecipe} className="inline-form">
              <input type="hidden" name="id" value={r.id} />
              <button type="submit" className="btn btn--secondary">
                Delete recipe
              </button>
            </form>
          </div>
        )}
        <History r={r} unit={unit} />
      </aside>
    </div>
  );
}
