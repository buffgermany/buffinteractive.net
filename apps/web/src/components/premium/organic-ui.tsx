"use client";

import * as React from "react";
import { motion, useInView } from "framer-motion";
import { cn } from "@/lib/utils";

// ============================================================================
// Organic Squiggly Underline
// ============================================================================

export function WigglyUnderline({ children, className }: { children: React.ReactNode; className?: string }) {
  const ref = React.useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-10%" });

  return (
    <span ref={ref} className={cn("relative inline-block whitespace-nowrap", className)}>
      <span className="relative z-10">{children}</span>
      <motion.svg
        width="100%"
        height="40"
        viewBox="0 0 1000 40"
        preserveAspectRatio="none"
        className="absolute -bottom-4 left-0 w-full overflow-visible text-primary pointer-events-none z-20"
        initial={{ maskImage: "linear-gradient(to right, rgba(0,0,0,1) 0%, rgba(0,0,0,0) 0%)" }}
        animate={isInView ? { maskImage: "linear-gradient(to right, rgba(0,0,0,1) 100%, rgba(0,0,0,0) 100%)" } : {}}
        style={{ 
          WebkitMaskImage: isInView ? "linear-gradient(to right, rgba(0,0,0,1) 0%, rgba(0,0,0,1) 100%)" : "linear-gradient(to right, rgba(0,0,0,1) 0%, rgba(0,0,0,0) 0%)",
          maskImage: isInView ? "linear-gradient(to right, rgba(0,0,0,1) 0%, rgba(0,0,0,1) 100%)" : "linear-gradient(to right, rgba(0,0,0,1) 0%, rgba(0,0,0,0) 0%)",
        }}
        transition={{ duration: 1.5, ease: "easeInOut", delay: 0.2 }}
      >
        {/* We use a static path now to avoid Chromium dash-rendering bugs with non-scaling strokes */}
        <path
          d="M 0 20 Q 12.5 10 25 20 Q 37.5 30 50 20 Q 62.5 10 75 20 Q 87.5 30 100 20 Q 112.5 10 125 20 Q 137.5 30 150 20 Q 162.5 10 175 20 Q 187.5 30 200 20 Q 212.5 10 225 20 Q 237.5 30 250 20 Q 262.5 10 275 20 Q 287.5 30 300 20 Q 312.5 10 325 20 Q 337.5 30 350 20 Q 362.5 10 375 20 Q 387.5 30 400 20 Q 412.5 10 425 20 Q 437.5 30 450 20 Q 462.5 10 475 20 Q 487.5 30 500 20 Q 512.5 10 525 20 Q 537.5 30 550 20 Q 562.5 10 575 20 Q 587.5 30 600 20 Q 612.5 10 625 20 Q 637.5 30 650 20 Q 662.5 10 675 20 Q 687.5 30 700 20 Q 712.5 10 725 20 Q 737.5 30 750 20 Q 762.5 10 775 20 Q 787.5 30 800 20 Q 812.5 10 825 20 Q 837.5 30 850 20 Q 862.5 10 875 20 Q 887.5 30 900 20 Q 912.5 10 925 20 Q 937.5 30 950 20 Q 962.5 10 975 20 Q 987.5 30 1000 20"
          fill="none"
          stroke="currentColor"
          strokeWidth="4"
          strokeLinecap="round"
          vectorEffect="non-scaling-stroke"
        />
      </motion.svg>
    </span>
  );
}

// ============================================================================
// Magnetic Hover Element
// ============================================================================

export function MagneticElement({ children, className, pull = 0.4 }: { children: React.ReactNode, className?: string, pull?: number }) {
  const ref = React.useRef<HTMLDivElement>(null);
  const [position, setPosition] = React.useState({ x: 0, y: 0 });

  const handleMouse = (e: React.MouseEvent<HTMLDivElement>) => {
    const { clientX, clientY } = e;
    const { height, width, left, top } = ref.current!.getBoundingClientRect();
    const middleX = clientX - (left + width / 2);
    const middleY = clientY - (top + height / 2);
    setPosition({ x: middleX * pull, y: middleY * pull });
  };

  const reset = () => {
    setPosition({ x: 0, y: 0 });
  };

  return (
    <motion.div
      ref={ref}
      onMouseMove={handleMouse}
      onMouseLeave={reset}
      animate={{ x: position.x, y: position.y }}
      transition={{ type: "spring", stiffness: 150, damping: 15, mass: 0.1 }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

// ============================================================================
// Infinite Marquee
// ============================================================================

export function InfiniteMarquee({ items, speed = 40 }: { items: string[], speed?: number }) {
  // Multiply items to ensure seamless infinite scroll
  const multipliedItems = [...items, ...items, ...items, ...items];
  
  return (
    <div className="flex w-full overflow-hidden bg-primary/10 border-y border-primary/20 py-6 text-primary">
      <motion.div
        className="flex min-w-full items-center gap-10 px-4 font-serif text-3xl md:text-5xl italic tracking-wide w-max whitespace-nowrap"
        animate={{ x: [0, "-50%"] }}
        transition={{ ease: "linear", duration: speed, repeat: Infinity }}
      >
        {multipliedItems.map((item, i) => (
          <React.Fragment key={i}>
            <span>{item}</span>
            <span className="text-primary/40 text-xl font-sans not-italic mx-4">✦</span>
          </React.Fragment>
        ))}
      </motion.div>
    </div>
  );
}

// ============================================================================
// Editorial Bento Card (Float on scroll)
// ============================================================================

export function BentoCard({ children, className, delay = 0, glow = false }: { children: React.ReactNode; className?: string; delay?: number, glow?: boolean }) {
  const ref = React.useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-10%" });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 40 }}
      animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 40 }}
      transition={{ type: "spring", stiffness: 200, damping: 20, delay }}
      className={cn(
        "relative overflow-hidden rounded-[2rem] border border-border bg-card p-8 shadow-2xl transition-all duration-500 hover:border-primary/40 group",
        glow && "hover:shadow-primary/10 hover:shadow-[0_0_40px_rgba(var(--primary),0.1)]",
        className
      )}
    >
      {/* Decorative inner glow on hover */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100 pointer-events-none" />
      <div className="relative z-10">{children}</div>
    </motion.div>
  );
}
