#!/usr/bin/env bun
/**
 * License Client SDK — Interactive Test Console
 *
 * Usage:
 *   bun run src/test-client.ts
 *
 * env vars (or pass as args):
 *   LICENSE_KEY=your-license-key
 *   HARDWARE_ID=hw_test123
 *   API_WS_URL=ws://localhost:3001/v1/license/connect
 */

import { LicenseClient } from "./index.js";

// ============================================================
// Config — read from env or fall back to test defaults
// ============================================================

const LICENSE_KEY = process.env["LICENSE_KEY"] ?? process.argv[2] ?? "";
const HARDWARE_ID = process.env["HARDWARE_ID"] ?? process.argv[3] ?? "hw_test_" + Math.random().toString(36).slice(2, 8);
const SERVER_URL = process.env["API_WS_URL"] ?? process.argv[4] ?? "ws://localhost:3001/v1/license/connect";

if (!LICENSE_KEY) {
  console.error("\n❌  LICENSE_KEY is required.\n");
  console.error("Usage: bun run src/test-client.ts <license_key> [hardware_id] [ws_url]");
  console.error("   or: LICENSE_KEY=xxx bun run src/test-client.ts\n");
  process.exit(1);
}

// ============================================================
// Simulate "app locked" state
// ============================================================
let appLocked = false;

function checkLocked(): boolean {
  if (appLocked) {
    console.log("🔒  [App] In read-only/locked mode — license not connected.");
  }
  return appLocked;
}

// ============================================================
// Boot the client
// ============================================================

console.log("\n══════════════════════════════════════════════");
console.log("  Platform License SDK — Test Client");
console.log("══════════════════════════════════════════════");
console.log(`  Server  : ${SERVER_URL}`);
console.log(`  License : ${LICENSE_KEY}`);
console.log(`  HWID    : ${HARDWARE_ID}`);
console.log("══════════════════════════════════════════════\n");

const client = new LicenseClient({
  serverUrl: SERVER_URL,
  licenseKey: LICENSE_KEY,
  hardwareId: HARDWARE_ID,
  sdkVersion: "1.0.0",
  heartbeatInterval: 10_000, // Faster for testing (10s vs 25s in prod)
  gracePeriodMs: 30_000,     // 30s grace for testing (vs 5min in prod)

  onConnected: (key, hwid) => {
    appLocked = false;
    console.log(`\n✅  [App] License CONNECTED`);
    console.log(`    Key : ${key}`);
    console.log(`    HWID: ${hwid}\n`);
    console.log("    Simulating app usage. Press Ctrl+C to disconnect.\n");
  },

  onTerminated: (reason, message) => {
    console.error(`\n❌  [App] License TERMINATED`);
    console.error(`    Reason : ${reason}`);
    if (message) console.error(`    Message: ${message}`);
    console.error("\n    Exiting.\n");
    process.exit(0);
  },

  onDisplayMessage: (msg, severity) => {
    const icons: Record<string, string> = { info: "ℹ️ ", warning: "⚠️ ", critical: "🚨" };
    console.log(`\n${icons[severity] ?? "📢"}  [${severity.toUpperCase()}] ${msg}\n`);
  },

  onGracePeriodExpired: () => {
    appLocked = true;
    console.error("\n🔒  [App] GRACE PERIOD EXPIRED — app is now locked.");
    console.error("    All operations blocked until license server reconnects.\n");
  },

  onReconnecting: (attempt) => {
    if (attempt > 0) {
      console.log(`🔄  [App] Reconnecting... (attempt ${attempt})`);
    }
  },

  onError: (err) => {
    console.error(`⚠️   [WS Error]`, err.message);
  },
});

client.connect();

// ============================================================
// Keep the process alive + periodic status log
// ============================================================

const statusInterval = setInterval(() => {
  const status = client.connected ? "🟢 CONNECTED" : "🔴 DISCONNECTED";
  const locked = appLocked ? " | 🔒 LOCKED" : "";
  console.log(`[Status] ${status}${locked}`);
}, 15_000);

// Graceful shutdown
process.on("SIGINT", () => {
  console.log("\n\n👋  Shutting down test client...");
  clearInterval(statusInterval);
  client.destroy();
  setTimeout(() => process.exit(0), 500);
});
