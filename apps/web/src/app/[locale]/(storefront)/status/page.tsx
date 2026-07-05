"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useTranslations, useLocale } from "next-intl";
import { Link } from "@/i18n/routing";
import {
  CheckCircle2,
  AlertTriangle,
  XCircle,
  RefreshCw,
  Activity,
  Wifi,
  ShieldCheck,
  Zap,
  Globe,
  Clock,
  Check,
  Minus,
  Hexagon,
  X,
  Settings
} from "lucide-react";
import type { StatusPayload, ServiceMetric, ServiceStatus, Incident, StatusHistoryItem, Maintenance } from "@/app/api/status/route";

function useStatusMeta() {
  const t = useTranslations("Status");
  return useCallback((status: ServiceStatus) => {
    switch (status) {
      case "operational":
        return {
          text: t("operational"),
          title: t("operational_title"),
          colorClass: "text-primary",
          bgClass: "bg-primary/10 border-primary/20",
          icon: (
            <div className="w-4 h-4 rounded-full bg-primary/20 flex items-center justify-center text-primary shrink-0">
              <Check className="w-2.5 h-2.5 stroke-[3.5]" />
            </div>
          ),
          mdIcon: (
            <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center text-primary shrink-0">
              <Check className="w-4 h-4 stroke-[3.5]" />
            </div>
          ),
          lgIcon: (
            <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-primary shrink-0">
              <Check className="w-6 h-6 stroke-[3.5]" />
            </div>
          ),
          largeBadge: (
            <div className="w-14 h-14 rounded-full bg-primary flex items-center justify-center text-black mb-6 shadow-sm">
              <Check className="w-7 h-7 stroke-[4.5]" />
            </div>
          ),
          bgColor: "bg-[#cde2a6]", // Soft pastel green
          lineColor: "var(--color-primary, #ccff00)", // Brand Green
          gradientId: "grad-operational"
        };
      case "degraded":
        return {
          text: t("degraded"),
          title: t("degraded_title"),
          colorClass: "text-amber-500",
          bgClass: "bg-amber-500/10 border-amber-500/20",
          icon: (
            <div className="w-4 h-4 rounded-[2px] bg-amber-500/20 flex items-center justify-center text-amber-500 shrink-0">
              <AlertTriangle className="w-2.5 h-2.5 stroke-[3.5]" />
            </div>
          ),
          mdIcon: (
            <div className="w-6 h-6 rounded bg-amber-500/20 flex items-center justify-center text-amber-500 shrink-0">
              <AlertTriangle className="w-4 h-4 stroke-[3.5]" />
            </div>
          ),
          lgIcon: (
            <div className="w-10 h-10 rounded-md bg-amber-500/20 flex items-center justify-center text-amber-500 shrink-0">
              <AlertTriangle className="w-6 h-6 stroke-[3.5]" />
            </div>
          ),
          largeBadge: (
            <div className="w-14 h-14 rounded-xl bg-amber-500 flex items-center justify-center text-black mb-6 shadow-sm">
              <AlertTriangle className="w-7 h-7 stroke-[2.5]" />
            </div>
          ),
          bgColor: "bg-[#f4d8a1]", // Soft pastel amber
          lineColor: "#f59e0b",
          gradientId: "grad-degraded"
        };
      case "down":
        return {
          text: t("down"),
          title: t("down_title"),
          colorClass: "text-red-500",
          bgClass: "bg-red-500/10 border-red-500/20",
          icon: (
            <div className="w-4 h-4 rounded-[2px] bg-red-500/20 flex items-center justify-center text-red-500 shrink-0">
              <X className="w-2.5 h-2.5 stroke-[3.5]" />
            </div>
          ),
          mdIcon: (
            <div className="w-6 h-6 rounded bg-red-500/20 flex items-center justify-center text-red-500 shrink-0">
              <X className="w-4 h-4 stroke-[3.5]" />
            </div>
          ),
          lgIcon: (
            <div className="w-10 h-10 rounded-md bg-red-500/20 flex items-center justify-center text-red-500 shrink-0">
              <X className="w-6 h-6 stroke-[3.5]" />
            </div>
          ),
          largeBadge: (
            <div className="w-14 h-14 rounded-xl bg-red-600 flex items-center justify-center text-white mb-6 shadow-sm">
              <X className="w-7 h-7 stroke-[3.5]" />
            </div>
          ),
          bgColor: "bg-[#f2b3b3]", // Soft pastel red
          lineColor: "#ef4444",
          gradientId: "grad-down"
        };
      case "maintenance":
        return {
          text: t("maintenance"),
          title: t("scheduled_maintenance"),
          colorClass: "text-blue-500",
          bgClass: "bg-blue-500/10 border-blue-500/20",
          icon: (
            <div className="w-4 h-4 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-500 shrink-0">
              <Settings className="w-2.5 h-2.5 stroke-[3.5]" />
            </div>
          ),
          mdIcon: (
            <div className="w-6 h-6 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-500 shrink-0">
              <Settings className="w-4 h-4 stroke-[3.5]" />
            </div>
          ),
          lgIcon: (
            <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-500 shrink-0">
              <Settings className="w-6 h-6 stroke-[3.5]" />
            </div>
          ),
          largeBadge: (
            <div className="w-14 h-14 rounded-full bg-blue-500 flex items-center justify-center text-white mb-6 shadow-sm">
              <Settings className="w-7 h-7 stroke-[3.5]" />
            </div>
          ),
          bgColor: "bg-[#93c5fd]", // Soft pastel blue
          lineColor: "#3b82f6",
          gradientId: "grad-maintenance"
        };
    }
  }, [t]);
}

