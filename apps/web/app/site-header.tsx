import Link from "next/link";
import { ButtonLink, SearchInput } from "@stirred/ui";
import type { Theme } from "../lib/prefs.ts";
import { signOut } from "./(account)/actions.ts";
import { ThemeToggle } from "./theme-toggle.tsx";

export function SiteHeader({
  theme,
  back,
  minimal,
  signedIn,
}: {
  theme: Theme | null;
  back: string;
  /** Shows "Sign out" in place of "Sign in"; never the email (shared screens). */
  signedIn: boolean;
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
        <Link href="/bar">My Bar</Link>
        <Link href="/my-recipes">My recipes</Link>
      </nav>
      <form role="search" method="get" action="/recipes" className="site-header__search">
        <SearchInput name="q" label="Find a drink" placeholder="Find a drink…" />
      </form>
      <div className="site-header__actions">
        <ThemeToggle initial={theme} back={back} />
        {signedIn ? (
          <form action={signOut} className="inline-form">
            <input type="hidden" name="back" value={back} />
            <button type="submit" className="site-header__link">
              Sign out
            </button>
          </form>
        ) : (
          <Link
            href={back.startsWith("/sign-in") ? back : `/sign-in?back=${encodeURIComponent(back)}`}
            className="site-header__link"
            {...(back.startsWith("/sign-in") ? { "aria-current": "page" as const } : {})}
          >
            Sign in
          </Link>
        )}
        <ButtonLink href="/bar">Start my bar</ButtonLink>
      </div>
    </header>
  );
}
