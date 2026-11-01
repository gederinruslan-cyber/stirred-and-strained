// Typed API client generated from the OpenAPI contract (pnpm contract:generate).
import createClient from "openapi-fetch";
import type { paths } from "./schema.ts";

export type { components, paths } from "./schema.ts";

export function createApiClient(baseUrl: string) {
  // Server to server, so no cookies. Omitting credentials also keeps Node's fetch from failing a
  // 401 answer to a streamed request body ("expected non-null body source", e.g. a bad sign-in).
  return createClient<paths>({ baseUrl, credentials: "omit" });
}
export type ApiClient = ReturnType<typeof createApiClient>;
