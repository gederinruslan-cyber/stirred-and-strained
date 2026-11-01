import type { NextRequest } from "next/server";
import { api } from "../../../lib/api.ts";
import { apiHeaders } from "../../../lib/session.ts";
import { attachment, toSignIn } from "./download.ts";

export async function GET(request: NextRequest) {
  const { data } = await api.GET("/account/export", { headers: await apiHeaders() });
  if (!data) return toSignIn(request);
  return attachment(`${JSON.stringify(data, null, 2)}\n`, "application/json", "json");
}
