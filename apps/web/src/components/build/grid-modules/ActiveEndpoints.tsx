"use client";

import React from "react";
import { motion } from "framer-motion";
import { Network } from "lucide-react";
import { GridModule } from "./GridModule";

const API_ROUTES = [
  '/v1/auth/verify',
  '/v1/nodes/sync',
  '/v1/edge/deploy',
  '/v1/telemetry',
  '/v1/stream/open'
];

export const ActiveEndpoints = () => {
  return (
    <GridModule title="API Routes" icon={Network} className="col-span-2 row-span-3">
      <div className="flex flex-col gap-2">
        {API_ROUTES.map((ep, i) => (
          <motion.div 
            key={ep} 
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 + (i * 0.05) }}
            className="flex justify-between items-center bg-white/[0.02] p-2.5 rounded-xl border border-white/5"
          >
            <span className="font-mono text-[10px] text-white/60">{ep}</span>
            <motion.span 
              animate={{ 
                boxShadow: ["0 0 0px rgba(204,255,0,0)", "0 0 10px rgba(204,255,0,0.3)", "0 0 0px rgba(204,255,0,0)"]
              }}
              transition={{ duration: 2, repeat: Infinity, delay: i * 0.4 }}
              className="font-mono text-[9px] text-primary bg-primary/10 px-2 py-0.5 rounded-full"
            >
              200
            </motion.span>
          </motion.div>
        ))}
      </div>
    </GridModule>
  );
};
