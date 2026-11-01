// Create an account (M2-02): the api mails a confirm link; the page never says if one exists.
import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { safeBack } from "../../../lib/prefs.ts";
import { signedInEmail } from "../../../lib/session.ts";
import { FormPage, type PageProps } from "../form-page.tsx";
import { SignUpForm } from "../forms.tsx";

export const metadata: Metadata = { title: "Create an account · Stirred & Strained" };

export default async function SignUpPage({ searchParams }: PageProps) {
  if (await signedInEmail()) redirect("/");
  const back = safeBack((await searchParams).back);
  return (
    <FormPage>
      <SignUpForm back={back} />
    </FormPage>
  );
}
