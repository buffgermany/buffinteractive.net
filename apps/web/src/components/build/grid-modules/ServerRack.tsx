"use client";

import React from "react";
import { motion } from "framer-motion";
import { Server } from "lucide-react";
import { GridModule } from "./GridModule";

export const ServerRack = () => {
  return (
    <GridModule title="S3 STORAGE" icon={Server} className="col-span-2 row-span-4 gap-4">
      <div className="flex flex-col gap-3">
        {Array.from({length: 10}).map((_, i) => (
          <div key={i} className="w-full h-8 bg-white/[0.02] border border-white/5 rounded-lg flex items-center px-4 gap-3 relative overflow-hidden group">
             <div className="absolute inset-0 bg-gradient-to-r from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
             <motion.div 
               animate={i % 3 === 0 ? { 
                 backgroundColor: ["rgba(204,255,0,0.4)", "rgba(204,255,0,0.8)", "rgba(204,255,0,0.4)"],
                 boxShadow: ["0 0 5px rgba(204,255,0,0.2)", "0 0 15px rgba(204,255,0,0.6)", "0 0 5px rgba(204,255,0,0.2)"]
               } : {}}
               transition={{ duration: 2, repeat: Infinity, delay: i * 0.2 }}
               className={`w-1.5 h-1.5 rounded-full ${i % 3 === 0 ? 'bg-primary/60' : 'bg-white/20'}`} 
             />
             <div className="h-1 flex-1 bg-gradient-to-r from-white/10 to-transparent rounded-full" />
             <div className="text-[8px] font-mono text-white/30">{i}TB</div>
          </div>
        ))}
      </div>
    </GridModule>
  );
};
