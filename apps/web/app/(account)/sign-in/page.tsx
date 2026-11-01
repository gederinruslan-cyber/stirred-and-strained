// Sign in (M2-02); back to the page the visitor came from.
import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { safeBack } from "../../../lib/prefs.ts";
import { signedInEmail } from "../../../lib/session.ts";
import { FormPage, type PageProps } from "../form-page.tsx";
import { SignInForm } from "../forms.tsx";

export const metadata: Metadata = { title: "Sign in · Stirred & Strained" };

export default async function SignInPage({ searchParams }: PageProps) {
  if (await signedInEmail()) redirect("/");
  const back = safeBack((await searchParams).back);
  return (
    <FormPage>
      <SignInForm back={back} />
    </FormPage>
  );
}
