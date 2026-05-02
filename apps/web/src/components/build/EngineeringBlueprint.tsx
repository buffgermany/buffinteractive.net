'use client';

import { useEffect } from 'react';
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';

export function EngineeringBlueprint() {
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      mouseX.set((e.clientX / window.innerWidth) * 2 - 1);
      mouseY.set((e.clientY / window.innerHeight) * 2 - 1);
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [mouseX, mouseY]);

  const smoothX = useSpring(mouseX, { stiffness: 40, damping: 40 });
  const smoothY = useSpring(mouseY, { stiffness: 40, damping: 40 });

  const xOffset = useTransform(smoothX, [-1, 1], [-10, 10]);
  const yOffset = useTransform(smoothY, [-1, 1], [-10, 10]);

  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden bg-[#050505]">
      {/* Subtle Dot Matrix Pattern */}
      <motion.div 
        className="absolute inset-[-5%] w-[110%] h-[110%] opacity-[0.12]" 
        style={{ 
          backgroundImage: `radial-gradient(#ffffff 1px, transparent 1px)`,
          backgroundSize: '24px 24px',
          x: xOffset,
          y: yOffset
        }} 
      />
      
      {/* Deep Vignette */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,#050505_90%)] opacity-90" />
      
      {/* Ambient Overhead Glow (Studio Lighting) */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-4xl h-[400px] bg-white/5 blur-[120px] rounded-full opacity-30 mix-blend-screen" />
    </div>
  );
}

