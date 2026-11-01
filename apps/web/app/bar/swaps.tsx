// Swaps we count (M2-05, docs/design/substitutions.md): every house swap with its reason, on or
// off. Signed in, each row has its own Turn off / Turn on submit; signed out, the list is read-only.
import type { Substitution } from "@stirred/schema";
import Link from "next/link";
import { toggleSwap } from "./actions.ts";

type Props = {
  items: Substitution[] | "down";
  signedIn: boolean;
  /** True when the bar has this ingredient or something under it. */
  owns: (id: string, name: string) => boolean;
  open: boolean;
  failed: boolean;
};

export function Swaps({ items, signedIn, owns, open, failed }: Props) {
  const rows =
    items === "down" ? null : (
      <ul className="swaps__items">
        {items.map((s) => {
          const yours = signedIn && owns(s.substitute.id, s.substitute.name);
          const pair = `${s.substitute.name} for ${s.replaces.name}`;
          return (
            <li
              key={`${s.substitute.id}>${s.replaces.id}`}
              className={yours ? "swap swap--yours" : "swap"}
            >
              <div className="swap__text">
                <p className="swap__pair">
                  <strong>{s.substitute.name}</strong> for <strong>{s.replaces.name}</strong>
                </p>
                {yours && (
                  <p className="swap__yours">
                    <span aria-hidden="true">✓ </span>You have {s.substitute.name}
                  </p>
                )}
                <p className="swap__reason">{s.reason}</p>
              </div>
              <div className="swap__ctl">
                <span className={s.allowed ? "swap__state" : "swap__state swap__state--off"}>
                  {s.allowed ? (
                    <>
                      <span aria-hidden="true">✓ </span>On
                    </>
                  ) : (
                    "Off"
                  )}
                </span>
                {signedIn && (
                  <button
                    type="submit"
                    name={s.allowed ? "off" : "on"}
                    value={`${s.substitute.id}>${s.replaces.id}`}
                    className="linkish swap__btn"
                  >
                    {s.allowed ? "Turn off" : "Turn on"}
                    <span className="vh"> {pair}</span>
                  </button>
                )}
              </div>
            </li>
          );
        })}
      </ul>
    );
  const off = items === "down" ? 0 : items.filter((s) => !s.allowed).length;

  return (
    <section aria-labelledby="swaps-h" className="bar-section">
      <h2 id="swaps-h" className="bar-h2">
        Swaps we count
      </h2>
      <p className="bar-small">
        When a recipe asks for a bottle you don&apos;t have, we&apos;ll count a close one you do,
        and the results say which. Recipes named for a bottle always need that bottle.
      </p>
      {!signedIn && (
        <p className="bar-small">
          These all count for now. <Link href="/sign-in?back=/bar">Sign in</Link> or{" "}
          <Link href="/sign-up?back=/bar">create an account</Link> to turn any of them off.
        </p>
      )}
      {items === "down" ? (
        <div className="form-error">
          We couldn&apos;t load the swaps just now. Your bar is fine. Reload the page in a minute.
        </div>
      ) : (
        <details className="swaps__fold" open={open}>
          <summary>
            <span className="swaps__show">Show all {items.length} swaps</span>
            <span className="swaps__hide">Hide the swaps</span>
            {off > 0 && <span className="muted"> · {off} off</span>}
          </summary>
          {signedIn ? (
            <form action={toggleSwap} className="swaps">
              {failed && (
                <div className="form-error" role="alert" tabIndex={-1} autoFocus>
                  Something went wrong on our side. Nothing changed. Try again in a minute.
                </div>
              )}
              {rows}
            </form>
          ) : (
            rows
          )}
        </details>
      )}
    </section>
  );
}
