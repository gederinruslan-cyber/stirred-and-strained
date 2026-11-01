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
  const { age, unit } = await readPrefs();

  const { data: landing } = await api.GET("/landing", {
    params: { query: age ? { country: age.country } : {} },
  });
  if (!landing) throw new Error("the api did not answer /landing");

  const known = new Set(landing.bottles.map((b) => b.id));
  const submitted = sp.set === "1";
  const state: LandingState = {
    bottles: submitted
      ? [sp.b ?? []].flat().filter((b) => known.has(b))
      : DEFAULT_BOTTLES.filter((b) => known.has(b)),
    basics: submitted ? sp.basics === "1" : true,
    // The landing's own control is a query parameter; otherwise the remembered unit.
    unit: sp.unit ? parseUnit(sp.unit) : unit,
  };

  const { data: demo } = await api.GET("/demo", {
    params: {
      query: {
        bottle: state.bottles,
        basics: state.basics ? "true" : "false",
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
    <LandingPage landing={landing} demo={demo} state={state}>
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
  children,
}: {
  landing: LandingResponse;
  demo: DemoResult;
  state: LandingState;
  children: React.ReactNode;
}) {
  return (
    <>
      {children}
      <Hero landing={landing} demo={demo} state={state} />
      <WhyDifferent />
      <Picks recipes={landing.featured} state={state} />
      <BuyNext buyNext={landing.buyNext} />
      <JotItDown recipe={landing.daiquiri} state={state} />
      <YourRecipes />
      <StraightTalk />
      <Closing />
    </>
  );
}
