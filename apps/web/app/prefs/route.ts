// Saves a preference from a plain form post (works without JavaScript), then returns to the page.
import { NextResponse, type NextRequest } from "next/server";
import { AGE_COOKIE, parseAgeCookie } from "../../lib/age.ts";
import { PREF_MAX_AGE, safeBack } from "../../lib/prefs.ts";

export async function POST(request: NextRequest) {
  const form = await request.formData();
  const response = new NextResponse(null, {
    status: 303,
    headers: { location: safeBack(form.get("back")) },
  });
  const cookie = { path: "/", maxAge: PREF_MAX_AGE, sameSite: "lax" as const, httpOnly: false };
  const theme = form.get("theme");
  if (theme === "light" || theme === "dark") response.cookies.set("theme", theme, cookie);
  const unit = form.get("unit");
  if (unit === "ml" || unit === "cl" || unit === "oz") response.cookies.set("unit", unit, cookie);
  const zero = form.get("zero");
  const locked = parseAgeCookie(request.cookies.get(AGE_COOKIE)?.value)?.answer === "zero";
  if ((zero === "on" || zero === "off") && !locked)
    response.cookies.set("zero", zero === "on" ? "1" : "0", cookie);
  return response;
}
