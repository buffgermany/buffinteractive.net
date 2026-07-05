import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

function ensureEnv() {
  if (process.env["UPTIME_KUMA_URL"]) return;

  const paths = [
    path.join(process.cwd(), ".env"),
    path.join(process.cwd(), "../../.env"),
  ];

  for (const p of paths) {
    try {
      if (fs.existsSync(p)) {
        const content = fs.readFileSync(p, "utf-8");
        const lines = content.split(/\r?\n/);
        for (const line of lines) {
          const trimmed = line.trim();
          if (!trimmed || trimmed.startsWith("#")) continue;
          const eq = trimmed.indexOf("=");
          if (eq > 0) {
            const key = trimmed.slice(0, eq).trim();
            let val = trimmed.slice(eq + 1).trim();
            if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
              val = val.slice(1, -1);
            }
            if (key) {
              process.env[key] = val;
            }
          }
        }
        break;
      }
    } catch (_) {}
  }
}

// Standardized status type definitions
export type ServiceStatus = "operational" | "degraded" | "down" | "maintenance";

export interface StatusHistoryItem {
  day: number;
  status: ServiceStatus;
  latency?: number;
  time?: string;
}

export interface ServiceMetric {
  id: string;
  name: string;
  status: ServiceStatus;
  uptime: number; // e.g., 99.98
  latency: number; // in ms
  history: StatusHistoryItem[];
}

export interface Incident {
  id: string;
  title: string;
  content: string;
  status: "investigating" | "identified" | "monitoring" | "resolved";
  createdAt: string;
}

export interface Maintenance {
  id: string;
  title: string;
  description: string;
  status: string;
  dateRange: string[];
}

export interface StatusPayload {
  isLive: boolean;
  allOperational: boolean;
  overallStatus: ServiceStatus;
  services: ServiceMetric[];
  incidents: Incident[];
  maintenances: Maintenance[];
  lastUpdated: string;
}

