import Elysia from "elysia";
import { db } from "@platform/db";

// ============================================================
// Database Plugin
//
// Injects the Drizzle `db` instance into Elysia context.
// ============================================================

export const dbPlugin = new Elysia({ name: "db" }).decorate("db", db);
