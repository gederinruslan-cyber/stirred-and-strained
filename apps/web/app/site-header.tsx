import Link from "next/link";
import { ButtonLink, LockedSwitch, SearchInput, Switch } from "@stirred/ui";
import type { Theme } from "../lib/prefs.ts";
import { ThemeToggle } from "./theme-toggle.tsx";

export function SiteHeader({
  theme,
  zero,
  zeroLocked,
  back,
  minimal,
}: {
  theme: Theme | null;
  zero: boolean;
  zeroLocked: boolean;
  back: string;
  /** The age gate: wordmark only, nothing that leads to content. */
  minimal: boolean;
}) {
  if (minimal) {
    return (
      <header className="container site-header">
        <p className="wordmark">
          Stirred <span className="wordmark__amp">&amp;</span> Strained
        </p>
      </header>
    );
  }
  return (
    <header className="container site-header">
      <Link href="/" className="wordmark">
        Stirred <span className="wordmark__amp">&amp;</span> Strained
      </Link>
      <nav aria-label="Main" className="site-nav">
        <Link href="/#picks">Recipes</Link>
        <Link href="/#demo">My Bar</Link>
      </nav>
      {zeroLocked ? (
        <LockedSwitch label="Zero-proof" reason="set by your age answer" />
      ) : (
        <form method="post" action="/prefs" className="inline-form">
          <input type="hidden" name="back" value={back} />
          <Switch
            type="submit"
            name="zero"
            value={zero ? "off" : "on"}
            checked={zero}
            label="Zero-proof"
          />
        </form>
      )}
      <form role="search" method="get" action="/recipes" className="site-header__search">
        <SearchInput name="q" label="Find a drink" placeholder="Find a drink…" />
      </form>
      <ThemeToggle initial={theme} back={back} />
      <Link href="/sign-in" className="site-header__link">
        Sign in
      </Link>
      <ButtonLink href="/#demo">Start my bar</ButtonLink>
    </header>
  );
}
