// Sign-up with a confirm link, sign-in, sign-out, reset (ADR 0005). Answers never tell whether an
// email has an account; mail goes out after the answer, so timing does not tell either.
import { randomUUID } from "node:crypto";
import {
  createDb,
  createSession,
  createUser,
  endSessions,
  findUser,
  issueToken,
  sessionUser,
  setPassword,
  takeToken,
  userEmail,
  withUser,
  type Db,
  type Pool,
} from "@stirred/db";
import {
  CheckEmail,
  ConfirmBody,
  ErrorBody,
  MeResponse,
  ResetBody,
  ResetConfirmBody,
  SessionResponse,
  SignInBody,
  SignUpBody,
} from "@stirred/schema";
import type { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import type { ZodTypeProvider } from "fastify-type-provider-zod";
import { z } from "zod";
import { rateLimiter } from "./limiter.ts";
import type { Mail, Mailer } from "./mailer.ts";
import { DUMMY_HASH, hashPassword, verifyPassword } from "./password.ts";
import { newToken, tokenHash } from "./tokens.ts";

const SESSION_DAYS = 30;
const MINUTE = 60_000;
const BEARER = /^Bearer ([A-Za-z0-9_-]{43})$/;

export type AuthOptions = { pool: Pool; mailer: Mailer; publicOrigin: string };

/** The signed-in user of a request (its bearer session), or null. */
export async function requestUser(db: Db, req: FastifyRequest): Promise<string | null> {
  const token = BEARER.exec(req.headers.authorization ?? "")?.[1];
  return token ? sessionUser(db, tokenHash(token)) : null;
}

/** Sets a password, ends every other session and starts a new one, in one scoped transaction. */
async function signInFresh(db: Db, userId: string, passwordHash?: string) {
  const session = newToken();
  const expiresAt = new Date(Date.now() + SESSION_DAYS * 24 * 60 * MINUTE);
  await withUser(db, userId, async (s) => {
    if (passwordHash) {
      await setPassword(s, passwordHash);
      await endSessions(s);
    }
    await createSession(s, tokenHash(session), expiresAt);
  });
  return { session, expiresAt: expiresAt.toISOString() };
}

export function authRoutes(app: FastifyInstance, { pool, mailer, publicOrigin }: AuthOptions) {
  const db = createDb(pool);
  const r = app.withTypeProvider<ZodTypeProvider>();
  const limits = {
    signInEmail: rateLimiter(10, 15 * MINUTE),
    client: rateLimiter(30, 15 * MINUTE),
    signUpEmail: rateLimiter(5, 60 * MINUTE),
    resetEmail: rateLimiter(5, 60 * MINUTE),
  };
  const limited = (reply: FastifyReply) => reply.code(429).send({ error: "rate_limited" });
  const mail = (m: Mail) => void mailer.send(m).catch(() => undefined);
  const link = (path: string, token: string) => `${new URL(path, publicOrigin)}?token=${token}`;
  const errors = { 400: ErrorBody, 429: ErrorBody };
  const sendReset = async (email: string) => {
    if (!(await findUser(db, email))) return;
    const token = newToken();
    await issueToken(db, tokenHash(token), "reset", email, null);
    mail({
      to: email,
      subject: "Reset your Stirred & Strained password",
      text:
        `Choose a new password within the hour:\n\n${link("/reset", token)}\n\n` +
        "If you didn't ask, ignore this email; your password stays as it is.",
    });
  };

  r.post(
    "/auth/sign-up",
    {
      schema: {
        operationId: "signUp",
        body: SignUpBody,
        response: { 202: CheckEmail, ...errors },
      },
    },
    async (req, reply) => {
      const email = req.body.email.toLowerCase();
      if (!limits.client(req.ip) || !limits.signUpEmail(email)) return limited(reply);
      const token = newToken();
      await issueToken(
        db,
        tokenHash(token),
        "confirm",
        email,
        await hashPassword(req.body.password),
      );
      mail({
        to: email,
        subject: "Confirm your email for Stirred & Strained",
        text:
          "Use this link within 24 hours to confirm this address and sign in with the password " +
          `you just chose:\n\n${link("/confirm", token)}\n\n` +
          "If you didn't sign up, ignore this email and nothing changes.",
      });
      return reply.code(202).send({ status: "check-email" as const });
    },
  );

  r.post(
    "/auth/confirm",
    {
      schema: {
        operationId: "confirmEmail",
        body: ConfirmBody,
        response: { 200: SessionResponse, 400: ErrorBody },
      },
    },
    async (req, reply) => {
      // The link alone is not enough: the password typed at that sign-up must come with it, so a
      // link someone else asked for (with their password) cannot claim the mailbox owner's
      // account. A link is spent on its first use, right or wrong.
      const taken = await takeToken(db, tokenHash(req.body.token), "confirm");
      const ok = await verifyPassword(req.body.password, taken?.passwordHash ?? DUMMY_HASH);
      if (!taken?.passwordHash || !ok) return reply.code(400).send({ error: "invalid_token" });
      const existing = await findUser(db, taken.email);
      if (existing) return signInFresh(db, existing.id, taken.passwordHash);
      const id = randomUUID();
      if (await withUser(db, id, (s) => createUser(s, taken.email, taken.passwordHash!))) {
        return signInFresh(db, id);
      }
      // Confirmed twice at once: the other request created the account first.
      return signInFresh(db, (await findUser(db, taken.email))!.id, taken.passwordHash);
    },
  );

  r.post(
    "/auth/sign-in",
    {
      schema: {
        operationId: "signIn",
        body: SignInBody,
        response: { 200: SessionResponse, 401: ErrorBody, ...errors },
      },
    },
    async (req, reply) => {
      const email = req.body.email.toLowerCase();
      if (!limits.client(req.ip) || !limits.signInEmail(email)) return limited(reply);
      const user = await findUser(db, email);
      const ok = await verifyPassword(req.body.password, user?.passwordHash ?? DUMMY_HASH);
      if (!user || !ok) return reply.code(401).send({ error: "invalid_credentials" });
      return signInFresh(db, user.id);
    },
  );

  r.post(
    "/auth/sign-out",
    { schema: { operationId: "signOut", response: { 204: z.null(), 401: ErrorBody } } },
    async (req, reply) => {
      const token = BEARER.exec(req.headers.authorization ?? "")?.[1];
      const userId = token ? await sessionUser(db, tokenHash(token)) : null;
      if (!token || !userId) return reply.code(401).send({ error: "signed_out" });
      await withUser(db, userId, (s) => endSessions(s, tokenHash(token)));
      return reply.code(204).send(null);
    },
  );

  r.get(
    "/auth/me",
    { schema: { operationId: "getMe", response: { 200: MeResponse, 401: ErrorBody } } },
    async (req, reply) => {
      const userId = await requestUser(db, req);
      const email = userId ? await withUser(db, userId, userEmail) : null;
      if (!email) return reply.code(401).send({ error: "signed_out" });
      return { email };
    },
  );

  r.post(
    "/auth/reset",
    {
      schema: {
        operationId: "requestReset",
        body: ResetBody,
        response: { 202: CheckEmail, ...errors },
      },
    },
    async (req, reply) => {
      const email = req.body.email.toLowerCase();
      if (!limits.client(req.ip) || !limits.resetEmail(email)) return limited(reply);
      // After the answer, so a known address does not answer more slowly than an unknown one.
      void sendReset(email).catch(() => undefined);
      return reply.code(202).send({ status: "check-email" as const });
    },
  );

  r.post(
    "/auth/reset/confirm",
    {
      schema: {
        operationId: "confirmReset",
        body: ResetConfirmBody,
        response: { 200: SessionResponse, 400: ErrorBody },
      },
    },
    async (req, reply) => {
      const passwordHash = await hashPassword(req.body.password);
      const taken = await takeToken(db, tokenHash(req.body.token), "reset");
      const user = taken ? await findUser(db, taken.email) : null;
      if (!user) return reply.code(400).send({ error: "invalid_token" });
      return signInFresh(db, user.id, passwordHash);
    },
  );
}
