// The export downloads (M2-08): the signed-in visitor's file from the api, as an attachment that
// is never cached. Signed out, the visitor goes to sign in and comes back to /account.
import "server-only";
import { NextResponse, type NextRequest } from "next/server";

export function attachment(body: string, type: string, extension: "json" | "md") {
  const day = new Date().toISOString().slice(0, 10);
  return new NextResponse(body, {
    headers: {
      "content-type": type,
      "content-disposition": `attachment; filename="stirred-and-strained-${day}.${extension}"`,
      "cache-control": "no-store",
    },
  });
}

export const toSignIn = (request: NextRequest) =>
  NextResponse.redirect(new URL("/sign-in?back=/account", request.url), 303);
