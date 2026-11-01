// The Form page pattern (M2-02): one centred napkin card holding one short form.
import { NapkinCard } from "@stirred/ui";
import type { ReactNode } from "react";
import "./account.css";

export function FormPage({ children }: { children: ReactNode }) {
  return (
    <div className="container form-page">
      <NapkinCard tilt={-0.8}>{children}</NapkinCard>
    </div>
  );
}

type Search = Record<string, string | string[] | undefined>;
export type PageProps = { searchParams: Promise<Search> };

/** A link token from the query, or null when it cannot be one (ADR 0005: 43 base64url). */
export async function linkToken({ searchParams }: PageProps): Promise<string | null> {
  const token = (await searchParams).token;
  return typeof token === "string" && /^[A-Za-z0-9_-]{43}$/.test(token) ? token : null;
}