interface ServiceCardProps {
  service: ServiceMetric;
}

const ServiceCard = React.memo(function ServiceCard({
  service,
}: ServiceCardProps) {
  const t = useTranslations("Status");
  const locale = useLocale();
  const getStatusMeta = useStatusMeta();

  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const percent = x / rect.width;
    const index = Math.min(
      service.history.length - 1,
      Math.max(0, Math.round(percent * (service.history.length - 1)))
    );
    if (index !== hoveredIndex) {
      setHoveredIndex(index);
    }
  }, [service.history.length, hoveredIndex]);

  const handleMouseLeave = useCallback(() => {
    setHoveredIndex(null);
  }, []);

  const hoveredPoint = hoveredIndex !== null ? service.history[hoveredIndex] : null;

  // Pre-calculate points coordinates to avoid doing it on every single render
  const pointsObj = useMemo(() => {
    const latencies = service.history.map(h => h.latency && h.latency > 0 ? h.latency : 50);
    const minLat = Math.min(...latencies);
    const maxLat = Math.max(...latencies);
    const latRange = maxLat - minLat || 1;

    return service.history.map((h, i) => {
      const lat = h.latency && h.latency > 0 ? h.latency : 50;
      const x = (i / (service.history.length - 1)) * 300; // viewBox width scale
      const normY = maxLat === minLat ? 0.5 : (lat - minLat) / latRange;
      const y = 42 - normY * 34; // viewBox height scale pad (inverted for latency spikes)
      return { x, y, status: h.status, time: h.time, day: h.day, latency: h.latency };
    });
  }, [service.history]);

  // Memoize the SVG segments to avoid any re-evaluation during hover state changes
  const svgSegments = useMemo(() => {
    return pointsObj.slice(1).map((point, index) => {
      const prevPoint = pointsObj[index];
      if (!prevPoint) return null;
      const segmentStatus = point.status;
      const segmentMeta = getStatusMeta(segmentStatus);
      const segmentColor = segmentMeta.lineColor;

      // Path for the line segment
      const lineD = `M ${prevPoint.x},${prevPoint.y} L ${point.x},${point.y}`;
      // Path for the shaded area under this segment
      const areaD = `M ${prevPoint.x},${prevPoint.y} L ${point.x},${point.y} L ${point.x},50 L ${prevPoint.x},50 Z`;

      return (
        <g key={index}>
          {/* Shaded Area under this segment */}
          <path
            d={areaD}
            fill={segmentColor}
            fillOpacity="0.04"
          />
          {/* Line segment */}
          <path
            d={lineD}
            fill="none"
            stroke={segmentColor}
            strokeWidth="1.25"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </g>
      );
    });
  }, [pointsObj, getStatusMeta]);

  const serviceMeta = getStatusMeta(service.status);

  return (
    <div
      className={`rounded-xl border border-zinc-900 bg-[#2C2C2C]/20 p-5 relative transition-all duration-200 ${
        hoveredPoint ? "z-30 border-zinc-800" : "z-10"
      }`}
    >
      {/* Service Header */}
      <div className="flex items-center justify-between gap-4 mb-5">
        <div>
          <h3 className="font-bold text-white text-lg md:text-xl leading-none">
            {service.name}
          </h3>
          <div className="flex items-center gap-3 mt-1.5 text-[10px] font-sans text-zinc-500">
            <span className="flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-zinc-600" />
              {t("uptime_label", { count: service.uptime })}
            </span>
            {service.latency > 0 && (
              <span className="flex items-center gap-1">
                <Wifi className="w-3 h-3 text-zinc-600" />
                {service.latency} ms
              </span>
            )}
          </div>
        </div>
        {serviceMeta.lgIcon}
      </div>

      {/* Heartbeat Sparkline Graph visualization */}
      <div>
        {/* Sparkline Graph Box */}
        <div
          className="relative h-16 w-full bg-zinc-950/20 border border-zinc-900 rounded-lg overflow-hidden cursor-crosshair"
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
        >
          <svg className="absolute inset-0 w-full h-full" preserveAspectRatio="none" viewBox="0 0 300 50">
            {svgSegments}
          </svg>

          {/* Hairline guideline guide */}
          {hoveredIndex !== null && (
            <div
              className="absolute inset-y-0 w-[1px] bg-zinc-800 pointer-events-none"
              style={{
                left: `${(hoveredIndex / (service.history.length - 1)) * 100}%`,
                transform: 'translateX(-50%)'
              }}
            />
          )}
        </div>
      </div>

      {/* Tooltip rendered absolutely, floating under this card */}
      {hoveredPoint && (
        <div
          className={`absolute top-full left-1/2 -translate-x-1/2 mt-3 bg-zinc-950/95 backdrop-blur-xl rounded-xl p-4 shadow-2xl z-50 w-max max-w-[320px] border transition-all duration-200 ease-out pointer-events-none ${
            hoveredPoint.status === "operational"
              ? "border-primary/20"
              : hoveredPoint.status === "degraded"
              ? "border-amber-500/20"
              : hoveredPoint.status === "maintenance"
              ? "border-blue-500/20"
              : "border-red-500/20"
          }`}
        >
          {/* Date / Time Context */}
          <div className="text-[10px] font-sans tracking-wide text-zinc-400 mb-2 flex items-center gap-1.5">
            <Clock className="w-3 h-3 opacity-50" />
            {hoveredPoint.time ? (
              (() => {
                let iso = hoveredPoint.time;
                if (!iso.includes("T") && iso.includes(" ")) {
                  iso = iso.replace(" ", "T");
                }
                if (!iso.endsWith("Z") && !iso.includes("+") && !iso.includes("-", 10)) {
                  iso = iso + "Z";
                }
                const date = new Date(iso);
                if (isNaN(date.getTime())) return hoveredPoint.time;
                return date.toLocaleString(locale, {
                  month: "short",
                  day: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                });
              })()
            ) : (
              hoveredPoint.day === 0 ? t("today") : t("days_ago", { count: hoveredPoint.day })
            )}
          </div>

          {/* Service Name */}
          <div className="mb-3 pb-3 border-b border-zinc-900/60">
            <h4 className="font-bold text-sm text-zinc-100 truncate">
              {service.name}
            </h4>
          </div>

          {/* Content grid */}
          <div className="flex items-center gap-5">
            {/* Status column */}
            <div className="flex-1">
              <div className="text-[9px] font-sans font-bold tracking-widest text-zinc-500 uppercase mb-1.5">
                {t("status_label", { defaultValue: "Status" })}
              </div>
              <div className="flex items-center gap-2.5">
                {getStatusMeta(hoveredPoint.status).mdIcon}
                <span className="text-sm font-bold text-white leading-tight">
                  {getStatusMeta(hoveredPoint.status).text}
                </span>
              </div>
            </div>

            {/* Vertical divider */}
            <div className="w-[1px] h-8 bg-zinc-900 shrink-0"></div>

            {/* Latency column */}
            <div className="flex-1">
              <div className="text-[9px] font-sans font-bold tracking-widest text-zinc-500 uppercase mb-1.5">
                {t("latency_label", { defaultValue: "Latency" })}
              </div>
              <div className="flex items-center gap-2">
                <div className="p-1.5 flex shrink-0 items-center justify-center rounded-md border border-zinc-900 bg-zinc-900/40 text-zinc-400">
                  <Wifi className="w-3.5 h-3.5 text-primary" />
                </div>
                <span className="text-sm font-bold text-white leading-tight">
                  {hoveredPoint.latency !== undefined && hoveredPoint.latency > 0 ? (
                    `${hoveredPoint.latency} ms`
                  ) : (
                    <span className="text-zinc-500">—</span>
                  )}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
});

export default function StatusPage() {
  const t = useTranslations("Status");
  const locale = useLocale();
  const getStatusMeta = useStatusMeta();

  const [data, setData] = useState<StatusPayload | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const fetchStatus = useCallback(async (showIndicator = false) => {
    if (showIndicator) setIsRefreshing(true);
    try {
      const res = await fetch("/api/status", { cache: "no-store" });
      if (!res.ok) {
        let errMsg = t("network_error");
        try {
          const errJson = await res.json();
          if (errJson && errJson.error) {
            errMsg = `${errJson.error}`;
          }
        } catch (_) {
          // ignore parsing error
        }
        throw new Error(errMsg);
      }
      const json = await res.json();
      setData(json);
      setError(null);
    } catch (err: any) {
      console.error("Fetch failed:", err);
      setError(err.message || t("connection_error_fallback"));
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  }, [t]);

  // Initial fetch
  useEffect(() => {
    fetchStatus();
  }, [fetchStatus]);

  // Auto-refresh every 30 seconds
  useEffect(() => {
    if (loading || error) return;
    const interval = setInterval(() => {
      fetchStatus(true);
    }, 30000);
    return () => clearInterval(interval);
  }, [loading, error, fetchStatus]);

  const handleManualRefresh = () => {
    fetchStatus(true);
  };

  const currentStatus = data?.overallStatus || "operational";
  const meta = getStatusMeta(currentStatus);

  return (
    <main className="min-h-screen bg-[#000000] text-foreground font-sans pt-32 pb-48 px-6 md:px-12 relative">
      <div className="max-w-4xl mx-auto relative z-10">

        {loading ? (
          /* SKELETON LOADER (STATIC) */
          <div className="space-y-6">
            <div className="h-64 w-full rounded-2xl bg-zinc-900/30 border border-zinc-950" />
            <div className="h-6 w-1/2 mx-auto rounded bg-zinc-900/30" />
            <div className="grid grid-cols-1 gap-4 pt-6">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-36 w-full rounded-lg bg-zinc-900/30 border border-zinc-950" />
              ))}
            </div>
          </div>
        ) : error ? (
          /* ERROR BOARD */
          <div className="rounded-xl border border-red-500/20 bg-red-500/5 p-8 text-center">
            <AlertTriangle className="w-8 h-8 text-red-500 mx-auto mb-3" />
            <h3 className="text-base font-bold mb-1 text-white">{t("connection_error_title")}</h3>
            <p className="text-zinc-500 text-xs max-w-md mx-auto mb-5 font-sans bg-zinc-950 p-4 rounded border border-zinc-900">
              {error}
            </p>
            <button
              onClick={handleManualRefresh}
              className="px-5 py-2 rounded bg-red-500 text-white font-sans text-xs tracking-widest hover:bg-red-600"
            >
              {t("retry")}
            </button>
          </div>
        ) : (
          /* LIVE TELEMETRY CONTENT */
          <div className="space-y-6">

            {/* Pinterest-inspired Large Status Card */}
            <div className={`w-full rounded-2xl p-10 md:p-14 flex flex-col items-center justify-center text-center select-none ${meta.bgColor}`}>
              {/* Large Status Badge using brand-aligned theme */}
              {meta.largeBadge}

              {/* Title */}
              <h1 className="text-3xl md:text-5xl font-black tracking-tight text-black leading-none">
                {meta.title}
              </h1>
            </div>

            {/* Pinterest-inspired Horizontal Legend (with consistent icons) */}
            <div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-5 text-sm font-sans pt-3 pb-10">
              {/* Operational (uses our brand color check) */}
              <div className="flex items-center gap-2.5 select-none text-primary">
                {getStatusMeta("operational").mdIcon}
                <span className="font-semibold">{t("operational")}</span>
              </div>

              {/* Degraded */}
              <div className="flex items-center gap-2.5 select-none text-amber-500">
                {getStatusMeta("degraded").mdIcon}
                <span className="font-semibold">{t("degraded")}</span>
              </div>

              {/* Partial Outage */}
              <div className="flex items-center gap-2.5 select-none text-red-500">
                {getStatusMeta("down").mdIcon}
                <span className="font-semibold">{t("down")}</span>
              </div>

              {/* Maintenance */}
              <div className="flex items-center gap-2.5 select-none text-blue-500">
                {getStatusMeta("maintenance").mdIcon}
                <span className="font-semibold">{t("maintenance")}</span>
              </div>
            </div>

            {/* Incidents Section */}
            {data?.incidents && data.incidents.length > 0 && (
              <div className="rounded-xl border border-amber-500/20 bg-amber-500/5 p-5">
                <h3 className="font-sans text-xs font-bold tracking-widest text-amber-400 mb-3 flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-amber-500" />
                  <span>{t("active_incidents")}</span>
                </h3>
                {data.incidents.map((inc: Incident) => (
                  <div key={inc.id} className="space-y-1">
                     <h4 className="font-bold text-sm text-white">{inc.title}</h4>
                     <p className="text-zinc-400 text-xs leading-relaxed">{inc.content}</p>
                     <span className="inline-block text-[9px] font-sans text-amber-500 bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded">
                       {inc.status}
                     </span>
                  </div>
                ))}
              </div>
            )}

            {/* Maintenance Section */}
            {data?.maintenances && data.maintenances.length > 0 && (
              <div className="space-y-4 mt-8">
                {data.maintenances.map((maint: Maintenance) => (
                  <div key={maint.id} className="rounded-xl border border-blue-500/20 bg-[#2C2C2C]/20 p-5 relative transition-all duration-200 z-10">
                    <div className="flex items-center justify-between gap-4 mb-4">
                      <div>
                        <h3 className="font-bold text-white text-lg md:text-xl leading-none">
                          {maint.title}
                        </h3>
                        {maint.dateRange && maint.dateRange.length === 2 && (
                          <div className="flex items-center gap-3 mt-1.5 text-[10px] font-sans text-zinc-500">
                            <span className="flex items-center gap-1">
                              <Clock className="w-3.5 h-3.5 text-zinc-600" />
                              <span className="text-xs text-zinc-400 font-sans">
                                {(() => {
                                  try {
                                    const parseDate = (d: string) => {
                                      let iso = d;
                                      if (!iso.includes("T") && iso.includes(" ")) iso = iso.replace(" ", "T");
                                      if (!iso.endsWith("Z") && !iso.includes("+") && !iso.includes("-", 10)) iso += "Z";
                                      return new Date(iso);
                                    };
                                    const first = maint.dateRange[0];
                                    const second = maint.dateRange[1];
                                    if (!first || !second) return "";
                                    const start = parseDate(first);
                                    const end = parseDate(second);
                                    if (isNaN(start.getTime()) || isNaN(end.getTime())) return `${first} - ${second}`;

                                    const fmt = new Intl.DateTimeFormat(locale, {
                                      month: "short",
                                      day: "numeric",
                                      hour: "2-digit",
                                      minute: "2-digit"
                                    });
                                    return `${fmt.format(start)} - ${fmt.format(end)}`;
                                  } catch (e) {
                                    return `${maint.dateRange[0]} - ${maint.dateRange[1]}`;
                                  }
                                })()}
                              </span>
                            </span>
                          </div>
                        )}
                      </div>
                      {getStatusMeta("maintenance").lgIcon}
                    </div>

                    {maint.description && (
                      <p className="text-zinc-400 text-sm leading-relaxed border-t border-blue-500/10 pt-4 mt-2">
                        {maint.description}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* Services Status Deck */}
            {data?.services && data.services.length > 0 ? (
              <div className="space-y-4">
                {data.services.map((service: ServiceMetric) => (
                  <ServiceCard
                    key={service.id}
                    service={service}
                  />
                ))}
              </div>
            ) : (
              <div className="rounded-xl border border-zinc-900 bg-zinc-950/30 p-10 text-center">
                <Activity className="w-6 h-6 text-zinc-700 mx-auto mb-3" />
                <h3 className="font-bold text-white text-sm mb-1">
                  {t("no_services_title")}
                </h3>
                <p className="text-zinc-500 text-xs max-w-sm mx-auto">
                  {t("no_services_desc")}
                </p>
              </div>
            )}



          </div>
        )}

      </div>
    </main>
  );
}
