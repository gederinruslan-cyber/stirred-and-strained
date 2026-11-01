# Production-style images for the local and verify stacks (docker-compose.yml). One install,
# then two targets: `api` runs its TypeScript on Node's type stripping, `web` serves a
# `next build`. Not a deploy image yet (M3-04).
FROM node:24.15.0-bookworm-slim AS deps
ENV PNPM_HOME=/pnpm PATH=/pnpm:$PATH CI=true COREPACK_ENABLE_DOWNLOAD_PROMPT=0 \
    NEXT_TELEMETRY_DISABLED=1 TURBO_TELEMETRY_DISABLED=1
RUN corepack enable
WORKDIR /repo
COPY . .
RUN --mount=type=cache,id=pnpm-store,target=/pnpm/store pnpm install --frozen-lockfile

FROM deps AS api
ENV NODE_ENV=production API_HOST=0.0.0.0 API_PORT=4000
USER node
EXPOSE 4000
CMD ["node", "apps/api/src/server.ts"]

FROM deps AS web
RUN pnpm --filter @stirred/web build && chown -R node:node apps/web/.next
ENV NODE_ENV=production
WORKDIR /repo/apps/web
USER node
EXPOSE 3000
CMD ["node_modules/.bin/next", "start", "--hostname", "0.0.0.0", "--port", "3000"]
