import type { DemoResult, LandingResponse } from "@stirred/schema";
import type { DisplayUnit } from "@stirred/units";
import type { Metadata } from "next";
import { api } from "../lib/api.ts";
import { parseUnit } from "../lib/amounts.ts";
import { readPrefs } from "../lib/prefs.ts";
import { DEFAULT_BOTTLES } from "./landing/content.ts";
import "./landing/landing.css";
import {
  BuyNext,
  Closing,
  Hero,
  JotItDown,
  Picks,
  StraightTalk,
  WhyDifferent,
  YourRecipes,
  ZeroBand,
} from "./landing/sections.tsx";

const DESCRIPTION =
  "Tell us what's on your shelf. We'll show you what you can mix right now, what you're one bottle away from, and which bottle to grab next. Real recipes, properly credited.";

export const metadata: Metadata = {
  title: "Stirred & Strained: what can you make tonight?",
  description: DESCRIPTION,
};

/** What the visitor's forms carry: the demo shelf and the display unit. */
export type LandingState = { bottles: string[]; basics: boolean; unit: DisplayUnit };

type Search = Record<string, string | string[] | undefined>;

export default async function Home({ searchParams }: { searchParams: Promise<Search> }) {
  const sp = await searchParams;
  const { zero, zeroLocked } = await readPrefs();

  const { data: served } = await api.GET("/landing");
  if (!served) throw new Error("the api did not answer /landing");
  // Under the drinking age: nothing alcoholic on the page (M1-11).
  const landing: LandingResponse = zeroLocked
    ? {
        ...served,
        bottles: served.bottles.filter((b) => b.zeroProof),
        featured: served.featured.filter((r) => r.zeroProof),
        ginBucks: served.ginBucks.filter((r) => r.zeroProof),
      }
    : served;

  const known = new Set(landing.bottles.map((b) => b.id));
  const submitted = sp.set === "1";
  const state: LandingState = {
    bottles: submitted
      ? [sp.b ?? []].flat().filter((b) => known.has(b))
      : DEFAULT_BOTTLES.filter((b) => known.has(b)),
    basics: submitted ? sp.basics === "1" : true,
    unit: parseUnit(sp.unit),
  };

  const { data: demo } = await api.GET("/demo", {
    params: {
      query: {
        bottle: state.bottles,
        basics: state.basics ? "true" : "false",
        zero: zero ? "true" : "false",
      },
    },
  });
  if (!demo) throw new Error("the api did not answer /demo");

  const origin = process.env.PUBLIC_ORIGIN ?? "http://127.0.0.1:3300";
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "Stirred & Strained",
    url: origin,
    description: DESCRIPTION,
    potentialAction: {
      "@type": "SearchAction",
      target: `${origin}/recipes?q={search_term_string}`,
      "query-input": "required name=search_term_string",
    },
  };

  return (
    <LandingPage landing={landing} demo={demo} state={state} zero={zero} locked={zeroLocked}>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
    </LandingPage>
  );
}

function LandingPage({
  landing,
  demo,
  state,
  zero,
  locked,
  children,
}: {
  landing: LandingResponse;
  demo: DemoResult;
  state: LandingState;
  zero: boolean;
  locked: boolean;
  children: React.ReactNode;
}) {
  return (
    <>
      {children}
      <Hero landing={landing} demo={demo} state={state} zero={zero} />
      <WhyDifferent />
      <Picks recipes={landing.featured} state={state} />
      {!locked && <BuyNext buyNext={landing.buyNext} />}
      {!locked && <JotItDown recipe={landing.daiquiri} state={state} />}
      <ZeroBand recipes={landing.ginBucks} zero={zero} locked={locked} unit={state.unit} />
      <YourRecipes />
      <StraightTalk />
      <Closing />
    </>
  );
}
