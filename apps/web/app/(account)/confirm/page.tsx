// The mailed confirm link (M2-02): the link plus the password chosen at sign-up signs in.
import type { Metadata } from "next";
import { FormPage, linkToken, type PageProps } from "../form-page.tsx";
import { ConfirmForm } from "../forms.tsx";

// The link carries a token: never send it to another site as a referrer.
export const metadata: Metadata = {
  title: "Confirm your account · Stirred & Strained",
  referrer: "same-origin",
};

export default async function ConfirmPage(props: PageProps) {
  return (
    <FormPage>
      <ConfirmForm token={await linkToken(props)} />
    </FormPage>
  );
}
