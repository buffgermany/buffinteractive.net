"use client";

import React from "react";
import { motion } from "framer-motion";
import { Database } from "lucide-react";
import { GridModule } from "./GridModule";

export const StorageCluster = () => {
  return (
    <GridModule className="col-span-4 row-span-2 flex items-center gap-8 px-8">
      <Database className="w-12 h-12 text-white/20" />
      <div className="flex-1 h-full flex flex-col justify-center gap-3">
        <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
          <motion.div 
            animate={{ 
              width: ["85%", "88%", "85%"],
              boxShadow: ["0 0 10px rgba(204,255,0,0.3)", "0 0 20px rgba(204,255,0,0.6)", "0 0 10px rgba(204,255,0,0.3)"]
            }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            className="h-full bg-gradient-to-r from-primary/20 to-primary/60" 
            style={{ width: "85%" }}
          />
        </div>
        <div className="flex justify-between text-[10px] font-mono text-white/40">
          <span>Storage Cluster Alpha</span>
          <motion.span 
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 3, repeat: Infinity }}
            className="text-primary/80"
          >
            85% Capacity
          </motion.span>
        </div>
      </div>
    </GridModule>
  );
};
