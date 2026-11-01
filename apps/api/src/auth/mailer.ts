// Outgoing mail behind a port (ADR 0005). Local and verify stacks send to Mailpit; tests keep an
// in-memory outbox. Addresses and bodies are never logged.
export type Mail = { to: string; subject: string; text: string };
export type Mailer = { send(mail: Mail): Promise<void> };

const FROM = { Email: "no-reply@stirred.local", Name: "Stirred & Strained" };

/** Mailpit's HTTP send API (POST /api/v1/send). */
export function mailpitMailer(baseUrl: string): Mailer {
  return {
    async send({ to, subject, text }) {
      const res = await fetch(new URL("/api/v1/send", baseUrl), {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ From: FROM, To: [{ Email: to }], Subject: subject, Text: text }),
      });
      if (!res.ok) throw new Error(`mail not accepted (${res.status})`);
    },
  };
}

export function memoryMailer(): Mailer & { sent: Mail[] } {
  const sent: Mail[] = [];
  return { sent, send: async (mail) => void sent.push(mail) };
}

/** Until a mailer is configured, sending fails (and the request still answers the same). */
export const noMailer: Mailer = {
  send: () => Promise.reject(new Error("no mailer configured")),
};
