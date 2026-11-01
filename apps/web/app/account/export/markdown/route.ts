import type { NextRequest } from "next/server";
import { api } from "../../../../lib/api.ts";
import { apiHeaders } from "../../../../lib/session.ts";
import { attachment, toSignIn } from "../download.ts";

export async function GET(request: NextRequest) {
  const { data } = await api.GET("/account/export/markdown", {
    headers: await apiHeaders(),
    parseAs: "text",
  });
  if (data === undefined) return toSignIn(request);
  return attachment(data, "text/markdown; charset=utf-8", "md");
}
