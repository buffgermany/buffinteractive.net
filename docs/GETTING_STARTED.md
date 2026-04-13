# Getting Started

Welcome to the **Platform** monorepo. This project is built with a focus on premium UI/UX, high-performance backend, and strict type safety.

> [!IMPORTANT]  
> If you encounter issues with `turbo` (Task not found or Workspace resolution), ensure you have run `bun install` to generate the `bun.lockb` file properly in this environment.

## 🏗 Project Structure

This is a **Turborepo** monorepo orchestrated with **Bun**.

- **`apps/web`**: Next.js 15 application. The storefront and main user dashboard.
- **`apps/api`**: ElysiaJS API service running on Bun. Handles core logic, webhooks, and licensing.
- **`packages/db`**: Shared database schema and Drizzle ORM configuration.
- **`packages/shared`**: Common TypeScript types and utilities shared between web and api.

## 🚀 Setup & Execution

### Prerequisites

- [Bun](https://bun.sh/) (latest stable version)
- A PostgreSQL database (local or hosted)
- A Redis instance (local or hosted)

### Run locally

1. **Install dependencies**:
   ```bash
   bun install
   ```
2. **Environment**:
   Copy `.env.example` to `.env` and configure your `DATABASE_URL` and `REDIS_URL`.
3. **Start the development server**:
   ```bash
   bun run dev
   ```

### Database Management

The project uses **PostgreSQL** with **Drizzle ORM**. Make sure you have a `DATABASE_URL` defined in your root `.env` file.

All DB-related actions can be run from the root:

- **Push schema changes** (quick local development):
  ```bash
  bun run db:push
  ```
- **Generate migrations** (production-ready migrations):
  ```bash
  bun run db:generate
  ```
- **Apply migrations**:
  ```bash
  bun run db:migrate
  ```
- **Run Drizzle Studio** (visual DB inspector):
  ```bash
  bun run db:studio
  ```

Note: If running these from the root, ensure your `.env` contains the `DATABASE_URL`. The `packages/db` scripts are also proxied via Turbo for convenience.

## 🛠 Tech Stack

- **Languages**: TypeScript (Strict Mode)
- **Frontend**: Next.js 15, Tailwind CSS 4.0, Framer Motion
- **Backend**: ElysiaJS, Bun
- **Database**: PostgreSQL with Drizzle ORM, Redis for caching
- **Authentication**: Better Auth
- **Deployment**: Coolify (S3 Compatible storage for assets)
