"use client";

import { useState, useMemo, memo } from "react";
import { useTranslations } from "next-intl";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, Cpu, TrendingUp } from "lucide-react";
import Link from "next/link";

const MotionLink = motion(Link);

export type TechLogo = {
  name: string;
  slug?: string;
  customLogoUrl?: string; // e.g. "/images/my-custom-logo.svg"
  showName?: boolean;
  scale?: number; // Optional scale factor for visual size normalization (default: 1)
};

const BUILD_LOGOS: TechLogo[] = [
  { name: "React", slug: "react", showName: true },
  { name: "Next.js", slug: "nextdotjs", showName: true },
  { name: "Node.js", slug: "nodedotjs", showName: true },
  { name: "Supabase", slug: "supabase", showName: true },
  { name: "JavaScript", slug: "javascript", showName: true },
  { name: "TypeScript", slug: "typescript", showName: true },
  { name: "AWS", slug: "amazonaws", customLogoUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/9/93/Amazon_Web_Services_Logo.svg/960px-Amazon_Web_Services_Logo.svg.png", showName: true },
  { name: "Google Cloud", slug: "googlecloud", showName: true },
  { name: "Rust", slug: "rust", showName: true },
  { name: "Go", slug: "go", showName: true },
  { name: "Cloudflare", slug: "cloudflare", showName: true },
  { name: "PostgreSQL", slug: "postgresql", showName: true },
  { name: "Docker", slug: "docker", showName: true }
];

const GROWTH_LOGOS: TechLogo[] = [ 
  { name: "Google Ads", slug: "googleads", showName: true },
  { name: "Google AdSense", slug: "googleadsense", showName: true, scale: 1.1  },
  { name: "Google AdMob", slug: "googleadmob", showName: true },
  { name: "Google Analytics", slug: "googleanalytics", showName: true },
  { name: "TikTok Ads", slug: "tiktok", showName: true },
  { name: "HubSpot", slug: "hubspot", showName: true },
  { name: "Meta Ads", slug: "meta", showName: true, scale: 1.2 },
  { name: "Salesforce", slug: "salesforce", customLogoUrl: "https://upload.wikimedia.org/wikipedia/commons/f/f9/Salesforce.com_logo.svg", showName: true },
  { name: "Resend", slug: "resend", showName: true },
  { name: "Snapchat Ads", slug: "snapchat", showName: true, scale: 1.1  },
  { name: "Shopify", slug: "shopify", showName: true },
];

// ─── Marquee ────────────────────────────────────────────────────────────────

type MarqueeLaneProps = {
  logos: TechLogo[];
  hoverColor: string;
  duration: number;
};

// Pre-memoized component — only re-renders when logos/colors change.
const MarqueeLane = memo(function MarqueeLane({ logos, hoverColor, duration }: MarqueeLaneProps) {
  // Cache the doubled array so it isn't recreated on every render/frame.
  const doubled = useMemo(() => [...logos, ...logos], [logos]);

  return (
    <div className="relative w-full overflow-hidden opacity-70 py-2">
      {/* Left fade */}
      <div
        className="absolute left-0 top-0 bottom-0 w-16 md:w-32 z-20 pointer-events-none"
        style={{ background: "linear-gradient(to right, hsl(var(--background)), transparent)" }}
      />

      {/* Scrolling track — pure CSS animation, zero JS per frame */}
      <div
        className="flex items-center gap-12 md:gap-20 px-8 whitespace-nowrap"
        style={{
          animation: `marquee-scroll ${duration}s linear infinite`,
          willChange: "transform",
          width: "max-content",
        }}
      >
        {doubled.map((tech, i) => {
          const imgSrc =
            tech.customLogoUrl ||
            (tech.slug ? `https://cdn.simpleicons.org/${tech.slug}/ffffff` : undefined);

          return (
            // Outer div handles group-hover (scale + color change)
            <div
              key={`${tech.slug ?? tech.name}-${i}`}
              className="flex items-center gap-3 cursor-default shrink-0 group"
              style={
                {
                  "--hover-color": hoverColor,
                } as React.CSSProperties
              }
            >
              {imgSrc && (
                // Wrapper handles hover scale — isolated from the static per-logo scale
                <div className="w-8 h-5 md:w-12 md:h-8 transition-transform duration-200 group-hover:scale-110">
                  {/* Inner div carries static scale + mask color  */}
                  <div
                    className="w-full h-full bg-white transition-colors duration-200 group-hover:bg-[var(--hover-color)]"
                    style={{
                      maskImage: `url(${imgSrc})`,
                      WebkitMaskImage: `url(${imgSrc})`,
                      maskSize: "contain",
                      WebkitMaskSize: "contain",
                      maskRepeat: "no-repeat",
                      WebkitMaskRepeat: "no-repeat",
                      maskPosition: "center",
                      WebkitMaskPosition: "center",
                      // Base scale per-logo; does NOT conflict with hover scale above
                      transform: `scale(${tech.scale ?? 1})`,
                    }}
                  />
                </div>
              )}
              {tech.showName && (
                <span
                  className="text-sm md:text-base font-heading font-bold whitespace-nowrap hidden md:block transition-colors duration-200 text-white/80 group-hover:text-[var(--hover-color)] group-hover:opacity-100"
                >
                  {tech.name}
                </span>
              )}
            </div>
          );
        })}
      </div>

      {/* Right fade */}
      <div
        className="absolute right-0 top-0 bottom-0 w-16 md:w-32 z-20 pointer-events-none"
        style={{ background: "linear-gradient(to left, hsl(var(--background)), transparent)" }}
      />
    </div>
  );
});

export function ArsenalSection() {
  const t = useTranslations('Arsenal');
  const [activeTab, setActiveTab] = useState<"build" | "growth">("growth");


  const growthCurves = useMemo(() => {
    return Array.from({ length: 6 }).map((_, i) => {
        const offset = i * 20;
        return `M -100 ${300 + offset} Q 200 ${100 + offset} 400 ${400 + offset} T 1000 ${200 + offset} T 1600 ${350 + offset}`;
    });
  }, []);

  return (
    <section id="products" className="relative min-h-screen py-24 px-6 flex flex-col items-center justify-center overflow-hidden bg-[#0A0A0A]">
      <div id="services" className="absolute top-0 left-0 w-0 h-0" />
      
      {/* Premium Background Cross-fade Layers */}
      <div className="absolute inset-0 z-0">
        <AnimatePresence initial={false}>
          <motion.div
            key={activeTab}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.8, ease: "easeInOut" }}
            className="absolute inset-0"
            style={{
              backgroundImage: activeTab === "build" 
                ? "linear-gradient(to bottom, #0A0A0A, hsl(var(--background-build)) 20%, hsl(var(--background-build)) 80%, #0A0A0A)" 
                : "linear-gradient(to bottom, #0A0A0A, hsl(var(--background-growth)) 20%, hsl(var(--background-growth)) 85%, #0A0A0A)"
            }}
          />
        </AnimatePresence>
      </div>

      <div className="absolute inset-0 pointer-events-none z-[1] overflow-hidden"
           style={{
             maskImage: `linear-gradient(to bottom, transparent 0%, black 20%, black 82%, transparent 100%)`,
             WebkitMaskImage: `linear-gradient(to bottom, transparent 0%, black 20%, black 82%, transparent 100%)`
           }}
      >
        <AnimatePresence>
            {activeTab === "build" && (
                <motion.div 
                    key="bg-build"
                    initial={{ opacity: 0, scale: 1.1 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                    className="absolute inset-0 w-full h-full overflow-hidden"
                >
                  {/* Static dot grid via SVG */}
                  <svg
                    className="absolute inset-0 w-full h-full opacity-60"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <defs>
                      <pattern id="dot-grid" x="0" y="0" width="40" height="40" patternUnits="userSpaceOnUse">
                        <circle cx="20" cy="20" r="1.2" fill="rgba(0,240,255,0.25)" />
                      </pattern>
                    </defs>
                    <rect width="100%" height="100%" fill="url(#dot-grid)" />
                  </svg>

                  {/* Premium scanner beam — GPU-composited, no blur filters */}
                  <motion.div
                    className="absolute left-0 right-0 pointer-events-none"
                    style={{
                      top: 0,
                      willChange: "transform",
                      transform: "translateZ(0)", // force own GPU layer
                    }}
                    animate={{ y: ["0vh", "100vh"] }}
                    transition={{
                      duration: 7,
                      ease: "easeInOut",
                      repeat: Infinity,
                      repeatType: "mirror",
                    }}
                  >
                    {/* Wide ambient halo — gradient only, no blur (GPU safe) */}
                    <div
                      style={{
                        position: "absolute",
                        left: 0,
                        right: 0,
                        height: "200px",
                        top: "-100px",
                        background: "radial-gradient(ellipse 80% 50% at 50% 50%, rgba(0,240,255,0.07) 0%, rgba(0,240,255,0.03) 40%, transparent 70%)",
                      }}
                    />
                    {/* Core beam line — 1px with strong box-shadow glow (GPU composited) */}
                    <div
                      style={{
                        position: "absolute",
                        left: "8%",
                        right: "8%",
                        height: "1px",
                        background: "linear-gradient(to right, transparent 0%, rgba(0,240,255,0.3) 15%, rgba(0,240,255,0.9) 40%, rgba(0,240,255,1) 50%, rgba(0,240,255,0.9) 60%, rgba(0,240,255,0.3) 85%, transparent 100%)",
                        boxShadow: "0 0 4px 1px rgba(0,240,255,0.5), 0 0 12px 2px rgba(0,240,255,0.2), 0 0 30px 4px rgba(0,240,255,0.08)",
                      }}
                    />
                  </motion.div>
                </motion.div>
            )}

            {activeTab === "growth" && (
                <motion.div 
                    key="bg-growth"
                    initial={{ opacity: 0, scale: 1.1 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                    className="absolute inset-0 w-full h-full flex items-center justify-center opacity-10"
                >
                    <svg className="w-full h-full overflow-hidden" viewBox="0 0 1200 800" preserveAspectRatio="none">
                        {growthCurves.map((d, i) => (
                            <motion.path
                                key={i}
                                d={d}
                                fill="none"
                                stroke="#CCFF00"
                                strokeWidth="2"
                                animate={{ y: [20, -20, 20] }}
                                transition={{
                                    duration: 10 + i,
                                    repeat: Infinity,
                                    ease: "easeInOut"
                                }}
                            />
                        ))}
                    </svg>
                </motion.div>
            )}
        </AnimatePresence>
      </div>

      <div className="z-10 w-full max-w-4xl mx-auto flex flex-col items-center mb-16 md:mb-12">
        
        {/* Switch Toggle */}
        <div className="relative flex items-center p-1 bg-surface rounded-full mb-10 md:mb-12 shadow-inner border border-white/5 w-full max-w-sm">
          <motion.div 
            layoutId="tab-indicator"
            className={`absolute inset-y-1 left-1 w-[calc(50%-4px)] rounded-full ${activeTab === "build" ? "bg-[#00F0FF]" : "bg-[#CCFF00]"}`}
            initial={false}
            animate={{ x: activeTab === "build" ? "0%" : "100%" }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
          />

          <motion.button
            onClick={() => setActiveTab("build")}
            animate={activeTab !== "build" ? { opacity: [0.45, 0.65, 0.45] } : { opacity: 1 }}
            transition={activeTab !== "build" ? { duration: 2.8, repeat: Infinity, ease: "easeInOut" } : { duration: 0.2 }}
            className={`relative z-10 py-3 md:py-3.5 flex-1 flex items-center justify-center gap-2 text-xs md:text-sm font-bold tracking-widest uppercase transition-colors duration-300 ${
              activeTab === "build" ? "text-[#050A15]" : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <Cpu size={14} strokeWidth={2.5} />
            <span>{t('build_tab_label', { defaultMessage: 'The Build' })}</span>
          </motion.button>

          <motion.button
            onClick={() => setActiveTab("growth")}
            animate={activeTab !== "growth" ? { opacity: [0.45, 0.65, 0.45] } : { opacity: 1 }}
            transition={activeTab !== "growth" ? { duration: 2.8, repeat: Infinity, ease: "easeInOut" } : { duration: 0.2 }}
            className={`relative z-10 py-3 md:py-3.5 flex-1 flex items-center justify-center gap-2 text-xs md:text-sm font-bold tracking-widest uppercase transition-colors duration-300 ${
              activeTab === "growth" ? "text-[#100515]" : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <span>{t('growth_tab_label', { defaultMessage: 'The Growth' })}</span>
            <TrendingUp size={14} strokeWidth={2.5} />
          </motion.button>
        </div>

        <div className="w-full relative min-h-[300px] md:h-[280px] flex justify-center">
          <AnimatePresence mode="popLayout">
            
            {activeTab === "build" && (
              <motion.div
                key="build-content"
                initial={{ opacity: 0, scale: 0.98, y: 15, filter: "blur(10px)" }}
                animate={{ opacity: 1, scale: 1, y: 0, filter: "blur(0px)" }}
                exit={{ opacity: 0, scale: 0.98, y: -15, filter: "blur(10px)" }}
                transition={{ type: "spring", stiffness: 200, damping: 25 }}
                className="flex flex-col items-center text-center w-full max-w-3xl absolute"
              >
                <div className="absolute inset-0 -z-10 flex items-center justify-center pointer-events-none">
                  <div className="w-[120%] h-[150%] bg-[#0A0A0A] blur-[100px] rounded-full opacity-80" />
                </div>

                <h2 className="heading-massive mb-4 drop-shadow-[0_0_15px_rgba(0,240,255,0.2)] relative z-10">
                  {t('build_title')}
                </h2>
                <p className="text-lg md:text-xl text-foreground-muted max-w-2xl mb-8 relative z-10 leading-relaxed">
                  {t('build_description')}
                </p>
                
                {/* Call to Action */}
                <div className="flex justify-center relative z-10 w-full mt-4">
                  <MotionLink 
                    href="/build"
                    prefetch={true}
                    whileHover="hover"
                    whileTap={{ scale: 0.95 }}
                    className="px-8 py-3.5 rounded-full border-2 border-[#00F0FF] bg-[#00F0FF]/5 text-[#00F0FF] font-heading font-bold text-base tracking-tight transition-all duration-300 hover:bg-[#00F0FF] hover:text-[#0A0A0A] hover:shadow-[0_0_30px_rgba(0,240,255,0.4)] flex items-center gap-2 group"
                  >
                    <span>{t('cta_button')}</span>
                    <motion.div variants={{ hover: { x: 5 } }} transition={{ type: "spring", stiffness: 400, damping: 10 }}>
                      <ArrowRight size={18} strokeWidth={3} />
                    </motion.div>
                  </MotionLink>
                </div>
              </motion.div>
            )}

            {activeTab === "growth" && (
              <motion.div
                key="growth-content"
                initial={{ opacity: 0, scale: 0.98, y: 15, filter: "blur(10px)" }}
                animate={{ opacity: 1, scale: 1, y: 0, filter: "blur(0px)" }}
                exit={{ opacity: 0, scale: 0.98, y: -15, filter: "blur(10px)" }}
                transition={{ type: "spring", stiffness: 200, damping: 25 }}
                className="flex flex-col items-center text-center w-full max-w-3xl absolute"
              >
                <div className="absolute inset-0 -z-10 flex items-center justify-center pointer-events-none">
                  <div className="w-[120%] h-[150%] bg-[#0A0A0A] blur-[100px] rounded-full opacity-80" />
                </div>

                <h2 className="heading-massive mb-4 drop-shadow-[0_0_15px_rgba(204,255,0,0.1)] relative z-10">
                  {t('growth_title')}
                </h2>
                <p className="text-lg md:text-xl text-foreground-muted max-w-2xl mb-8 relative z-10 leading-relaxed">
                  {t('growth_description')}
                </p>

                {/* Call to Action */}
                <div className="flex justify-center relative z-10 w-full mt-4">
                  <MotionLink 
                    href="/growth"
                    prefetch={true}
                    whileHover="hover"
                    whileTap={{ scale: 0.95 }}
                    className="px-8 py-3.5 rounded-full border-2 border-[#CCFF00] bg-[#CCFF00]/5 text-[#CCFF00] font-heading font-bold text-base tracking-tight transition-all duration-300 hover:bg-[#CCFF00] hover:text-[#0A0A0A] hover:shadow-[0_0_30px_rgba(204,255,0,0.4)] flex items-center gap-2 group"
                  >
                    <span>{t('cta_button')}</span>
                    <motion.div variants={{ hover: { x: 5 } }} transition={{ type: "spring", stiffness: 400, damping: 10 }}>
                      <ArrowRight size={18} strokeWidth={3} />
                    </motion.div>
                  </MotionLink>
                </div>
              </motion.div>
            )}

          </AnimatePresence>
        </div>
      </div>

      {/* Subtle Trust Footer Marquee */}
      <div className="absolute bottom-6 left-0 right-0 w-full z-10">
        <AnimatePresence mode="wait">
          {activeTab === "build" && (
            <motion.div
              key="marquee-build"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              transition={{ duration: 0.5 }}
            >
              <MarqueeLane logos={BUILD_LOGOS} hoverColor="#00F0FF" duration={45} />
            </motion.div>
          )}
          {activeTab === "growth" && (
            <motion.div
              key="marquee-growth"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              transition={{ duration: 0.5 }}
            >
              <MarqueeLane logos={GROWTH_LOGOS} hoverColor="#CCFF00" duration={40} />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </section>
  );
}
