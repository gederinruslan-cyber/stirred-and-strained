// The landing page sections (docs/design/landing-page.md). Presentation only: every recipe,
// match and ranking comes from the api.
import type { DemoResult, LandingResponse, RecipeDetail } from "@stirred/schema";
import {
  ButtonLink,
  Chip,
  RecipeCard,
  SegmentedControl,
  StickyNote,
  TableCard,
  Tag,
  ZeroProofTag,
} from "@stirred/ui";
import Link from "next/link";
import { amountText, lineNote, strengthText } from "../../lib/amounts.ts";
import type { LandingState } from "../page.tsx";
import { AutoSubmitForm } from "./auto-submit.tsx";
import { PICKS, UNITS } from "./content.ts";

const plural = (n: number, one: string, many: string) => `${n} ${n === 1 ? one : many}`;

/** Hidden inputs that carry the rest of the page's state through a GET form. */
function Carry({ state, omit }: { state: LandingState; omit: "shelf" | "unit" }) {
  return (
    <>
      <input type="hidden" name="set" value="1" />
      {omit !== "shelf" &&
        state.bottles.map((b) => <input key={b} type="hidden" name="b" value={b} />)}
      {omit !== "shelf" && state.basics && <input type="hidden" name="basics" value="1" />}
      {omit !== "unit" && <input type="hidden" name="unit" value={state.unit} />}
    </>
  );
}

function UnitControl({ state, legend }: { state: LandingState; legend: string }) {
  return (
    <AutoSubmitForm label={legend}>
      <Carry state={state} omit="unit" />
      <SegmentedControl name="unit" legend={legend} options={UNITS} value={state.unit} />
      <noscript>
        <button type="submit" className="btn btn--secondary">
          Show
        </button>
      </noscript>
    </AutoSubmitForm>
  );
}

