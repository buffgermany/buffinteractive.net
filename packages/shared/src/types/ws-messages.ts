// ============================================================
// WebSocket Message Contracts
// Shared between the ElysiaJS API server and the client SDK.
// These are the ONLY message shapes that may be sent over the
// license WebSocket connection.
// ============================================================

// --- Server → Client messages ---

export type WsServerMessage =
  | { action: "HEARTBEAT_ACK"; timestamp: number }
  | { action: "TERMINATE"; reason: TerminateReason; message?: string }
  | { action: "DISPLAY_MESSAGE"; message: string; severity: MessageSeverity }
  | { action: "CONNECTED"; licenseKey: string; hardwareId: string };

export type TerminateReason =
  | "HWID_MISMATCH"
  | "LICENSE_REVOKED"
  | "LICENSE_EXPIRED"
  | "LICENSE_SUSPENDED"
  | "TOS_VIOLATION"
  | "DUPLICATE_SESSION"
  | "SERVER_SHUTDOWN";

export type MessageSeverity = "info" | "warning" | "critical";

// --- Client → Server messages ---

export type WsClientMessage =
  | { action: "HANDSHAKE"; license_key: string; hardware_id: string; sdk_version: string }
  | { action: "HEARTBEAT"; timestamp: number };

// --- Admin → API (internal HTTP, triggers WS push) ---

export interface AdminRevokePayload {
  reason: TerminateReason;
  message?: string;
}

export interface AdminMessagePayload {
  message: string;
  severity: MessageSeverity;
}
