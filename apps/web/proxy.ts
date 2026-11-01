// Passes the request path to server components (the preference forms return to it), sends a
// visitor who has not answered the age question to /age first (M1-11), and shows a visitor under
// the drinking age "come back when you're [age]" in place of every page but the small print.
import { NextResponse, type NextRequest } from "next/server";
import { AGE_COOKIE, parseAgeCookie } from "./lib/age.ts";

/** Reachable under the drinking age: saving preferences and the small print. */
const SMALL_PRINT = ["/prefs", "/cookies", "/privacy", "/terms"];
/** Reachable before the age answer: the gate itself too. */
const OPEN = ["/age", ...SMALL_PRINT];
const within = (pathname: string, paths: string[]) =>
  paths.some((p) => pathname === p || pathname.startsWith(`${p}/`));

export function proxy(request: NextRequest) {
  const { pathname, search } = request.nextUrl;
  const answered = parseAgeCookie(request.cookies.get(AGE_COOKIE)?.value);
  if (!answered && !within(pathname, OPEN)) {
    const gate = new URL("/age", request.url);
    gate.searchParams.set("back", pathname + search);
    return NextResponse.redirect(gate, 303);
  }
  const headers = new Headers(request.headers);
  headers.set("x-pathname", pathname + search);
  if (answered?.answer === "under" && !within(pathname, SMALL_PRINT)) {
    return NextResponse.rewrite(new URL("/age/under", request.url), { request: { headers } });
  }
  return NextResponse.next({ request: { headers } });
}

export const config = {
  matcher: ["/((?!_next/|photos/|favicon.ico|robots.txt).*)"],
};
