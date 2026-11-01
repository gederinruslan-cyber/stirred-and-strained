import Link from "next/link";
import { ButtonLink, SearchInput } from "@stirred/ui";
import type { Theme } from "../lib/prefs.ts";
import { ThemeToggle } from "./theme-toggle.tsx";

export function SiteHeader({
  theme,
  back,
  minimal,
}: {
  theme: Theme | null;
  back: string;
  /** The age gate and the under-age page: wordmark only, nothing that leads to content. */
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
