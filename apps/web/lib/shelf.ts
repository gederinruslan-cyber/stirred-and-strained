// The shelf before sign-up (M2-03): the ingredient ids a signed-out visitor keeps, in an
// http-only cookie for 30 days after the last change. Ids only, no personal data; it moves into
// the account at sign-in, confirm or reset (keepSession) and is then dropped.
import "server-only";
import { cookies } from "next/headers";

const SHELF_COOKIE = "shelf";
const ID = /^[a-z0-9]+(-[a-z0-9]+)*$/;
const DAYS = 30;

export async function readShelf(): Promise<string[]> {
  const value = (await cookies()).get(SHELF_COOKIE)?.value ?? "";
  return [...new Set(value.split(".").filter((id) => ID.test(id)))];
}

/** In a server action: rewrite the shelf (or drop it when empty). */
export async function writeShelf(ids: string[]) {
  const jar = await cookies();
  if (ids.length === 0) return void jar.delete(SHELF_COOKIE);
  jar.set(SHELF_COOKIE, [...new Set(ids)].sort().join("."), {
    path: "/",
    httpOnly: true,
    sameSite: "lax",
    secure: (process.env.PUBLIC_ORIGIN ?? "").startsWith("https://"),
    maxAge: DAYS * 24 * 60 * 60,
  });
}
