// Passes the request path to server components (the preference forms return to it).
import { NextResponse, type NextRequest } from "next/server";

export function proxy(request: NextRequest) {
  const headers = new Headers(request.headers);
  headers.set("x-pathname", request.nextUrl.pathname + request.nextUrl.search);
  return NextResponse.next({ request: { headers } });
}
