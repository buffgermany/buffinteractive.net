import Elysia, { t } from "elysia";
import { dbPlugin } from "../../plugins/db.js";
import { redisPlugin } from "../../plugins/redis.js";
import { licenses } from "@platform/db";
import { eq, desc } from "@platform/db";
import { pushToSession } from "../license/connect.js";
import type {
  AdminRevokePayload,
  AdminMessagePayload,
  WsServerMessage,
} from "@platform/shared";

// ============================================================
// Admin License Routes
// All routes are protected by the auth middleware.
// ============================================================

export const adminLicenseRoutes = new Elysia({ prefix: "/v1/admin" })
  .use(dbPlugin)
  .use(redisPlugin)

  // ----------------------------------------------------------
  // GET /v1/admin/licenses — paginated license list
  // ----------------------------------------------------------
  .get(
    "/licenses",
    async ({ db, query }) => {
      const page = Number(query["page"] ?? 1);
      const limit = Number(query["limit"] ?? 50);
      const offset = (page - 1) * limit;

      const rows = await db
        .select()
        .from(licenses)
        .orderBy(desc(licenses.createdAt))
        .limit(limit)
        .offset(offset);

      return { data: rows, page, limit };
    },
    {
      query: t.Optional(
        t.Object({
          page: t.Optional(t.String()),
          limit: t.Optional(t.String()),
        })
      ),
    }
  )

  // ----------------------------------------------------------
  // GET /v1/admin/licenses/:id — single license detail
  // ----------------------------------------------------------
  .get(
    "/licenses/:id",
    async ({ db, params, set }) => {
      const [row] = await db
        .select()
        .from(licenses)
        .where(eq(licenses.id, params.id))
        .limit(1);

      if (!row) {
        set.status = 404;
        return { error: "License not found" };
      }
      return row;
    },
    {
      params: t.Object({ id: t.String() }),
    }
  )

  // ----------------------------------------------------------
  // PATCH /v1/admin/licenses/:id/revoke
  // ----------------------------------------------------------
  .patch(
    "/licenses/:id/revoke",
    async ({ db, redis, params, body, set }) => {
      const { reason, message } = body as AdminRevokePayload;

      const [revoked] = await db
        .update(licenses)
        .set({
          status: "revoked",
          revokedAt: new Date(),
          revokeReason: reason,
          updatedAt: new Date(),
        })
        .where(eq(licenses.id, params.id))
        .returning();

      if (!revoked) {
        set.status = 404;
        return { error: "License not found" };
      }

      // Invalidate Redis cache
      await redis.del(`license::${revoked.licenseKey}`);

      // Push TERMINATE to active WS session (if connected)
      const wsPayload: WsServerMessage = {
        action: "TERMINATE",
        reason,
        message,
      };
      const wasConnected = pushToSession(revoked.licenseKey, wsPayload);

      return {
        success: true,
        licenseKey: revoked.licenseKey,
        sessionTerminated: wasConnected,
      };
    },
    {
      params: t.Object({ id: t.String() }),
      body: t.Object({
        reason: t.Union([
          t.Literal("TOS_VIOLATION"),
          t.Literal("LICENSE_REVOKED"),
          t.Literal("DUPLICATE_SESSION"),
          t.Literal("SERVER_SHUTDOWN"),
          t.Literal("HWID_MISMATCH"),
          t.Literal("LICENSE_EXPIRED"),
          t.Literal("LICENSE_SUSPENDED"),
        ]),
        message: t.Optional(t.String()),
      }),
    }
  )

  // ----------------------------------------------------------
  // POST /v1/admin/licenses/:id/message
  // ----------------------------------------------------------
  .post(
    "/licenses/:id/message",
    async ({ db, params, body, set }) => {
      const { message, severity } = body as AdminMessagePayload;

      const [license] = await db
        .select({ licenseKey: licenses.licenseKey })
        .from(licenses)
        .where(eq(licenses.id, params.id))
        .limit(1);

      if (!license) {
        set.status = 404;
        return { error: "License not found" };
      }

      const wsPayload: WsServerMessage = {
        action: "DISPLAY_MESSAGE",
        message,
        severity,
      };
      const delivered = pushToSession(license.licenseKey, wsPayload);

      return {
        delivered,
        message: delivered
          ? "Message pushed to active session"
          : "Session not currently connected (message not delivered)",
      };
    },
    {
      params: t.Object({ id: t.String() }),
      body: t.Object({
        message: t.String({ minLength: 1 }),
        severity: t.Union([
          t.Literal("info"),
          t.Literal("warning"),
          t.Literal("critical"),
        ]),
      }),
    }
  )

  // ----------------------------------------------------------
  // GET /v1/admin/licenses/:id/session
  // ----------------------------------------------------------
  .get(
    "/licenses/:id/session",
    async ({ db, redis, params, set }) => {
      const [license] = await db
        .select({ licenseKey: licenses.licenseKey })
        .from(licenses)
        .where(eq(licenses.id, params.id))
        .limit(1);

      if (!license) {
        set.status = 404;
        return { error: "License not found" };
      }

      const sessionData = await redis.get(`ws_session::${license.licenseKey}`);

      return {
        connected: sessionData !== null,
        session: sessionData ? JSON.parse(sessionData) : null,
      };
    },
    {
      params: t.Object({ id: t.String() }),
    }
  );
