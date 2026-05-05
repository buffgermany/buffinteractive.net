"use client";

import React from "react";
import { motion } from "framer-motion";
import { Cpu } from "lucide-react";
import { GridModule } from "./GridModule";

const BARS = [40, 60, 30, 80, 50, 90, 40, 70, 100, 45, 65, 85, 30, 55, 75];

export const ClusterLoad = () => {
  return (
    <GridModule title="Cluster Load" icon={Cpu} className="col-span-3 row-span-2">
      <div className="flex items-end gap-1.5 h-20 mt-2">
         {BARS.map((h, i) => (
            <motion.div 
              key={i} 
              animate={{ height: [`${h}%`, `${Math.min(100, h + 15)}%`, `${h}%`] }}
              transition={{ duration: 2 + (i % 3), repeat: Infinity, ease: "easeInOut" }}
              className="flex-1 bg-gradient-to-t from-white/5 to-white/20 rounded-t-sm transition-all" 
              style={{ height: `${h}%` }} 
            />
         ))}
      </div>
    </GridModule>
  );
};
