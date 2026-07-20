"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";
import { useTranslations } from 'next-intl';

const timelineEvents = [
  { year: "2017", titleKey: "timeline_2017_title", textKey: "timeline_2017_text" },
  { year: "2018", titleKey: "timeline_2018_title", textKey: "timeline_2018_text" },
  { year: "2022", titleKey: "timeline_2022_title", textKey: "timeline_2022_text" },
  { year: "2023", titleKey: "timeline_2023_title", textKey: "timeline_2023_text" },
  { year: "Now", titleKey: "timeline_now_title", textKey: "timeline_now_text" }
];

function TimelineCard({ event, index }: { event: any, index: number }) {
  const t = useTranslations('About');
  const ref = useRef<HTMLDivElement>(null);
  
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start 90%", "center center", "end 10%"]
  });

  const opacity = useTransform(scrollYProgress, [0, 0.4, 0.6, 1], [0.1, 1, 1, 0.1]);
  const blurValue = useTransform(scrollYProgress, [0, 0.4, 0.6, 1], ["10px", "0px", "0px", "10px"]);
  const filter = useTransform(blurValue, (b) => `blur(${b})`);
  const scale = useTransform(scrollYProgress, [0, 0.4, 0.6, 1], [0.8, 1, 1, 0.8]);

  // Year color transitions to primary color when active
  const color = useTransform(scrollYProgress, [0.3, 0.4, 0.6, 0.7], ["#ffffff", "hsl(var(--primary))", "hsl(var(--primary))", "#ffffff"]);

  return (
    <div ref={ref} className="relative flex items-center md:flex-row flex-col min-h-[40vh] md:min-h-[50vh] justify-center py-12 w-full">
      {/* Timeline Dot */}
      <motion.div 
        style={{ opacity, scale }}
        className="absolute left-8 md:left-1/2 w-4 h-4 rounded-full bg-primary shadow-[0_0_15px_rgba(var(--primary),0.8)] -translate-x-1/2 z-10 md:top-1/2 md:-translate-y-1/2"
      />

      {/* Year Box (Right on Desktop, Top on Mobile) */}
      <div className="w-full md:w-1/2 pl-16 md:pl-16 lg:pl-24 text-left order-1 md:order-2 flex flex-col justify-center">
        <motion.div style={{ opacity, filter, scale }}>
          <motion.h2 
            style={{ color }}
            className="text-6xl md:text-8xl font-bold tracking-tighter transition-colors duration-300"
          >
            {event.year}
          </motion.h2>
        </motion.div>
      </div>

      {/* Content Box (Left on Desktop, Bottom on Mobile) */}
      <div className="w-full md:w-1/2 pl-16 md:pl-0 md:pr-16 lg:pr-24 text-left md:text-right order-2 md:order-1 mt-4 md:mt-0 flex flex-col justify-center">
        <motion.div style={{ opacity, filter, scale }}>
          <div className="bg-surface/40 backdrop-blur-xl p-6 md:p-8 rounded-[2rem] border border-white/5 hover:border-primary/20 transition-colors text-left w-full md:max-w-lg md:ml-auto">
            <h3 className="text-xl md:text-3xl font-bold text-white mb-3 md:mb-4 font-sans break-words">
              {t(event.titleKey as any)}
            </h3>
            <p className="text-base md:text-lg text-white/70 leading-relaxed font-sans break-words">
              {t(event.textKey as any)}
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

export function AboutTimeline() {
  const t = useTranslations('About');
  const containerRef = useRef<HTMLDivElement>(null);
  
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start center", "end center"]
  });

  const pathHeight = useTransform(scrollYProgress, [0, 1], ["0%", "100%"]);

  return (
    <section className="py-32 px-6 lg:px-12 bg-background relative" ref={containerRef}>
      <div className="max-w-6xl mx-auto">
        <div className="mb-32 text-center sticky top-32 z-20 pointer-events-none">
          <motion.h2 
            initial={{ opacity: 0, filter: "blur(10px)" }}
            whileInView={{ opacity: 1, filter: "blur(0px)" }}
            viewport={{ once: true }}
            className="text-4xl md:text-6xl font-bold tracking-tight text-white font-sans drop-shadow-xl"
          >
            {t('timeline_title')}
          </motion.h2>
        </div>

        <div className="relative mt-24">
          {/* Background Line */}
          <div className="absolute left-8 md:left-1/2 top-0 bottom-0 w-px bg-white/10 -translate-x-1/2" />
          
          {/* Animated Fill Line */}
          <motion.div 
            className="absolute left-8 md:left-1/2 top-0 w-px bg-primary -translate-x-1/2 shadow-[0_0_15px_rgba(var(--primary),0.8)] z-0"
            style={{ height: pathHeight }}
          />

          <div className="space-y-0 relative z-10">
            {timelineEvents.map((event, index) => (
              <TimelineCard key={event.year} event={event} index={index} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
