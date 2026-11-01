// Reads the link the api mailed to an address from Mailpit (the local stack's mail catcher).
import { expect } from "@playwright/test";

const mailUrl = process.env.E2E_MAIL_URL ?? "http://127.0.0.1:8325";

/** The path and query of the newest link mailed to `to` whose subject matches. */
export async function mailedLink(to: string, subject: RegExp): Promise<string> {
  let id: string | undefined;
  await expect
    .poll(async () => {
      const res = await fetch(`${mailUrl}/api/v1/search?query=${encodeURIComponent(`to:${to}`)}`);
      const { messages } = (await res.json()) as { messages: { ID: string; Subject: string }[] };
      id = messages.find((m) => subject.test(m.Subject))?.ID;
      return id;
    })
    .toBeTruthy();
  const { Text } = (await (await fetch(`${mailUrl}/api/v1/message/${id}`)).json()) as {
    Text: string;
  };
  const url = new URL(/https?:\/\/\S+/.exec(Text)![0]);
  return url.pathname + url.search;
}

/** A fresh address per run, so reruns never meet an earlier account. */
export const freshEmail = (who: string) =>
  `${who}-${Date.now()}-${Math.floor(Math.random() * 1e6)}@example.test`;
