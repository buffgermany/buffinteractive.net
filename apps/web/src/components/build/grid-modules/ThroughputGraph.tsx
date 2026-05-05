"use client";

import React from "react";
import { motion } from "framer-motion";
import { Zap } from "lucide-react";
import { GridModule } from "./GridModule";

export const ThroughputGraph = () => {
  return (
    <GridModule title="Throughput (GB/s)" icon={Zap} className="col-span-4 row-span-2 relative">
      <svg className="w-full h-[150%] absolute bottom-0 left-0" preserveAspectRatio="none" aria-hidden="true">
        <motion.path 
          d="M0,100 C100,50 200,80 300,30 S400,60 500,10 S600,90 800,20 L800,200 L0,200 Z" 
          fill="rgba(204,255,0,0.03)" 
          animate={{ d: [
            "M0,100 C100,50 200,80 300,30 S400,60 500,10 S600,90 800,20 L800,200 L0,200 Z",
            "M0,110 C100,60 200,70 300,40 S400,50 500,20 S600,80 800,30 L800,200 L0,200 Z",
            "M0,100 C100,50 200,80 300,30 S400,60 500,10 S600,90 800,20 L800,200 L0,200 Z"
          ]}}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.path 
          d="M0,100 C100,50 200,80 300,30 S400,60 500,10 S600,90 800,20" 
          stroke="rgba(204,255,0,0.4)" 
          strokeWidth="2" 
          fill="none" 
          animate={{ d: [
            "M0,100 C100,50 200,80 300,30 S400,60 500,10 S600,90 800,20",
            "M0,110 C100,60 200,70 300,40 S400,50 500,20 S600,80 800,30",
            "M0,100 C100,50 200,80 300,30 S400,60 500,10 S600,90 800,20"
          ]}}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
        />
      </svg>
      <motion.div 
        animate={{ 
            x: ["-10%", "110%"],
            opacity: [0, 1, 1, 0]
        }}
        transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
        className="absolute top-[40%] w-3 h-3 bg-primary rounded-full shadow-[0_0_20px_theme(colors.primary)]" 
      />
    </GridModule>
  );
};
