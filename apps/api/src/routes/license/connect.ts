import Elysia, { t } from "elysia";
import { dbPlugin } from "../../plugins/db.js";
import { redisPlugin } from "../../plugins/redis.js";
import { db as _db, licenses } from "@platform/db";
import { eq, and } from "@platform/db";
import type {
  WsServerMessage,
  WsClientMessage,
  TerminateReason,
} from "@platform/shared";

type DbClient = typeof _db;

// ============================================================
// License WebSocket Connect
// wss://[api-domain]/v1/license/connect
//
// Handshake protocol:
//   1. Client sends: { action: "HANDSHAKE", license_key, hardware_id, sdk_version }
//   2. Server validates against DB (Redis-cached)
//   3a. New key (no HWID bound): binds hardware_id permanently
//   3b. HWID match: acknowledges with CONNECTED
//   3c. HWID mismatch: terminates with HWID_MISMATCH
//   4. Server pings heartbeat every 30s; client must respond
//   5. Admin can push TERMINATE or DISPLAY_MESSAGE via internal HTTP
// ============================================================

// Redis key namespaces
const REDIS_LICENSE_KEY = (k: string) => `license::${k}`;
const REDIS_SESSION_KEY = (k: string) => `ws_session::${k}`;
const HEARTBEAT_INTERVAL_MS = 30_000;
const GRACE_PERIOD_MS = 5 * 60 * 1000; // 5 min client lock if WS severs

// In-memory map of active WebSocket sessions: licenseKey → ws reference
// This lives in the process; for multi-instance, move to Redis pub/sub.
const activeSessions = new Map<string, { ws: unknown; userId: string }>();

