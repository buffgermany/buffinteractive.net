"use client";

import React from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface GridModuleProps {
  children: React.ReactNode;
  className?: string;
  title?: string;
  icon?: React.ElementType;
}

export const GridModule = ({ children, className, title, icon: Icon }: GridModuleProps) => {
  return (
    <div className={cn(
      "border border-white/10 bg-background/90 backdrop-blur-xl rounded-[2rem] p-6 shadow-2xl overflow-hidden flex flex-col group transition-colors duration-500 hover:border-primary/30",
      className
    )}>
      {title && (
        <div className="flex items-center gap-2 text-primary/70 mb-3 border-b border-white/10 pb-3 uppercase tracking-widest text-[10px] font-mono">
          {Icon && <Icon className="w-3 h-3" />}
          {title}
        </div>
      )}
      <div className="flex-1 min-h-0">
        {children}
      </div>
    </div>
  );
};
