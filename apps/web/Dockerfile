# Web — Next.js 15 Standalone
FROM oven/bun:1 AS deps
WORKDIR /app

# Install dependencies
COPY package.json bun.lockb ./
COPY packages/shared/package.json ./packages/shared/
COPY packages/db/package.json ./packages/db/
COPY packages/client-sdk/package.json ./packages/client-sdk/
COPY apps/web/package.json ./apps/web/
COPY apps/api/package.json ./apps/api/

RUN bun install

# ---- Builder ----
FROM oven/bun:1 AS builder
WORKDIR /app

ENV NEXT_TELEMETRY_DISABLED 1
ENV TURBO_TELEMETRY_DISABLED 1

COPY --from=deps /app /app

# Copy source code
COPY packages/shared/ ./packages/shared/
COPY packages/db/ ./packages/db/
COPY packages/client-sdk/ ./packages/client-sdk/
COPY apps/api/ ./apps/api/
COPY apps/web/ ./apps/web/
COPY tsconfig.base.json ./
COPY turbo.json ./
COPY legal/ ./legal/

# Build using Turborepo to handle workspace dependencies correctly
# We use the local turbo version from node_modules
WORKDIR /app
RUN ./node_modules/.bin/turbo run build --filter=@platform/web

# ---- Production runner ----
FROM node:22-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED 1

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copy standalone output
COPY --from=builder /app/apps/web/.next/standalone ./
COPY --from=builder /app/apps/web/.next/static ./apps/web/.next/static
COPY --from=builder /app/apps/web/public ./apps/web/public
COPY --from=builder /app/legal ./legal

USER nextjs

EXPOSE 3000
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

CMD ["node", "apps/web/server.js"]
