import Link from "next/link";
import type { Theme } from "../lib/prefs.ts";

export function SiteFooter({ theme, back }: { theme: Theme | null; back: string }) {
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
                <Link href="/#zero-h">Zero-proof</Link>
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
