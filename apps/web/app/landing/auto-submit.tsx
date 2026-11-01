"use client";
// Re-runs a GET form on every change without a page reload or a scroll jump (debounced).
// Without JavaScript the form submits normally.
import { usePathname, useRouter } from "next/navigation";
import { useRef, type ReactNode } from "react";

export function AutoSubmitForm({
  label,
  delay = 250,
  children,
}: {
  label: string;
  delay?: number;
  children: ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);
  return (
    <form
      method="get"
      action={pathname}
      aria-label={label}
      onChange={(event) => {
        const form = event.currentTarget;
        clearTimeout(timer.current);
        timer.current = setTimeout(() => {
          const query = new URLSearchParams(
            new FormData(form) as unknown as Record<string, string>,
          );
          router.replace(`${pathname}?${query.toString()}`, { scroll: false });
        }, delay);
      }}
    >
      {children}
    </form>
  );
}
