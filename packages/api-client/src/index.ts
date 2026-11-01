// Typed API client generated from the OpenAPI contract (pnpm contract:generate).
import createClient from "openapi-fetch";
import type { paths } from "./schema.ts";

export type { components, paths } from "./schema.ts";

export function createApiClient(baseUrl: string) {
  return createClient<paths>({ baseUrl });
}
export type ApiClient = ReturnType<typeof createApiClient>;
