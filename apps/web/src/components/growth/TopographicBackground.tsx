'use client';

import { useEffect } from 'react';
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';

export function TopographicBackground() {
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      mouseX.set((e.clientX / window.innerWidth) * 2 - 1);
      mouseY.set((e.clientY / window.innerHeight) * 2 - 1);
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  const smoothX = useSpring(mouseX, { stiffness: 30, damping: 30 });
  const smoothY = useSpring(mouseY, { stiffness: 30, damping: 30 });

  const xOffset = useTransform(smoothX, [-1, 1], [-25, 25]);
  const yOffset = useTransform(smoothY, [-1, 1], [-25, 25]);

  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden mix-blend-screen opacity-[0.06]">
      <motion.div 
        style={{ x: xOffset, y: yOffset }}
        className="absolute inset-[-10%] w-[120%] h-[120%]"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="100%" height="100%" filter="url(#displacementFilter)">
            <defs>
              <filter id="displacementFilter">
                <feTurbulence type="fractalNoise" baseFrequency="0.015" numOctaves="3" result="noise" />
                <feDisplacementMap in="SourceGraphic" in2="noise" scale="40" xChannelSelector="R" yChannelSelector="G" />
              </filter>
            </defs>
            <pattern id="topo" width="80" height="80" patternUnits="userSpaceOnUse">
              <path d="M 0 40 Q 20 20 40 40 T 80 40" fill="transparent" stroke="#CCFF00" strokeWidth="1" />
              <path d="M 0 20 Q 20 0 40 20 T 80 20" fill="transparent" stroke="#CCFF00" strokeWidth="1" />
              <path d="M 0 60 Q 20 40 40 60 T 80 60" fill="transparent" stroke="#CCFF00" strokeWidth="1" />
            </pattern>
            <rect width="100%" height="100%" fill="url(#topo)" />
        </svg>
      </motion.div>
    </div>
  );
}
