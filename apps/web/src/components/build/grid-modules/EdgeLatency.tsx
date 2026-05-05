"use client";

import React from "react";
import { motion } from "framer-motion";
import { Activity } from "lucide-react";
import { GridModule } from "./GridModule";

export const EdgeLatency = () => {
  return (
    <GridModule title="Edge Latency" icon={Activity} className="col-span-3 row-span-3 relative overflow-hidden flex items-center justify-center">
      <motion.div 
        animate={{ scale: [1, 1.1, 1], opacity: [0.1, 0.2, 0.1] }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
        className="absolute right-0 bottom-0 translate-x-1/4 translate-y-1/4 w-[400px] h-[400px] border-[0.5px] border-white/5 rounded-full" 
      />
      <motion.div 
        animate={{ scale: [1, 1.05, 1], opacity: [0.2, 0.4, 0.2] }}
        transition={{ duration: 3, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
        className="absolute right-0 bottom-0 translate-x-1/4 translate-y-1/4 w-[300px] h-[300px] border border-white/10 rounded-full" 
      />
      <motion.div 
        animate={{ scale: [1, 1.2, 1] }}
        transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
        className="absolute right-0 bottom-0 translate-x-1/4 translate-y-1/4 w-[200px] h-[200px] border-[2px] border-primary/20 bg-primary/5 rounded-full" 
      />
      
      <div className="text-7xl font-light text-white/90 tracking-tighter z-10 flex items-baseline">
        0.8<span className="text-3xl text-white/40 ml-1">ms</span>
      </div>
    </GridModule>
  );
};
