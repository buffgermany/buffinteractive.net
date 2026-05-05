"use client";

import { motion } from "framer-motion";
import React, { memo } from "react";
import { SystemLogs } from "./grid-modules/SystemLogs";
import { ActiveEndpoints } from "./grid-modules/ActiveEndpoints";
import { EdgeLatency } from "./grid-modules/EdgeLatency";
import { CodeSnippet } from "./grid-modules/CodeSnippet";
import { ThroughputGraph } from "./grid-modules/ThroughputGraph";
import { ServerRack } from "./grid-modules/ServerRack";
import { ClusterLoad } from "./grid-modules/ClusterLoad";
import { SecurityPolicies } from "./grid-modules/SecurityPolicies";
import { StorageCluster } from "./grid-modules/StorageCluster";
import { TechnicalCoordinates } from "./grid-modules/TechnicalCoordinates";

const BrandWatermark = memo(() => (
  <motion.div 
    animate={{ 
      x: [0, 10, 0],
      y: [0, -5, 0]
    }}
    transition={{
      duration: 20,
      repeat: Infinity,
      ease: "easeInOut"
    }}
    className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-[15vw] font-extrabold font-heading tracking-tighter text-foreground opacity-5 whitespace-nowrap select-none pointer-events-none"
  >
    BUFF // ENGINEERING
  </motion.div>
));
BrandWatermark.displayName = "BrandWatermark";

const ScannerBeam = memo(() => (
  <motion.div 
    animate={{ 
      y: ["-20vh", "120vh"],
      opacity: [0.3, 0.5, 0.3]
    }}
    transition={{
      y: { duration: 8, repeat: Infinity, ease: "linear" },
      opacity: { duration: 2, repeat: Infinity, ease: "easeInOut" }
    }}
    className="absolute inset-x-0 h-[2px] bg-gradient-to-r from-transparent via-primary/40 to-transparent z-10 pointer-events-none"
    style={{
      boxShadow: "0 0 40px 2px hsl(var(--primary)/0.15)",
    }}
  />
));
ScannerBeam.displayName = "ScannerBeam";

export const ArchitectureGrid = memo(() => {
  return (
    <div 
      className="absolute inset-0 flex items-center justify-center opacity-[0.6] pointer-events-none overflow-hidden"
      aria-hidden="true"
      role="presentation"
    >
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1.5, ease: "easeOut" }}
        className="w-[110vw] h-[110vh] absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex items-center justify-center"
      >
        
        <BrandWatermark />
        <ScannerBeam />

        <div className="grid grid-cols-6 md:grid-cols-10 lg:grid-cols-12 gap-5 w-full h-full p-8 content-center justify-center auto-rows-[minmax(100px,auto)]">
          <SystemLogs />
          <ActiveEndpoints />
          <EdgeLatency />
          <CodeSnippet />
          <ThroughputGraph />
          <ServerRack />
          <ClusterLoad />
          <SecurityPolicies />
          <StorageCluster />
          <TechnicalCoordinates />

          <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-20" aria-hidden="true">
            <pattern id="grid-3d" width="100" height="100" patternUnits="userSpaceOnUse">
              <path d="M 100 0 L 0 0 0 100" fill="none" stroke="hsl(var(--border))" strokeWidth="0.5"/>
            </pattern>
            <rect width="100%" height="100%" fill="url(#grid-3d)" />
            
            <motion.path 
              d="M 200,200 L 400,200 L 400,400" 
              stroke="hsl(var(--foreground)/0.2)" 
              strokeWidth="1" 
              fill="none"
              initial={{ pathLength: 0, opacity: 0 }}
              animate={{ pathLength: 1, opacity: 1 }}
              transition={{ duration: 3, repeat: Infinity, repeatDelay: 5 }}
            />
            <motion.path 
              d="M 800,600 L 600,600 L 600,800" 
              stroke="hsl(var(--primary))" 
              strokeWidth="1" 
              fill="none"
              initial={{ pathLength: 0, opacity: 0 }}
              animate={{ pathLength: 1, opacity: 0.5 }}
              transition={{ duration: 4, repeat: Infinity, repeatDelay: 3 }}
            />
          </svg>
        </div>
      </motion.div>
    </div>
  );
});
ArchitectureGrid.displayName = "ArchitectureGrid";

