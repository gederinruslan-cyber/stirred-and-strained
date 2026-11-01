import "@stirred/ui/styles.css";
import { Caveat, DM_Sans, Fraunces } from "next/font/google";
import { headers } from "next/headers";
import type { ReactNode } from "react";
import { countryFromAcceptLanguage } from "../lib/age.ts";
import { api } from "../lib/api.ts";
import { readPrefs, safeBack } from "../lib/prefs.ts";
import { signedInEmail } from "../lib/session.ts";
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
  const { theme, age } = await readPrefs();
  const head = await headers();
  const back = safeBack(head.get("x-pathname"));
  // The gate, and every page for a visitor under the drinking age, has nothing that leads on.
  const onGate = back === "/age" || back.startsWith("/age?") || age?.answer === "under";
  // The gate's country picker wins on the gate; elsewhere the answered country, then the browser.
  const country =
    (onGate ? new URLSearchParams(back.split("?")[1]).get("country") : null) ??
    age?.country ??
    countryFromAcceptLanguage(head.get("accept-language"));
  const [{ data }, email] = await Promise.all([
    api.GET("/age-rules", { params: { query: country ? { country } : {} } }),
    onGate ? null : signedInEmail(),
  ]);
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
        <SiteHeader theme={theme} back={back} minimal={onGate} signedIn={email !== null} />
        <main id="main">{children}</main>
        <SiteFooter theme={theme} back={back} help={data?.rule} />
      </body>
    </html>
  );
}