export function Hero({
  landing,
  demo,
  state,
  zero,
}: {
  landing: LandingResponse;
  demo: DemoResult;
  state: LandingState;
  zero: boolean;
}) {
  const make = demo.makeNow.slice(0, 5);
  const away = demo.oneAway.slice(0, 3);
  const empty = state.bottles.length === 0 && !state.basics;
  const summary = empty
    ? "No bottles ticked yet."
    : `${plural(demo.makeNow.length, "recipe", "recipes")} you can make, ${demo.oneAway.length} one bottle away.`;
  return (
    <section aria-labelledby="hero-h" className="container section hero">
      <div className="hero__copy">
        <p className="hand tilt" style={{ "--tilt": "-2deg" } as React.CSSProperties}>
          your home bar, sorted
        </p>
        <h1 id="hero-h" className="display">
          What can you make <span className="highlight">tonight?</span>
        </h1>
        <p className="hero__sub">
          Tell us what&apos;s on your shelf. We&apos;ll show you what you can mix right now, what
          you&apos;re one bottle away from, and which bottle to grab next. Real recipes, properly
          credited.
        </p>
        <div className="hero__actions">
          <ButtonLink href="#demo">Start my bar</ButtonLink>
          <ButtonLink href="#picks" variant="secondary">
            Just browse
          </ButtonLink>
        </div>
        <p className="hand hero__aside">free · no ads · your recipes stay yours</p>
      </div>

      <div id="demo" className="hero__demo">
        <div className="napkin tilt demo" style={{ "--tilt": "1deg" } as React.CSSProperties}>
          <div className="tape" aria-hidden="true" />
          <h2 className="demo__title">What&apos;s on your shelf?</h2>
          <p className="muted demo__hint">
            {zero ? "Zero-proof is on: only zero-proof recipes show." : "Tick what you've got."}
          </p>
          <AutoSubmitForm label="Your shelf">
            <Carry state={state} omit="shelf" />
            <fieldset className="demo__shelf">
              <legend className="vh">Bottles you have</legend>
              <div className="demo__chips">
                {landing.bottles.map((b) => (
                  <Chip
                    key={b.id}
                    name="b"
                    value={b.id}
                    defaultChecked={state.bottles.includes(b.id)}
                    zero={b.zeroProof}
                  >
                    {b.name}
                  </Chip>
                ))}
              </div>
              <label className="demo__basics">
                <input type="checkbox" name="basics" value="1" defaultChecked={state.basics} />
                Plus the usual: lemons, limes, sugar, soda water
              </label>
            </fieldset>
            <noscript>
              <button type="submit" className="btn btn--secondary">
                Show me
              </button>
            </noscript>
          </AutoSubmitForm>

          <p className="vh" aria-live="polite">
            {summary}
          </p>
          <div className="demo__results">
            <div>
              <h3 className="hand demo__heading">
                {demo.makeNow.length > 0 ? `you can make ${demo.makeNow.length}!` : "you can make…"}
              </h3>
              {empty ? (
                <p className="muted">Tick a bottle or two and we&apos;ll show you.</p>
              ) : make.length === 0 ? (
                <p className="muted">Nothing yet with just these, but check the right-hand list.</p>
              ) : (
                <ul className="demo__list">
                  {make.map((r) => (
                    <li key={r.id}>
                      <strong>{r.name}</strong> <span className="muted">· {r.method}</span>
                      {r.zeroProof && <ZeroProofTag />}
                    </li>
                  ))}
                </ul>
              )}
            </div>
            <div>
              <h3 className="hand demo__heading">one bottle away…</h3>
              {away.length === 0 ? (
                <p className="muted">Nothing one bottle away yet.</p>
              ) : (
                <ul className="demo__list">
                  {away.map((r) => (
                    <li key={r.id}>
                      <strong>{r.name}</strong> <span className="muted">+ {r.missing.name}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
          <p className="demo__foot muted">
            Nothing&apos;s saved yet. <Link href="#demo">Start my bar</Link> to keep it.
          </p>
        </div>
        <p className="hand hand-aside demo__aside" aria-hidden="true">
          tick a few, it updates live
        </p>
      </div>
    </section>
  );
}

export function WhyDifferent() {
  return (
    <section aria-labelledby="why-h" className="container section">
      <h2 id="why-h" className="h2 section__title">
        Why it&apos;s different
      </h2>
      <div className="grid-3">
        <StickyNote colour="yellow" number="1." title="Recipes with receipts." tilt={-1.2}>
          Every house recipe says who came up with it and where we found it. The how-to is in our
          own words.
        </StickyNote>
        <StickyNote colour="white" number="2." title="We know bourbon is whiskey." tilt={0.8}>
          Got bourbon? It counts as whiskey. Rye can stand in for bourbon. But a Last Word still
          needs its Chartreuse, no fudging.
        </StickyNote>
        <StickyNote colour="green" number="3." title="How strong is it, really?" tilt={-0.6}>
          Every drink shows how strong it ends up once it&apos;s shaken or stirred, plus standard
          drinks for where you live.
        </StickyNote>
      </div>
    </section>
  );
}

export function Picks({ recipes, state }: { recipes: RecipeDetail[]; state: LandingState }) {
  return (
    <section id="picks" aria-labelledby="picks-h" className="container section">
      <div className="section__head">
        <div>
          <p className="hand tilt" style={{ "--tilt": "-2deg" } as React.CSSProperties}>
            start here
          </p>
          <h2 id="picks-h" className="h2">
            A few to get you going
          </h2>
          <p className="muted">
            Four favourites, written up properly. Pick your units and every amount follows.
          </p>
        </div>
        <UnitControl state={state} legend="Units for these recipes" />
      </div>
      <div className="grid-4">
        {recipes.map((r) => {
          const pick = PICKS[r.id];
          return (
            <RecipeCard
              key={r.id}
              id={`pick-${r.id}`}
              name={r.name}
              {...(pick ? { blurb: pick.blurb, photo: pick.photo, tilt: pick.tilt } : {})}
              lines={r.lines.map((l) => ({ name: l.label, amount: amountText(l, state.unit) }))}
              method={r.steps ?? r.method}
              strength={<strong>{strengthText(r)}</strong>}
              credit={r.source ?? ""}
              href="#card"
              zeroProof={r.zeroProof}
            />
          );
        })}
      </div>
    </section>
  );
}

export function BuyNext({ buyNext }: { buyNext: LandingResponse["buyNext"] }) {
  return (
    <section aria-labelledby="buy-h" className="container section split">
      <div className="split__copy">
        <h2 id="buy-h" className="h2">
          Which bottle should you buy next?
        </h2>
        <p className="muted">
          We look at what you&apos;ve already got and tell you which single bottle opens up the most
          new recipes. Not what&apos;s trending. Not behind a paywall.
        </p>
        <p className="hand hand-aside">(this is the bit other apps charge for)</p>
      </div>
      <div className="split__aside tilt" style={{ "--tilt": "-0.8deg" } as React.CSSProperties}>
        <TableCard caption={`say you've got ${buyNext.bar.join(", ").toLowerCase()} & the usual…`}>
          <thead>
            <tr>
              <th scope="col">Buy this</th>
              <th scope="col">New recipes</th>
              <th scope="col">Like</th>
            </tr>
          </thead>
          <tbody>
            {buyNext.rows.map((row) => (
              <tr key={row.ingredient.id}>
                <th scope="row">{row.ingredient.name}</th>
                <td className="amount">{row.count}</td>
                <td>{row.recipes.slice(0, 3).join(", ")}</td>
              </tr>
            ))}
          </tbody>
        </TableCard>
      </div>
    </section>
  );
}

export function JotItDown({ recipe, state }: { recipe: RecipeDetail; state: LandingState }) {
  return (
    <section id="card" aria-labelledby="card-h" className="container section">
      <h2 id="card-h" className="h2 section__title">
        Every recipe, the way a bartender would jot it down
      </h2>
      <div className="jot">
        <article
          aria-labelledby="dq-h"
          className="napkin tilt jot__card"
          style={{ "--tilt": "-0.8deg" } as React.CSSProperties}
        >
          <div className="tape" aria-hidden="true" />
          <div className="jot__head">
            <div>
              <h3 id="dq-h" className="jot__title">
                {recipe.name}
              </h3>
              <p className="hand">a sour · {recipe.method} · coupe</p>
            </div>
            <UnitControl state={state} legend="Units" />
          </div>
          <ul className="lines">
            {recipe.lines.map((l) => (
              <li key={l.ingredient.id}>
                <span>
                  {l.label}
                  {lineNote(l) && <span className="hand jot__note"> {lineNote(l)}</span>}
                </span>
                <span className="amount">{amountText(l, state.unit)}</span>
              </li>
            ))}
          </ul>
          <p className="strength">
            <strong>[x.x]% ABV</strong> once shaken · <strong>[x.x]</strong> standard drinks
            ([locale])
          </p>
          <p className="credit">
            An IBA official cocktail. Found on the IBA list, [revision]. Method written by us.
          </p>
        </article>
        <ul className="jot__callouts">
          {[
            ["who made it", "And where we found it. Credit where it's due."],
            ["ml, cl or oz", "Your call. Flip it and every amount follows."],
            [
              "how strong, after the ice",
              "Shaking and stirring water a drink down. We do the maths.",
            ],
            ["swaps that actually work", "And a heads-up when only the real bottle will do."],
          ].map(([title, body]) => (
            <li key={title}>
              <span className="hand" aria-hidden="true">
                ←
              </span>
              <span>
                <strong className="hand jot__callout-title">{title}</strong>
                <span className="muted">{body}</span>
              </span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

export function ZeroBand({
  recipes,
  zero,
  unit,
}: {
  recipes: RecipeDetail[];
  zero: boolean;
  unit: LandingState["unit"];
}) {
  return (
    <section aria-labelledby="zero-h" className="zero-band">
      <div className="container split">
        <div className="split__copy">
          <h2 id="zero-h" className="h2">
            Not drinking? Same great drinks.
          </h2>
          <p className="zero-band__text">
            Flip on zero-proof and the whole site follows: lists, matches, swaps, everything. Same
            care, same detail. 0% ABV, nothing to count.
          </p>
          <form method="post" action="/prefs">
            <input type="hidden" name="back" value="/#zero-h" />
            <button
              type="submit"
              name="zero"
              value={zero ? "off" : "on"}
              className="btn btn--secondary"
            >
              {zero ? "Show everything" : "Try zero-proof"}
            </button>
          </form>
        </div>
        <div className="split__aside grid-2">
          {recipes.map((r, i) => (
            <article
              key={r.id}
              aria-labelledby={`zb-${r.id}`}
              className="napkin tilt zero-card"
              style={{ "--tilt": `${i ? 1 : -1}deg` } as React.CSSProperties}
            >
              <h3 id={`zb-${r.id}`} className="zero-card__title">
                {r.name}
              </h3>
              <p className="muted">
                highball · {r.method} · {r.zeroProof ? "0% ABV" : "[x.x]% ABV"}{" "}
                {r.zeroProof && <ZeroProofTag />}
              </p>
              <ul className="lines">
                {r.lines.map((l) => (
                  <li key={l.ingredient.id}>
                    <span>{l.label}</span>
                    <span className="amount">{amountText(l, unit)}</span>
                  </li>
                ))}
              </ul>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

export function YourRecipes() {
  return (
    <section aria-labelledby="yours-h" className="container section split split--reverse">
      <div
        className="split__aside napkin tilt yours"
        style={{ "--tilt": "0.8deg" } as React.CSSProperties}
      >
        <p className="yours__query">
          <span className="vh">Example search: </span>daiquiri
        </p>
        <ul className="yours__list">
          <li>
            <span>Daiquiri</span> <Tag kind="house">house</Tag>{" "}
            <span className="yours__status">✓ make now</span>
          </li>
          <li className="is-yours">
            <span>My Daiquiri #2</span> <Tag kind="yours">yours!</Tag>{" "}
            <span className="yours__status">✓ make now</span>
          </li>
          <li>
            <span>Hemingway Daiquiri</span> <Tag kind="house">house</Tag>{" "}
            <span className="muted">one away</span>
          </li>
        </ul>
      </div>
      <div className="split__copy">
        <h2 id="yours-h" className="h2">
          Your recipes live right next to ours.
        </h2>
        <p className="muted">
          Your own twists show up in search and work with your bar, just like ours. Deleted
          something by accident? Undo. Every edit is kept, and you can download the whole lot
          whenever you like.
        </p>
        <p className="hand">private unless you say otherwise</p>
      </div>
    </section>
  );
}

export function StraightTalk() {
  return (
    <section aria-labelledby="straight-h" className="container section">
      <div className="straight">
        <h2 id="straight-h" className="hand straight__title">
          straight talk
        </h2>
        <div>
          <h3 className="straight__h">The good stuff is free.</h3>
          <p className="muted">
            What can I make, one bottle away and what to buy next don&apos;t cost a thing.
            [PLACEHOLDER: paid plan, if any, and its one price.]
          </p>
        </div>
        <div>
          <h3 className="straight__h">No robots wrote these recipes.</h3>
          <p className="muted">
            If we ever add AI bits, they&apos;ll be clearly labelled, and you can switch them off.
            Everything else works without them.
          </p>
        </div>
      </div>
    </section>
  );
}

export function Closing() {
  return (
    <section aria-labelledby="close-h" className="container section closing">
      <h2 id="close-h" className="h2">
        So… what&apos;s on your shelf?
      </h2>
      <p className="muted">Tick a few bottles and see what tonight could look like.</p>
      <ButtonLink href="#demo">Start my bar</ButtonLink>
      <p className="hand">takes a couple of minutes</p>
    </section>
  );
}
