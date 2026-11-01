// What you can make (M2-04, docs/design/what-can-i-make.md): the api's make now, one bottle away
// and buy next for this bar, beside it. Every list is whole; long ones fold the rest into a
// native details. "Add [bottle]" posts to My Bar's add action, so it works without JavaScript.
import type { BarMatches } from "@stirred/schema";
import { TableCard } from "@stirred/ui";
import Link from "next/link";
import { Fragment, type ReactNode } from "react";
import { addByName } from "./actions.ts";

type Row = { id: string; name: string; method: string; glass?: string | undefined };
const FOLD_OVER = 15;
const SHOWN = 12;
const count = (n: number, one: string, many: string) => `${n} ${n === 1 ? one : many}`;

function Rows<T extends Row>({
  rows,
  right,
  extra,
}: {
  rows: T[];
  right: (r: T) => ReactNode;
  extra: (r: T) => ReactNode;
}) {
  const item = (r: T) => (
    <li key={r.id} className="result">
      {/* eslint-disable-next-line @next/next/no-img-element -- pre-sized thumbnails */}
      <img
        className="result__photo"
        src={`/photos/recipes/thumbs/${r.id}.jpg`}
        alt=""
        width={56}
        height={70}
        loading="lazy"
      />
      <div className="result__text">
        <Link href={`/recipes/${r.id}`} className="result__name">
          {r.name}
        </Link>
        {extra(r)}
      </div>
      {right(r)}
    </li>
  );
  if (rows.length <= FOLD_OVER) return <ol className="results">{rows.map(item)}</ol>;
  const rest = rows.length - SHOWN;
  return (
    <>
      <ol className="results">{rows.slice(0, SHOWN).map(item)}</ol>
      <details className="matches__more">
        <summary>
          <span className="matches__show">Show the other {rest}</span>
          <span className="matches__hide">Hide the other {rest}</span>
        </summary>
        <ol className="results" start={SHOWN + 1}>
          {rows.slice(SHOWN).map(item)}
        </ol>
      </details>
    </>
  );
}

const meta = (r: Row) => [r.method, r.glass].filter(Boolean).join(" · ");

export function Matches({ matches }: { matches: BarMatches | "down" }) {
  if (matches === "down") {
    return (
      <section id="results" className="bar-page__results matches" aria-label="What you can make">
        <div className="form-error">
          We couldn&apos;t work out what you can make just now. Your bar is fine. Reload the page in
          a minute.
        </div>
      </section>
    );
  }
  const { makeNow, oneAway, buyNext } = matches;
  if (makeNow.length + oneAway.length + buyNext.length === 0) {
    return (
      <section id="results" className="bar-page__results matches" aria-label="What you can make">
        <h2 id="make-h" className="bar-h2">
          What you can make
        </h2>
        <div className="sticky sticky--white bar-empty">
          <p className="bar-empty__title">
            Add a few bottles and we&apos;ll show what you can make.
          </p>
        </div>
      </section>
    );
  }
  return (
    <section id="results" className="bar-page__results matches" aria-label="What you can make">
      {makeNow.length > 0 && (
        <p className="hand matches__aside" aria-hidden="true">
          you can make {makeNow.length}!
        </p>
      )}
      <section aria-labelledby="make-h">
        {makeNow.length > 0 ? (
          <>
            <h2 id="make-h" className="bar-h2" tabIndex={-1}>
              You can make {makeNow.length}
              <span className="vh"> recipes</span>
            </h2>
            <div className="matches__panel">
              <Rows
                rows={makeNow}
                right={(r) => <span className="result__abv">{r.abv.toFixed(1)}% ABV</span>}
                extra={(r) => (
                  <>
                    <p className="result__meta">{meta(r)}</p>
                    {r.swaps.length > 0 && (
                      <p className="result__swap">
                        using {r.swaps.map((s) => `${s.using} for ${s.for}`).join(", ")}
                      </p>
                    )}
                  </>
                )}
              />
            </div>
          </>
        ) : (
          <>
            <h2 id="make-h" className="bar-h2" tabIndex={-1}>
              Nothing you can make yet
            </h2>
            <p className="muted">
              You&apos;re close on a few. See what&apos;s one bottle away below.
            </p>
          </>
        )}
      </section>

      <section aria-labelledby="away-h">
        <h2 id="away-h" className="bar-h2">
          One bottle away{" "}
          <span className="muted bar-count">· {count(oneAway.length, "recipe", "recipes")}</span>
        </h2>
        {oneAway.length === 0 ? (
          <p className="muted">Nothing&apos;s one bottle away right now.</p>
        ) : (
          <form action={addByName} className="matches__panel matches__add">
            <Rows
              rows={oneAway}
              right={(r) => (
                <button
                  type="submit"
                  name="pick"
                  value={r.missing.id}
                  className="linkish matches__btn"
                >
                  Add {r.missing.name}
                </button>
              )}
              extra={(r) => (
                <p className="result__meta result__missing">
                  <span aria-hidden="true">+ </span>
                  <span className="vh">needs </span>
                  {r.missing.name}
                </p>
              )}
            />
          </form>
        )}
      </section>

      <section aria-labelledby="buy-h">
        <h2 id="buy-h" className="bar-h2">
          Buy next
        </h2>
        {buyNext.length === 0 ? (
          <p className="muted">Nothing to suggest yet.</p>
        ) : (
          <>
            <p className="muted bar-small">
              The bottles that finish the most recipes one bottle away, most first.
            </p>
            <form action={addByName} className="matches__add">
              <TableCard caption="ranked by what each one adds">
                <thead>
                  <tr>
                    <th scope="col">Buy this</th>
                    <th scope="col">Adds</th>
                    <th scope="col">Recipes</th>
                  </tr>
                </thead>
                <tbody>
                  {buyNext.map((b) => (
                    <tr key={b.ingredient.id}>
                      <th scope="row">{b.ingredient.name}</th>
                      <td className="amount">{count(b.count, "more recipe", "more recipes")}</td>
                      <td>
                        {b.recipes.map((r, i) => (
                          <Fragment key={r.id}>
                            {i > 0 && ", "}
                            <Link href={`/recipes/${r.id}`}>{r.name}</Link>
                          </Fragment>
                        ))}
                        <br />
                        <button
                          type="submit"
                          name="pick"
                          value={b.ingredient.id}
                          className="linkish matches__btn"
                        >
                          Add {b.ingredient.name}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </TableCard>
            </form>
          </>
        )}
      </section>
    </section>
  );
}
