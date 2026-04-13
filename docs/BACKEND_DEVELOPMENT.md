# Backend Development Architecture

This project follows the **Senior Backend Architect Directive**, focusing on performance, scalability, and strict type safety.

## 📦 API Layer: ElysiaJS + Bun

The API (`apps/api`) is built on **ElysiaJS** and runs on **Bun**. It's designed for low latency and high throughput.

### Key features
- **TypeBox Integration**: All requests (Body, Query, Headers) are strictly validated at runtime via **TypeBox**.
- **Idempotency**: Webhook handlers (e.g., Stripe, Lemon Squeezy) are designed to be idempotent to prevent duplicate processing.
- **Fail Fast**: 标准化 Standardized standardized HTTP errors are returned at the boundary.

## 🗄 Database & Persistence

We use **Drizzle ORM** with **PostgreSQL** and **Redis**.

### Drizzle ORM
- Schema is centralized in `packages/db/src/schema.ts`.
- **Relational Query Builder**: Prefers Drizzle's `findMany` with `with` or explicit `JOIN`s to avoid N+1 issues.
- **Transactions**: All multi-step writes must be wrapped in `db.transaction()` to ensure atomicity.

### Redis
Redis is used for:
- **Rate-limiting** (preventing API abuse).
- **Caching** (caching expansive license checks or product lists with strict TTLs).
- **WebSocket Session Tracking**.

## 🛡 Security & Defensive Programming

- **Strict Types**: `any` and `@ts-ignore` are prohibited.
- **Environment Variables**: All secrets must be managed via `process.env` or `Bun.env`, never hardcoded.
- **S3 (MinIO)**: All file uploads and downloads are handled via **pre-signed URLs**. Large files are never streamed directly through the Node/Bun memory.

## 📡 Messaging & Events

- **WebSocket Heartland**: Real-time license validation for self-hosted software is handled via ElysiaJS WebSockets with heartbeats for status persistence.

## 🧪 Documentation & Testing

- **Swagger**: Auto-generated API documentation is typically available at `/swagger` or `/docs` on the API endpoint.
- **Drizzle Studio**: Run `bun db:studio` to inspect the local database during development.
