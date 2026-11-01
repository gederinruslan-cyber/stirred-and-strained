// Saves the age answer from the gate's plain form post, then returns to the page asked for.
import { NextResponse, type NextRequest } from "next/server";
import { AGE_COOKIE, validCountry } from "../../../lib/age.ts";
import { PREF_MAX_AGE, safeBack } from "../../../lib/prefs.ts";

export async function POST(request: NextRequest) {
  const form = await request.formData();
  const answer = form.get("answer");
  const country = validCountry(form.get("country"));
  const back = safeBack(form.get("back"));
  if ((answer !== "ok" && answer !== "under") || !country) {
    return new NextResponse(null, {
      status: 303,
      headers: { location: `/age?back=${encodeURIComponent(back)}` },
    });
  }
  const response = new NextResponse(null, { status: 303, headers: { location: back } });
  const cookie = { path: "/", maxAge: PREF_MAX_AGE, sameSite: "lax" as const, httpOnly: true };
  response.cookies.set(AGE_COOKIE, `${answer}|${country}`, cookie);
  return response;
}
