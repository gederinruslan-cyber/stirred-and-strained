import Link from "next/link";
import { ButtonLink, SearchInput, Switch } from "@stirred/ui";
import type { Theme } from "../lib/prefs.ts";
import { ThemeToggle } from "./theme-toggle.tsx";

export function SiteHeader({
  theme,
  zero,
  back,
}: {
  theme: Theme | null;
  zero: boolean;
  back: string;
}) {
  return (
    <header className="container site-header">
      <Link href="/" className="wordmark">
        Stirred <span className="wordmark__amp">&amp;</span> Strained
      </Link>
      <nav aria-label="Main" className="site-nav">
        <Link href="/#picks">Recipes</Link>
        <Link href="/#demo">My Bar</Link>
      </nav>
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
