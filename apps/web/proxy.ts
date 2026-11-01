// Passes the request path to server components (the preference forms return to it), and sends a
// visitor who has not answered the age question to /age first (M1-11).
import { NextResponse, type NextRequest } from "next/server";
import { AGE_COOKIE, parseAgeCookie } from "./lib/age.ts";

/** Reachable before the age answer: the gate itself, saving preferences and the small print. */
const OPEN = ["/age", "/prefs", "/cookies", "/privacy", "/terms"];

export function proxy(request: NextRequest) {
  const { pathname, search } = request.nextUrl;
  const answered = parseAgeCookie(request.cookies.get(AGE_COOKIE)?.value);
  if (!answered && !OPEN.some((p) => pathname === p || pathname.startsWith(`${p}/`))) {
    const gate = new URL("/age", request.url);
    gate.searchParams.set("back", pathname + search);
    return NextResponse.redirect(gate, 303);
  }
  const headers = new Headers(request.headers);
  headers.set("x-pathname", pathname + search);
  return NextResponse.next({ request: { headers } });
}

export const config = {
  matcher: ["/((?!_next/|photos/|favicon.ico|robots.txt).*)"],
};
