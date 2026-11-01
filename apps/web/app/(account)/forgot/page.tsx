// Forgot your password (M2-02): the same answer for every address.
import type { Metadata } from "next";
import { FormPage } from "../form-page.tsx";
import { ForgotForm } from "../forms.tsx";

export const metadata: Metadata = { title: "Forgot your password? · Stirred & Strained" };

export default function ForgotPage() {
  return (
    <FormPage>
      <ForgotForm />
    </FormPage>
  );
}
