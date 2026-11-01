// Your account (M2-08, docs/design/account.md): take your data with you, or delete it all.
import { NapkinCard } from "@stirred/ui";
import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { signedInEmail } from "../../lib/session.ts";
import "../(account)/account.css";
import "./account.css";
import { EraseForm } from "./erase-form.tsx";

export const metadata: Metadata = { title: "Your account · Stirred & Strained" };

export default async function AccountPage() {
  const email = await signedInEmail();
  if (!email) redirect("/sign-in?back=/account");
  return (
    <div className="container account">
      <p className="hand form-page__aside account__aside" aria-hidden="true">
        your stuff
      </p>
      <h1 className="h2">Your account</h1>
      <p className="account__email">
        Signed in as <strong>{email}</strong>.
      </p>
      <div className="account__grid">
        <NapkinCard tilt={-0.6}>
          <section aria-labelledby="export-h" className="account__export">
            <h2 id="export-h" className="account__h2" tabIndex={-1}>
              Take your data with you
            </h2>
            <p>
              Everything you&apos;ve put in: your bar, the swaps you turned off, your recipes
              (deleted ones too, with their history), your favourites, ratings and notes, and your
              email and sign-ins.
            </p>
            <ul className="account__downloads">
              <li>
                <a
                  href="/account/export"
                  download
                  className="btn btn--secondary"
                  aria-describedby="json-help"
                >
                  Download as JSON
                </a>
                <p id="json-help" className="field__help">
                  For a backup or another app.
                </p>
              </li>
              <li>
                <a
                  href="/account/export/markdown"
                  download
                  className="btn btn--secondary"
                  aria-describedby="md-help"
                >
                  Download as Markdown
                </a>
                <p id="md-help" className="field__help">
                  To read or print.
                </p>
              </li>
            </ul>
          </section>
        </NapkinCard>
        <section aria-labelledby="delete-h" className="account__danger">
          <h2 id="delete-h" className="account__h2">
            Delete your account
          </h2>
          <p id="delete-what">
            This deletes your account and everything above: your bar, swaps, recipes and their
            history, favourites, ratings and notes. It can&apos;t be undone, and we can&apos;t bring
            it back.
          </p>
          <p>
            Want a copy? <a href="#export-h">Download your data first</a>.
          </p>
          <EraseForm />
        </section>
      </div>
    </div>
  );
}
