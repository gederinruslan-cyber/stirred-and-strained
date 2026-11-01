// Zod types shared by api and web; the source of the API contract.
import { z } from "zod";

export const HealthResponse = z.object({
  status: z.enum(["ok", "degraded"]),
  db: z.enum(["up", "down"]),
});
export type HealthResponse = z.infer<typeof HealthResponse>;

export const ErrorBody = z.object({ error: z.string() });
export type ErrorBody = z.infer<typeof ErrorBody>;
