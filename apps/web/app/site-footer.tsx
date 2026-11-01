import Link from "next/link";
import type { AgeRulesResponse } from "@stirred/schema";
import type { Theme } from "../lib/prefs.ts";

type Rule = AgeRulesResponse["rule"];

/** "Worried about drinking…" with the visitor's government help line (docs/design/patterns.md). */
function HelpLine({ rule }: { rule: Rule | undefined }) {
  const ask = "Worried about drinking, yours or someone else's?";
  if (!rule || rule.country === "ZZ" || rule.help.url.includes("findahelpline.com")) {
    return (
      <p className="site-footer__help">
        {ask} Find a helpline near you at{" "}
        <a href="https://findahelpline.com/topics/substance-use">findahelpline.com</a>
      </p>
    );
  }
  const { name, phone, url } = rule.help;
  if (!phone) {
    return (
      <p className="site-footer__help">
        {ask} {name} can help: <a href={url}>{new URL(url).hostname.replace(/^www\d?\./, "")}</a>
      </p>
    );
  }
  return (
    <p className="site-footer__help">
      {ask} Talk to <a href={url}>{name}</a> ({rule.name.replace(/^the /, "")}):{" "}
      <a className="tel" href={`tel:${phone.replace(/[^\d+]/g, "")}`}>
        {phone}
      </a>
    </p>
  );
}

export function SiteFooter({
  theme,
  back,
  help,
}: {
  theme: Theme | null;
  back: string;
  help: Rule | undefined;
}) {
  return (
    <footer className="site-footer">
      <div className="container site-footer__inner">
        <div className="site-footer__cols">
          <div>
            <p className="wordmark">
              Stirred <span className="wordmark__amp">&amp;</span> Strained
            </p>
            <p className="hand">good drinks from what you&apos;ve got</p>
          </div>
          <nav aria-label="The app">
            <p className="site-footer__heading">The app</p>
            <ul>
              <li>
                <Link href="/#picks">Recipes</Link>
              </li>
              <li>
                <Link href="/#demo">My Bar</Link>
              </li>
              <li>
                <Link href="/account">Your account</Link>
              </li>
            </ul>
          </nav>
          <nav aria-label="Behind the bar">
            <p className="site-footer__heading">Behind the bar</p>
            <ul>
              <li>
                <Link href="/sources">Where our recipes come from</Link>
              </li>
              <li>
                <Link href="/strength">How we work out strength</Link>
              </li>
            </ul>
          </nav>
          <nav aria-label="The small print">
            <p className="site-footer__heading">The small print</p>
            <ul>
              <li>
                <Link href="/terms">Terms</Link>
              </li>
              <li>
                <Link href="/privacy">Privacy</Link>
              </li>
              <li>
                <Link href="/cookies">Cookies</Link>
              </li>
            </ul>
          </nav>
        </div>
        <div className="site-footer__small">
          <p>
            Drink well, not a lot. Every recipe shows how strong it is so you can choose. Only for
            people of legal drinking age.
          </p>
          <HelpLine rule={help} />
          <form method="post" action="/prefs" className="site-footer__theme">
            <input type="hidden" name="back" value={back} />
            Theme:{" "}
            <button type="submit" name="theme" value="light" aria-pressed={theme === "light"}>
              Light
            </button>{" "}
            ·{" "}
            <button type="submit" name="theme" value="dark" aria-pressed={theme === "dark"}>
              Dark
            </button>
          </form>
        </div>
      </div>
    </footer>
  );
}