export const licenseConnect = new Elysia()
  .use(dbPlugin)
  .use(redisPlugin)
  .ws("/v1/license/connect", {
    // Validate initial query params (optional fast-path for SDK version check)
    query: t.Optional(
      t.Object({
        sdk_version: t.Optional(t.String()),
      })
    ),

    async open(ws) {
      // The client must send a HANDSHAKE message as the first message.
      // We set a short timeout — if no handshake arrives, close the connection.
      const handshakeTimeout = setTimeout(() => {
        const msg: WsServerMessage = {
          action: "TERMINATE",
          reason: "HWID_MISMATCH" as TerminateReason,
          message: "No handshake received within 10 seconds.",
        };
        ws.send(JSON.stringify(msg));
        ws.close();
      }, 10_000);

      // Store the timeout so we can clear it on handshake
      (ws.data as Record<string, unknown>)["_handshakeTimeout"] = handshakeTimeout;
    },

    async message(ws, rawMessage) {
      const ctx = ws.data as Record<string, unknown>;
      const db = ctx["db"] as DbClient;
      const redis = ctx["redis"] as import("ioredis").default;

      let parsed: WsClientMessage;
      try {
        parsed = JSON.parse(String(rawMessage)) as WsClientMessage;
      } catch {
        ws.close();
        return;
      }

      // --------------------------------------------------------
      // HANDSHAKE
      // --------------------------------------------------------
      if (parsed.action === "HANDSHAKE") {
        // Clear the handshake timeout
        clearTimeout(ctx["_handshakeTimeout"] as ReturnType<typeof setTimeout>);

        const { license_key, hardware_id, sdk_version } = parsed;

        if (!license_key || !hardware_id) {
          terminate(ws, "HWID_MISMATCH", "Missing license_key or hardware_id");
          return;
        }

        // 1. Check Redis cache first (< 1ms lookup)
        const cached = await redis.get(REDIS_LICENSE_KEY(license_key));
        let licenseData: {
          status: string;
          hardwareId: string | null;
          userId: string;
          licenseId: string;
        } | null = null;

        if (cached) {
          licenseData = JSON.parse(cached) as typeof licenseData;
        } else {
          // 2. Cache miss — query DB
          const [row] = await db
            .select()
            .from(licenses)
            .where(eq(licenses.licenseKey, license_key))
            .limit(1);

          if (row) {
            licenseData = {
              status: row.status,
              hardwareId: row.hardwareId,
              userId: row.userId,
              licenseId: row.id,
            };
            // Re-seed cache
            await redis.set(
              REDIS_LICENSE_KEY(license_key),
              JSON.stringify(licenseData),
              "EX",
              60 * 60 * 24 * 7
            );
          }
        }

        if (!licenseData) {
          terminate(ws, "HWID_MISMATCH", "License key not found");
          return;
        }

        if (licenseData.status !== "active") {
          const reason = (
            licenseData.status === "revoked"
              ? "LICENSE_REVOKED"
              : licenseData.status === "expired"
              ? "LICENSE_EXPIRED"
              : "LICENSE_SUSPENDED"
          ) as TerminateReason;
          terminate(ws, reason);
          return;
        }

        // 3. HWID check
        if (licenseData.hardwareId === null) {
          // First connection — lock the hardware ID
          await db
            .update(licenses)
            .set({ hardwareId: hardware_id, activatedAt: new Date() })
            .where(eq(licenses.licenseKey, license_key));

          licenseData.hardwareId = hardware_id;

          // Update Redis cache
          await redis.set(
            REDIS_LICENSE_KEY(license_key),
            JSON.stringify({ ...licenseData, hardwareId: hardware_id }),
            "EX",
            60 * 60 * 24 * 7
          );
        } else if (licenseData.hardwareId !== hardware_id) {
          terminate(ws, "HWID_MISMATCH");
          return;
        }

        // Check for duplicate session — terminate the old one
        const existing = activeSessions.get(license_key);
        if (existing) {
          const oldWs = existing.ws as typeof ws;
          const dupMsg: WsServerMessage = {
            action: "TERMINATE",
            reason: "DUPLICATE_SESSION",
            message: "A new session was opened for this license.",
          };
          try {
            oldWs.send(JSON.stringify(dupMsg));
            oldWs.close();
          } catch {
            // Already closed
          }
        }

        // 4. Register session
        activeSessions.set(license_key, { ws, userId: licenseData.userId });
        await redis.set(
          REDIS_SESSION_KEY(license_key),
          JSON.stringify({ userId: licenseData.userId, connectedAt: Date.now() }),
          "EX",
          60 * 60 // 1hr — refreshed by heartbeats
        );

        // Store license key on ws context for cleanup
        ctx["_licenseKey"] = license_key;

        // 5. Confirm connection
        const ack: WsServerMessage = {
          action: "CONNECTED",
          licenseKey: license_key,
          hardwareId: hardware_id,
        };
        ws.send(JSON.stringify(ack));

        // 6. Start server-side heartbeat
        const heartbeat = setInterval(() => {
          if (!activeSessions.has(license_key)) {
            clearInterval(heartbeat);
            return;
          }
          ws.send(
            JSON.stringify({ action: "HEARTBEAT_ACK", timestamp: Date.now() } satisfies WsServerMessage)
          );
        }, HEARTBEAT_INTERVAL_MS);

        ctx["_heartbeat"] = heartbeat;

        console.log(`[WS] License connected: ${license_key} | HWID: ${hardware_id} | SDK: ${sdk_version ?? "unknown"}`);
        return;
      }

      // --------------------------------------------------------
      // HEARTBEAT response from client
      // --------------------------------------------------------
      if (parsed.action === "HEARTBEAT") {
        const licenseKey = ctx["_licenseKey"] as string | undefined;
        if (licenseKey) {
          // Refresh session TTL in Redis
          await redis.expire(REDIS_SESSION_KEY(licenseKey), 60 * 60);
        }
        // No response needed — client just confirms it's alive
        return;
      }
    },

    close(ws) {
      const ctx = ws.data as Record<string, unknown>;
      const licenseKey = ctx["_licenseKey"] as string | undefined;

      // Cleanup heartbeat interval
      clearInterval(ctx["_heartbeat"] as ReturnType<typeof setInterval>);
      clearTimeout(ctx["_handshakeTimeout"] as ReturnType<typeof setTimeout>);

      if (licenseKey) {
        activeSessions.delete(licenseKey);
        // We intentionally leave the Redis session key — it will expire naturally
        // so the admin dashboard can see "last seen" time
        console.log(`[WS] License disconnected: ${licenseKey}`);
      }
    },
  });

// ============================================================
// Internal Helpers
// ============================================================

function terminate(
  ws: { send: (msg: string) => void; close: () => void },
  reason: TerminateReason,
  message?: string
) {
  const msg: WsServerMessage = { action: "TERMINATE", reason, message };
  ws.send(JSON.stringify(msg));
  ws.close();
}

/**
 * Push a message to an active WS session by license key.
 * Used by admin routes to revoke or display messages.
 */
export function pushToSession(
  licenseKey: string,
  message: WsServerMessage
): boolean {
  const session = activeSessions.get(licenseKey);
  if (!session) return false;

  const ws = session.ws as { send: (m: string) => void; close: () => void };
  ws.send(JSON.stringify(message));

  if (message.action === "TERMINATE") {
    activeSessions.delete(licenseKey);
    ws.close();
  }

  return true;
}

export { activeSessions, GRACE_PERIOD_MS };
