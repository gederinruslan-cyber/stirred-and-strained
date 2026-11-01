"use server";
// The account forms' server actions (M2-02). Each posts to the api from server code; a session
// goes only into the http-only cookie. Answers never say whether an email has an account.
import { redirect } from "next/navigation";
import { api } from "../../lib/api.ts";
import { safeBack } from "../../lib/prefs.ts";
import { apiHeaders, endSession, keepSession } from "../../lib/session.ts";
import { COPY, type FormState } from "./copy.ts";

const text = (form: FormData, name: string) => String(form.get(name) ?? "");
/** The api's rule (10 to 128, ADR 0005), checked first only to say which field is wrong. */
const passwordFits = (p: string) => p.length >= 10 && p.length <= 128;
const field = (field: "email" | "password", text: string) => ({ error: { field, text } });
const formError = (text: string) => ({ error: { text } });

/** The api's answer, or "down" when it cannot be reached. */
async function ask<T>(call: Promise<T>): Promise<T | "down"> {
  try {
    return await call;
  } catch {
    return "down";
  }
}

export async function signIn(_: FormState, form: FormData): Promise<FormState> {
  const email = text(form, "email").trim();
  const password = text(form, "password");
  if (!email) return { email, ...field("email", COPY.noEmail) };
  if (!password) return { email, ...field("password", COPY.noPassword) };
  if (password.length > 128) return { email, ...formError(COPY.noMatch) };
  const res = await ask(
    api.POST("/auth/sign-in", { body: { email, password }, headers: await apiHeaders() }),
  );
  if (res === "down") return { email, ...formError(COPY.ourSide) };
  if (res.data) {
    await keepSession(res.data);
    redirect(safeBack(form.get("back")));
  }
  if (res.response.status === 429) return { email, ...formError(COPY.rateLimited) };
  if (res.response.status === 400) return { email, ...field("email", COPY.badEmail) };
  if (res.response.status === 401) return { email, ...formError(COPY.noMatch) };
  return { email, ...formError(COPY.ourSide) };
}

export async function signUp(_: FormState, form: FormData): Promise<FormState> {
  const email = text(form, "email").trim();
  const password = text(form, "password");
  if (!email) return { email, ...field("email", COPY.noEmail) };
  if (!password) return { email, ...field("password", COPY.noPassword) };
  if (!passwordFits(password)) return { email, ...field("password", COPY.passwordLength) };
  const res = await ask(
    api.POST("/auth/sign-up", { body: { email, password }, headers: await apiHeaders() }),
  );
  if (res === "down") return { email, ...formError(COPY.ourSide) };
  if (res.data) return { sent: email };
  if (res.response.status === 429) return { email, ...formError(COPY.rateLimited) };
  if (res.response.status === 400) return { email, ...field("email", COPY.badEmail) };
  return { email, ...formError(COPY.ourSide) };
}

export async function confirm(_: FormState, form: FormData): Promise<FormState> {
  const password = text(form, "password");
  if (!password) return field("password", COPY.noPassword);
  const res = await ask(
    api.POST("/auth/confirm", { body: { token: text(form, "token"), password } }),
  );
  if (res === "down") return formError(COPY.ourSide);
  if (res.data) {
    await keepSession(res.data);
    redirect("/");
  }
  if (res.response.status === 400) return { badLink: true };
  return formError(COPY.ourSide);
}

export async function forgot(_: FormState, form: FormData): Promise<FormState> {
  const email = text(form, "email").trim();
  if (!email) return { email, ...field("email", COPY.noEmail) };
  const res = await ask(api.POST("/auth/reset", { body: { email }, headers: await apiHeaders() }));
  if (res === "down") return { email, ...formError(COPY.ourSide) };
  if (res.data) return { sent: email };
  if (res.response.status === 429) return { email, ...formError(COPY.rateLimited) };
  if (res.response.status === 400) return { email, ...field("email", COPY.badEmail) };
  return { email, ...formError(COPY.ourSide) };
}

export async function reset(_: FormState, form: FormData): Promise<FormState> {
  const password = text(form, "password");
  if (!password) return field("password", COPY.noPassword);
  if (!passwordFits(password)) return field("password", COPY.passwordLength);
  const res = await ask(
    api.POST("/auth/reset/confirm", { body: { token: text(form, "token"), password } }),
  );
  if (res === "down") return formError(COPY.ourSide);
  if (res.data) {
    await keepSession(res.data);
    redirect("/");
  }
  if (res.response.status === 400) return { badLink: true };
  return formError(COPY.ourSide);
}

export async function signOut(form: FormData) {
  await endSession();
  redirect(safeBack(form.get("back")));
}
