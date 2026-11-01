// What a visitor under the drinking age sees in place of every page but the small print (the
// proxy rewrites to here). Nothing on it leads into the library.
import { NapkinCard } from "@stirred/ui";
import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { api } from "../../../lib/api.ts";
import { readPrefs } from "../../../lib/prefs.ts";
import "../age.css";

export const metadata: Metadata = { title: "Come back later · Stirred & Strained" };

export default async function UnderAgePage() {
  const { age } = await readPrefs();
  if (age?.answer !== "under") redirect("/");
  const { data } = await api.GET("/age-rules", { params: { query: { country: age.country } } });
  if (!data) throw new Error("the api did not answer /age-rules");
  const { rule } = data;
  return (
    <div className="container age-gate">
      <NapkinCard tilt={-0.8}>
        <p className="hand age-gate__aside" aria-hidden="true">
          thanks for being straight with us
        </p>
        <h1 className="h2 age-gate__question">Come back when you&apos;re {rule.age}.</h1>
        <p className="age-gate__body">
          The legal drinking age in <strong>{rule.name}</strong> is <strong>{rule.age}</strong>, and
          this is a cocktail app, so there&apos;s nothing here for you yet.
        </p>
        <p className="muted age-gate__small">
          We keep your answer in one cookie for a year, and nothing else.{" "}
          <Link href="/cookies">Cookies</Link>
        </p>
      </NapkinCard>
    </div>
  );
}
