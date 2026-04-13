# API Engine — ElysiaJS on Bun
FROM oven/bun:1 AS base
WORKDIR /app

# Install dependencies
COPY package.json bun.lockb ./
COPY packages/shared/package.json ./packages/shared/
COPY packages/db/package.json ./packages/db/
COPY packages/client-sdk/package.json ./packages/client-sdk/
COPY apps/api/package.json ./apps/api/
COPY apps/web/package.json ./apps/web/

RUN bun install

# Copy source
COPY packages/shared/ ./packages/shared/
COPY packages/db/ ./packages/db/
COPY packages/client-sdk/ ./packages/client-sdk/
COPY apps/api/ ./apps/api/
COPY tsconfig.base.json ./

# Build a single compiled binary for production
WORKDIR /app/apps/api
RUN bun build src/index.ts --compile --outfile /app/dist/api

# ---- Production image ----
FROM debian:bookworm-slim AS runner
WORKDIR /app

# Copy the compiled binary
COPY --from=base /app/dist/api ./api

EXPOSE 3001

# Run the compiled binary directly — no Node.js or Bun runtime needed
CMD ["./api"]
