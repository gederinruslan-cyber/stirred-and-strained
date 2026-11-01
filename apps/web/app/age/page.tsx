// The age gate (M1-11): one question before anything else; works without JavaScript.
import { Button, NapkinCard, Select } from "@stirred/ui";
import type { Metadata } from "next";
import { headers } from "next/headers";
import Link from "next/link";
import { countryFromAcceptLanguage, validCountry } from "../../lib/age.ts";
import { api } from "../../lib/api.ts";
import { safeBack } from "../../lib/prefs.ts";
import "./age.css";

export const metadata: Metadata = { title: "One quick thing first · Stirred & Strained" };

type Search = Record<string, string | string[] | undefined>;

export default async function AgePage({ searchParams }: { searchParams: Promise<Search> }) {
  const sp = await searchParams;
  const back = safeBack(sp.back);
  const country =
    validCountry(sp.country) ?? countryFromAcceptLanguage((await headers()).get("accept-language"));
  const { data } = await api.GET("/age-rules", { params: { query: country ? { country } : {} } });
  if (!data) throw new Error("the api did not answer /age-rules");
  const { rule, countries } = data;
  const options = [
    ...countries.map((c) => ({ value: c.country, label: c.name.replace(/^the /, "") })),
    { value: "ZZ", label: "Somewhere else" },
  ];

  return (
    <div className="container age-gate">
      <NapkinCard tilt={-0.8}>
        <p className="hand age-gate__aside" aria-hidden="true">
          one quick thing first
        </p>
        <h1 className="h2 age-gate__question">Are you {rule.age} or over?</h1>
        <p className="age-gate__body">
          The legal drinking age in <strong>{rule.name}</strong> is <strong>{rule.age}</strong>, so
          that&apos;s what we ask.
        </p>
        <form method="post" action="/age/answer" className="age-gate__answers">
          <input type="hidden" name="back" value={back} />
          <input type="hidden" name="country" value={rule.country} />
          <Button type="submit" name="answer" value="ok">
            Yes, I&apos;m {rule.age} or over
          </Button>
          <Button type="submit" name="answer" value="zero" variant="secondary">
            No, I&apos;m under {rule.age}
          </Button>
        </form>
        <p className="muted age-gate__small">
          Under {rule.age}? You&apos;ll get the zero-proof side of the bar: every zero-proof recipe,
          with the same detail and the same care.
        </p>
        <section aria-labelledby="age-country-h" className="age-gate__country">
          <h2 id="age-country-h" className="age-gate__h2">
            Somewhere else?
          </h2>
          <form method="get" action="/age" className="age-gate__picker">
            <input type="hidden" name="back" value={back} />
            <Select
              id="age-country"
              name="country"
              label="Country you're in"
              options={options}
              value={rule.country}
            />
            <Button type="submit" variant="secondary">
              Use this country
            </Button>
          </form>
        </section>
        <p className="muted age-gate__small">
          We ask because the law does. We keep your answer and your country in one cookie for a
          year, and nothing else. <Link href="/cookies">Cookies</Link>
        </p>
      </NapkinCard>
    </div>
  );
}
