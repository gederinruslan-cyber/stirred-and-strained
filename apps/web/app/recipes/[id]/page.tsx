// A house recipe (M1-08): lines in the visitor's unit, steps in our words, strength for their
// country, where the spec comes from and its variations. Design: docs/design/recipe-page.md.
import { SegmentedControl } from "@stirred/ui";
import type { RecipeDetail } from "@stirred/schema";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { amountText, strengthText } from "../../../lib/amounts.ts";
import { api } from "../../../lib/api.ts";
import { readPrefs } from "../../../lib/prefs.ts";
import { UNITS } from "../../landing/content.ts";
import "../recipe.css";
import { SubmitOnChange } from "./submit-on-change.tsx";

type Params = { params: Promise<{ id: string }> };

async function recipeFor(id: string) {
  const { age } = await readPrefs();
  const { data, response } = await api.GET("/recipes/{id}", {
    params: { path: { id }, query: age ? { country: age.country } : {} },
  });
  if (response.status === 404) notFound();
  if (!data) throw new Error(`the api did not answer /recipes/${id}`);
  return data;
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const recipe = await recipeFor((await params).id);
  return { title: `${recipe.name} · Stirred & Strained` };
}

function jsonLd(r: RecipeDetail) {
  return {
    "@context": "https://schema.org",
    "@type": "Recipe",
    name: r.name,
    recipeCategory: "Cocktail",
    recipeIngredient: r.lines.map((l) => `${amountText(l, "ml")} ${l.ingredient.name}`),
    recipeInstructions: r.steps.map((text) => ({ "@type": "HowToStep", text })),
    ...(/^https?:\/\//.test(r.source) ? { isBasedOn: r.source } : {}),
  };
}

export default async function RecipePage({ params }: Params) {
  const { id } = await params;
  const r = await recipeFor(id);
  const { unit } = await readPrefs();
  const variations = r.variations;
  const twist = r.variationOf;
  const source = /^https?:\/\//.test(r.source);

  return (
    <div className="container section recipe">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd(r)) }}
      />
      <article
        aria-labelledby="recipe-h"
        className="napkin tilt recipe__card"
        style={{ "--tilt": "-0.6deg" } as React.CSSProperties}
      >
        <div className="tape" aria-hidden="true" />
        <h1 id="recipe-h" className="recipe__title">
          {r.name}
        </h1>
        <p className="recipe__meta">{[r.method, r.glass].filter(Boolean).join(" · ")}</p>
        {twist && (
          <p className="recipe__twist">
            A twist on the <Link href={`/recipes/${twist.id}`}>{twist.name}</Link>
          </p>
        )}

        <section aria-labelledby="goes-in-h">
          <div className="jot__head">
            <h2 id="goes-in-h" className="recipe__h2">
              What goes in
            </h2>
            <SubmitOnChange action="/prefs" label="Units">
              <input type="hidden" name="back" value={`/recipes/${r.id}`} />
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
            <span className="strength__model">after the ice, by Arnold&apos;s dilution model</span>
          </div>
        </section>

        <section aria-labelledby="how-h">
          <h2 id="how-h" className="recipe__h2">
            How to make it
          </h2>
          <ol className="steps">
            {r.steps.map((s) => (
              <li key={s}>{s}</li>
            ))}
          </ol>
        </section>
      </article>

      <aside className="recipe__side">
        <section aria-labelledby="from-h" className="sticky sticky--white">
          <h2 id="from-h" className="recipe__h2">
            Where it&apos;s from
          </h2>
          <p className="credit recipe__credit">
            {source ? <a href={r.source}>{r.credit}</a> : r.credit}
          </p>
          <p className="recipe__small muted">Licence: {r.licence}</p>
          <p className="recipe__small muted">
            Amounts as published by the source. Steps are in our own words.
          </p>
        </section>
        {variations.length > 0 && (
          <section aria-labelledby="variations-h">
            <h2 id="variations-h" className="recipe__h2">
              Variations
            </h2>
            <ul className="variations">
              {variations.map((v) => (
                <li key={v.id}>
                  <Link href={`/recipes/${v.id}`}>{v.name} →</Link>
                </li>
              ))}
            </ul>
          </section>
        )}
      </aside>
    </div>
  );
}
