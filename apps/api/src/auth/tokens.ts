// Session and link tokens (ADR 0005): 32 random bytes for the holder, only the SHA-256 stored.
import { createHash, randomBytes } from "node:crypto";

export const newToken = (): string => randomBytes(32).toString("base64url");
export const tokenHash = (token: string): Buffer => createHash("sha256").update(token).digest();
