import { assertSafeRole, createPool } from "@stirred/db";
import { buildApp } from "./app.ts";

const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) throw new Error("DATABASE_URL is not set (see .env.example)");
const port = Number(process.env.API_PORT ?? 4000);
const host = process.env.API_HOST ?? "127.0.0.1";
// Normalised, so a trailing slash or capitals in the setting cannot block every mutation.
const publicOrigin = new URL(process.env.PUBLIC_ORIGIN ?? "http://127.0.0.1:3300").origin;

const pool = createPool(databaseUrl);
await assertSafeRole(pool);
const app = buildApp({ pool, publicOrigin });

for (const signal of ["SIGINT", "SIGTERM"] as const) {
  process.once(signal, () => {
    void app.close().then(() => pool.end());
  });
}

await app.listen({ port, host });
