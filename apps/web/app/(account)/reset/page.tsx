// The mailed reset link (M2-02): a new password ends every session and signs in.
import type { Metadata } from "next";
import { FormPage, linkToken, type PageProps } from "../form-page.tsx";
import { ResetForm } from "../forms.tsx";

// The link carries a token: never send it to another site as a referrer.
export const metadata: Metadata = {
  title: "Choose a new password · Stirred & Strained",
  referrer: "same-origin",
};

export default async function ResetPage(props: PageProps) {
  return (
    <FormPage>
      <ResetForm token={await linkToken(props)} />
    </FormPage>
  );
}
