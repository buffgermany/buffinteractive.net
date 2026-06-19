"use client";

import React, { useRef } from "react";
import { motion, useMotionTemplate, useMotionValue, useSpring, useTransform } from "framer-motion";

interface BentoCardProps {
  children?: React.ReactNode;
  className?: string;
  glowColor?: string;
  withGlassmorphism?: boolean;
}

export function BentoCard({ 
  children, 
  className = "", 
  glowColor = "rgba(204,255,0,0.15)",
  withGlassmorphism = false // User requested no glassmorphism
}: BentoCardProps) {
  const ref = useRef<HTMLDivElement>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  
  const mouseXSpring = useSpring(x, { stiffness: 400, damping: 90 });
  const mouseYSpring = useSpring(y, { stiffness: 400, damping: 90 });

  const rotateX = useTransform(mouseYSpring, [-0.5, 0.5], ["4deg", "-4deg"]);
  const rotateY = useTransform(mouseXSpring, [-0.5, 0.5], ["-4deg", "4deg"]);

  // Glow position
  const glowX = useMotionValue(0);
  const glowY = useMotionValue(0);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    
    const width = rect.width;
    const height = rect.height;
    
    const clientX = e.clientX - rect.left;
    const clientY = e.clientY - rect.top;
    
    const xPct = clientX / width - 0.5;
    const yPct = clientY / height - 0.5;
    
    x.set(xPct);
    y.set(yPct);

    glowX.set(clientX);
    glowY.set(clientY);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  return (
    <motion.div
      ref={ref}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{
        rotateX,
        rotateY,
        transformStyle: "preserve-3d",
      }}
      className={`relative group rounded-3xl bg-[#2C2C2C]/20 border border-white/5 overflow-hidden will-change-transform ${
        withGlassmorphism ? "backdrop-blur-xl" : ""
      } ${className}`}
    >
      <motion.div
        className="pointer-events-none absolute -inset-px rounded-3xl opacity-0 transition-opacity duration-500 group-hover:opacity-100"
        style={{
          background: useMotionTemplate`radial-gradient(400px circle at ${glowX}px ${glowY}px, ${glowColor}, transparent 80%)`,
        }}
      />
      <div 
        className="relative z-10 w-full h-full p-6 md:p-8 flex flex-col justify-between"
        style={{ transform: "translateZ(40px)" }}
      >
        {children}
      </div>
    </motion.div>
  );
}
