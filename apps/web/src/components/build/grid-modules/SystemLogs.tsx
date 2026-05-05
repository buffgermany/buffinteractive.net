"use client";

import React, { useMemo } from "react";
import { motion } from "framer-motion";
import { Terminal } from "lucide-react";
import { GridModule } from "./GridModule";

const LOG_MESSAGES = [
  'Node synchronized via primary relay',
  'Rebalancing shards across regions',
  'Packet loss detected on edge node',
  'Route optimized (latency: 12ms)',
  'Allocating memory buffer [256MB]',
  'Cache hit (ratio: 0.98)'
];

export const SystemLogs = () => {
  const logs = useMemo(() => {
    return Array.from({ length: 25 }).map((_, i) => ({
      id: i,
      time: "17:12:58", // In a real app, this might be dynamic, but for a grid it's aesthetic
      type: ['INFO', 'WARN', 'SYS '][i % 3],
      message: LOG_MESSAGES[i % LOG_MESSAGES.length],
      isAccent: i % 4 === 0
    }));
  }, []);

  return (
    <GridModule title="SYSTEM.LOG // TAIL" icon={Terminal} className="col-span-3 row-span-4 font-mono text-[9px] text-white/40 leading-relaxed">
      <motion.div 
        animate={{ y: [0, -40, 0] }}
        transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
        className="flex flex-col gap-[2px]"
      >
        {logs.map((log) => (
          <div key={log.id} className="flex gap-3 whitespace-nowrap opacity-60">
            <span className="text-white/20">[{log.time}]</span>
            <span className="text-white/30">{log.type}</span>
            <span className={log.isAccent ? "text-primary/80" : ""}>
              {log.message}
            </span>
          </div>
        ))}
      </motion.div>
    </GridModule>
  );
};
