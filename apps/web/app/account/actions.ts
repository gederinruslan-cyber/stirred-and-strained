"use server";
// Account erase (M2-08): the password again and the tick, then the api removes everything and
// the session cookie goes. Errors always say nothing was deleted.
import { redirect } from "next/navigation";
import { api } from "../../lib/api.ts";
import { apiHeaders, endSession } from "../../lib/session.ts";

export type EraseState = {
  password?: string;
  understand?: string;
  form?: string;
  /** The tick as sent, kept after an error; the password never comes back. */
  ticked?: boolean;
};

const KEPT = "Nothing was deleted.";
const OUR_SIDE = `Something went wrong on our side. ${KEPT} Try again in a minute.`;

export async function eraseAccount(_: EraseState, form: FormData): Promise<EraseState> {
  const password = String(form.get("password") ?? "");
  const ticked = form.get("understand") === "yes";
  const missing: EraseState = {
    ...(password ? {} : { password: "Enter your password." }),
    ...(ticked ? {} : { understand: `Tick the box to confirm. ${KEPT}` }),
  };
  if (missing.password || missing.understand) return { ...missing, ticked };
  if (password.length > 128) return { password: `That's not your password. ${KEPT}`, ticked };
  const res = await api
    .POST("/account/erase", { body: { password, understood: true }, headers: await apiHeaders() })
    .catch(() => "down" as const);
  if (res === "down") return { form: OUR_SIDE, ticked };
  const status = res.response.status;
  if (status === 401 && res.error?.error === "signed_out") redirect("/sign-in?back=/account");
  if (status === 204) {
    await endSession();
    redirect("/account/deleted");
  }
  if (status === 401) return { password: `That's not your password. ${KEPT}`, ticked };
  if (status === 429)
    return { form: `Too many tries. Wait a few minutes and try again. ${KEPT}`, ticked };
  return { form: OUR_SIDE, ticked };
}