// ----------------------------------------------------------------------------
// API ROUTE HANDLER
// ----------------------------------------------------------------------------
export async function GET() {
  ensureEnv();
  const kumaUrl = process.env["UPTIME_KUMA_URL"];

  if (!kumaUrl) {
    return NextResponse.json(
      { error: "Uptime Kuma URL is not configured." },
      { status: 500 }
    );
  }

  try {
    // 1. Determine base URL and slug
    let baseUrl = kumaUrl.replace(/\/+$/, "");
    let slug = process.env["UPTIME_KUMA_SLUG"] || "default";

    // Support extracting slug from full status-page URL if provided
    const apiMatch = baseUrl.match(/\/api\/status-page\/([^\/]+)/);
    if (apiMatch && apiMatch[1]) {
      slug = apiMatch[1];
      baseUrl = (baseUrl.split("/api/status-page/")[0] || "").replace(/\/+$/, "");
    }

    // 2. Build the endpoints
    const configEndpoint = `${baseUrl}/api/status-page/${slug}`;
    const heartbeatEndpoint = `${baseUrl}/api/status-page/heartbeat/${slug}`;

    // 3. Prepare headers (including Uptime Kuma API Key Basic Auth if configured)
    const headers: Record<string, string> = {
      "Accept": "application/json",
    };

    const apiKey = process.env["UPTIME_KUMA_API_KEY"];
    if (apiKey) {
      const auth = Buffer.from(`:${apiKey}`).toString("base64");
      headers["Authorization"] = `Basic ${auth}`;
    }

    // 4. Fetch from both endpoints concurrently with a 3.5s timeout
    const controller = new AbortController();
    const id = setTimeout(() => controller.abort(), 3500);

    const [configRes, heartbeatRes] = await Promise.all([
      fetch(configEndpoint, {
        headers,
        signal: controller.signal,
        next: { revalidate: 15 }, // Cache for 15 seconds at Next.js level
      }),
      fetch(heartbeatEndpoint, {
        headers,
        signal: controller.signal,
        next: { revalidate: 15 },
      }),
    ]);

    clearTimeout(id);

    if (!configRes.ok) {
      throw new Error(`Uptime Kuma Config API returned HTTP ${configRes.status}`);
    }
    if (!heartbeatRes.ok) {
      throw new Error(`Uptime Kuma Heartbeat API returned HTTP ${heartbeatRes.status}`);
    }

    const configData = await configRes.json();
    const heartbeatData = await heartbeatRes.json();

    // Map Uptime Kuma's dual payloads to our unified telemetry format
    const mappedServices: ServiceMetric[] = [];
    const publicGroupList = configData.publicGroupList || [];
    const uptimeList = heartbeatData.uptimeList || {};
    const heartbeatList = heartbeatData.heartbeatList || {};

    let hasDown = false;
    let hasDegraded = false;

    for (const group of publicGroupList) {
      const monitorList = group.monitorList || [];
      for (const monitor of monitorList) {
        if (monitor.active === false) continue;

        const monitorId = monitor.id;
        
        // 1. Map Uptime percentage (prefers 30d/720h or fallback to 24h or 1.0)
        // Kuma uses keys like "monitorId_720" for 30 days
        const uptimeKey30d = `${monitorId}_720`;
        const uptimeKey24h = `${monitorId}_24`;
        const uptimeRaw = uptimeList[uptimeKey30d] ?? uptimeList[uptimeKey24h] ?? 1.0;
        const uptimePercent = Math.round(uptimeRaw * 10000) / 100; // e.g., 99.98

        // Get heartbeats list for status and history mapping
        const kumaHeartbeats = heartbeatList[monitorId] || [];
        const latestHeartbeat = kumaHeartbeats[kumaHeartbeats.length - 1];

        // 2. Map Status from latest heartbeat: 1 = UP, 0 = DOWN, 2 = PENDING, 3 = MAINTENANCE
        let status: ServiceStatus = "operational";
        if (latestHeartbeat) {
          if (latestHeartbeat.status === 0) {
            status = "down";
            hasDown = true;
          } else if (latestHeartbeat.status === 2) {
            status = "degraded";
            hasDegraded = true;
          } else if (latestHeartbeat.status === 3) {
            status = "maintenance";
          }
        }

        // 3. Map Heartbeats & History directly from raw telemetry
        const history: StatusHistoryItem[] = [];
        
        kumaHeartbeats.forEach((hb: any, index: number) => {
          let segmentStatus: ServiceStatus = "operational";
          if (hb.status === 0) segmentStatus = "down";
          else if (hb.status === 2) segmentStatus = "degraded";
          else if (hb.status === 3) segmentStatus = "maintenance";

          history.push({
            day: kumaHeartbeats.length - 1 - index,
            status: segmentStatus,
            latency: hb.ping || undefined,
            time: hb.time,
          });
        });

        // Defensive guard: if telemetry is empty (new monitor), map its current status
        if (history.length === 0) {
          history.push({
            day: 0,
            status,
            latency: latestHeartbeat?.ping || undefined,
            time: latestHeartbeat?.time || new Date().toISOString(),
          });
        }

        // 4. Get latest ping/latency
        const latency = latestHeartbeat?.ping || 0;

        mappedServices.push({
          id: String(monitorId),
          name: monitor.name || "Unnamed Monitor",
          status,
          uptime: uptimePercent,
          latency,
          history,
        });
      }
    }

    // Determine overall system health
    let overallStatus: ServiceStatus = "operational";
    if (hasDown) {
      overallStatus = "down";
    } else if (hasDegraded) {
      overallStatus = "degraded";
    }

    // Map Active Incidents
    const mappedIncidents: Incident[] = [];
    if (configData.incident) {
      const inc = configData.incident;
      mappedIncidents.push({
        id: String(inc.id || "active_inc"),
        title: inc.title || "Infrastruktur-Störung",
        content: inc.content || "Wir untersuchen derzeit eine verringerte Performance.",
        status: "investigating",
        createdAt: inc.createdDate || new Date().toISOString(),
      });
    }

    // Map Maintenances
    const mappedMaintenances: Maintenance[] = (configData.maintenanceList || []).map((m: any) => ({
      id: String(m.id),
      title: m.title || "Maintenance",
      description: m.description || "",
      status: m.status || "under-maintenance",
      dateRange: m.dateRange || [],
    }));

    const payload: StatusPayload = {
      isLive: true,
      allOperational: overallStatus === "operational",
      overallStatus,
      services: mappedServices,
      incidents: mappedIncidents,
      maintenances: mappedMaintenances,
      lastUpdated: new Date().toISOString(),
    };

    return NextResponse.json(payload);
  } catch (error: any) {
    console.error("Uptime Kuma fetch failed:", error);
    return NextResponse.json(
      { error: error?.message || "Failed to fetch status metrics from Uptime Kuma." },
      { status: 500 }
    );
  }
}
