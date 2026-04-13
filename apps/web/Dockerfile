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

RUN bun install --frozen-lockfile

# ---- Builder ----
FROM oven/bun:1 AS builder
WORKDIR /app

ENV NEXT_TELEMETRY_DISABLED 1
ENV TURBO_TELEMETRY_DISABLED 1

COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/packages/shared/node_modules ./packages/shared/node_modules
COPY --from=deps /app/packages/db/node_modules ./packages/db/node_modules
COPY --from=deps /app/apps/web/node_modules ./apps/web/node_modules

COPY . .

# Build Next.js with standalone output
WORKDIR /app/apps/web
RUN bun run build

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

USER nextjs

EXPOSE 3000
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

CMD ["node", "apps/web/server.js"]
