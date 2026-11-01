"use client";
// Submits a POST form as soon as a control changes; without JavaScript its button does.
import type { ReactNode } from "react";

export function SubmitOnChange({
  action,
  label,
  children,
}: {
  action: string;
  label: string;
  children: ReactNode;
}) {
  return (
    <form
      method="post"
      action={action}
      aria-label={label}
      onChange={(event) => event.currentTarget.requestSubmit()}
    >
      {children}
    </form>
  );
}
