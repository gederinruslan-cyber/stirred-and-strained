// After an erase (M2-08): the account is gone and the session with it.
import { ButtonLink } from "@stirred/ui";
import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { signedInEmail } from "../../../lib/session.ts";
import { FormPage } from "../../(account)/form-page.tsx";

export const metadata: Metadata = {
  title: "Your account is deleted · Stirred & Strained",
  robots: { index: false },
};

export default async function DeletedPage() {
  if (await signedInEmail()) redirect("/account");
  return (
    <FormPage>
      <h1 className="h2">Your account is deleted</h1>
      <p className="form-page__lead">
        We&apos;ve deleted your account and everything in it, and signed you out on every device.
      </p>
      <p className="form-page__lead">You can still look up any recipe without an account.</p>
      <ButtonLink href="/">Back to the start</ButtonLink>
    </FormPage>
  );
}
