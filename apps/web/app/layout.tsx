import "@stirred/ui/styles.css";
import { Caveat, DM_Sans, Fraunces } from "next/font/google";
import { headers } from "next/headers";
import type { ReactNode } from "react";
import { readPrefs, safeBack } from "../lib/prefs.ts";
import { SiteFooter } from "./site-footer.tsx";
import { SiteHeader } from "./site-header.tsx";

const display = Fraunces({
  subsets: ["latin"],
  axes: ["SOFT", "opsz"],
  style: ["normal", "italic"],
  variable: "--font-display",
});
const sans = DM_Sans({ subsets: ["latin"], variable: "--font-sans" });
const hand = Caveat({ subsets: ["latin"], weight: ["500", "700"], variable: "--font-hand" });

export const metadata = { title: "Stirred & Strained: what can you make tonight?" };

export default async function RootLayout({ children }: { children: ReactNode }) {
  const { theme, zero } = await readPrefs();
  const back = safeBack((await headers()).get("x-pathname"));
  return (
    <html
      lang="en"
      data-theme={theme ?? undefined}
      className={`${display.variable} ${sans.variable} ${hand.variable}`}
    >
      <body>
        <a href="#main" className="skip-link">
          Skip to content
        </a>
        <SiteHeader theme={theme} zero={zero} back={back} />
        <main id="main">{children}</main>
        <SiteFooter theme={theme} back={back} />
      </body>
    </html>
  );
}
