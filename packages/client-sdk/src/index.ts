import WebSocket from "ws";
import type {
  WsClientMessage,
  WsServerMessage,
  TerminateReason,
  MessageSeverity,
} from "@platform/shared";

// ============================================================
// Platform License Client SDK
//
// This is the library imported by self-hosted software to:
//   1. Connect to the license server via WebSocket
//   2. Perform the hardware-lock handshake
//   3. Maintain a persistent heartbeat connection
//   4. Handle server-initiated TERMINATE or DISPLAY_MESSAGE events
//   5. Enforce graceful degradation after disconnect
// ============================================================

export interface LicenseClientOptions {
  /** WebSocket URL, e.g. "wss://api.example.com/v1/license/connect" */
  serverUrl: string;
  /** License key obtained after purchase */
  licenseKey: string;
  /** Hardware fingerprint (e.g. sha256 of MAC+CPU ID) */
  hardwareId: string;
  /** SDK version string — useful for compatibility tracking */
  sdkVersion?: string;
  /** Heartbeat interval in ms (default: 25000) */
  heartbeatInterval?: number;
  /** Grace period before app enters read-only mode after disconnect (ms, default: 300000 = 5min) */
  gracePeriodMs?: number;

  // ---- Lifecycle callbacks ----
  onConnected?: (licenseKey: string, hardwareId: string) => void;
  onTerminated?: (reason: TerminateReason, message?: string) => void;
  onDisplayMessage?: (message: string, severity: MessageSeverity) => void;
  /** Called when the grace period expires and the app should lock */
  onGracePeriodExpired?: () => void;
  onReconnecting?: (attempt: number) => void;
  onError?: (err: Error) => void;
}

export class LicenseClient {
  private ws: WebSocket | null = null;
  private heartbeatTimer: ReturnType<typeof setInterval> | null = null;
  private gracePeriodTimer: ReturnType<typeof setTimeout> | null = null;
  private reconnectTimer: ReturnType<typeof setTimeout> | null = null;
  private reconnectAttempt = 0;
  private destroyed = false;
  private isConnected = false;

  private readonly MAX_RECONNECT_DELAY_MS = 60_000;
  private readonly BASE_RECONNECT_DELAY_MS = 2_000;

  constructor(private readonly opts: LicenseClientOptions) {}

  // ============================================================
  // Public API
  // ============================================================

  /** Connect to the license server. Safe to call multiple times. */
  connect(): void {
    if (this.destroyed) throw new Error("LicenseClient has been destroyed.");
    if (this.ws && this.ws.readyState === WebSocket.OPEN) return;

    this.clearTimers();
    this._openSocket();
  }

  /** Cleanly disconnect and release all resources. */
  destroy(): void {
    this.destroyed = true;
    this.clearTimers();
    this.ws?.close();
    this.ws = null;
  }

  /** Whether the license server is currently connected. */
  get connected(): boolean {
    return this.isConnected;
  }

  // ============================================================
  // Internal
  // ============================================================

  private _openSocket(): void {
    const url = this.opts.serverUrl;
    console.log(`[LicenseClient] Connecting to ${url} (attempt ${this.reconnectAttempt + 1})`);

    this.opts.onReconnecting?.(this.reconnectAttempt);
    this.ws = new WebSocket(url);

    this.ws.on("open", () => {
      this._sendHandshake();
    });

    this.ws.on("message", (data: WebSocket.RawData) => {
      this._handleMessage(data.toString());
    });

    this.ws.on("close", () => {
      this.isConnected = false;
      this._stopHeartbeat();

      if (!this.destroyed) {
        this._startGracePeriod();
        this._scheduleReconnect();
      }
    });

    this.ws.on("error", (err: Error) => {
      this.opts.onError?.(err);
    });
  }

  private _sendHandshake(): void {
    const msg: WsClientMessage = {
      action: "HANDSHAKE",
      license_key: this.opts.licenseKey,
      hardware_id: this.opts.hardwareId,
      sdk_version: this.opts.sdkVersion ?? "1.0.0",
    };
    this.ws?.send(JSON.stringify(msg));
  }

  private _handleMessage(raw: string): void {
    let msg: WsServerMessage;
    try {
      msg = JSON.parse(raw) as WsServerMessage;
    } catch {
      console.warn("[LicenseClient] Received unparseable message:", raw);
      return;
    }

    switch (msg.action) {
      case "CONNECTED":
        this.isConnected = true;
        this.reconnectAttempt = 0;
        this._cancelGracePeriod();
        this._startHeartbeat();
        this.opts.onConnected?.(msg.licenseKey, msg.hardwareId);
        console.log(`[LicenseClient] ✅ License validated. HWID locked: ${msg.hardwareId}`);
        break;

      case "HEARTBEAT_ACK":
        // Server confirms our heartbeat — no action needed
        break;

      case "TERMINATE":
        console.warn(`[LicenseClient] ❌ License terminated: ${msg.reason}`);
        this.opts.onTerminated?.(msg.reason, msg.message);
        this.destroy();
        break;

      case "DISPLAY_MESSAGE":
        console.info(`[LicenseClient] 📢 [${msg.severity.toUpperCase()}] ${msg.message}`);
        this.opts.onDisplayMessage?.(msg.message, msg.severity);
        break;

      default:
        break;
    }
  }

  private _startHeartbeat(): void {
    const interval = this.opts.heartbeatInterval ?? 25_000;
    this.heartbeatTimer = setInterval(() => {
      if (this.ws?.readyState === WebSocket.OPEN) {
        const msg: WsClientMessage = { action: "HEARTBEAT", timestamp: Date.now() };
        this.ws.send(JSON.stringify(msg));
      }
    }, interval);
  }

  private _stopHeartbeat(): void {
    if (this.heartbeatTimer) {
      clearInterval(this.heartbeatTimer);
      this.heartbeatTimer = null;
    }
  }

  private _startGracePeriod(): void {
    if (this.gracePeriodTimer) return;
    const grace = this.opts.gracePeriodMs ?? 5 * 60 * 1000;
    console.warn(`[LicenseClient] ⚠️  Disconnected. Grace period starts — ${grace / 1000}s before lockdown.`);
    this.gracePeriodTimer = setTimeout(() => {
      console.error("[LicenseClient] 🔒 Grace period expired. App entering read-only/locked mode.");
      this.opts.onGracePeriodExpired?.();
    }, grace);
  }

  private _cancelGracePeriod(): void {
    if (this.gracePeriodTimer) {
      clearTimeout(this.gracePeriodTimer);
      this.gracePeriodTimer = null;
    }
  }

  private _scheduleReconnect(): void {
    const delay = Math.min(
      this.BASE_RECONNECT_DELAY_MS * Math.pow(2, this.reconnectAttempt),
      this.MAX_RECONNECT_DELAY_MS
    );
    this.reconnectAttempt++;
    console.log(`[LicenseClient] Reconnecting in ${delay / 1000}s...`);
    this.reconnectTimer = setTimeout(() => this._openSocket(), delay);
  }

  private clearTimers(): void {
    this._stopHeartbeat();
    this._cancelGracePeriod();
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
  }
}
