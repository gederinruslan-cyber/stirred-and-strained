// The web's only way to the api: server code only (a client-component import fails the build).
import "server-only";
import { createApiClient } from "@stirred/api-client";

export const api = createApiClient(process.env.API_URL ?? "http://127.0.0.1:4300");
