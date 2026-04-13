"use client";

import { motion, useScroll, useTransform, MotionValue, useMotionValueEvent } from "framer-motion";
import { useRef, useMemo, useState } from "react";
import { useTranslations } from "next-intl";

const BRAND_COLOR = "#CCFF00";
// Word-reveal animation ends at this scroll progress value.
const REVEAL_END = 0.5;

interface WordProps {
  word: string;
  index: number;
  total: number;
  progress: MotionValue<number>;
  /** Whether the parent logic identified this word as part of the highlight phrase */
  isHighlightWord: boolean;
}

function Word({ word, index, total, progress, isHighlightWord }: WordProps) {
  const start = (index / total) * REVEAL_END;
  const end = ((index + 1) / total) * REVEAL_END;

  // Track the opacity to know if the word is "revealed"
  const opacity = useTransform(progress, [start, end], [0.1, 1]);
  const y = useTransform(progress, [start, end], [10, 0]);

  // We want to highlight the word only if it's a highlight word AND currently visible/active
  // We use a separate useTransform or just the progress to determine "active" color
  const [isCurentlyHighlighted, setIsCurrentlyHighlighted] = useState(false);

  useMotionValueEvent(progress, "change", (latest) => {
    // Word is active when we are at or past its specific reveal point
    setIsCurrentlyHighlighted(latest >= start);
  });

  return (
    <motion.span
      style={{
        opacity,
        y,
        color: (isHighlightWord && isCurentlyHighlighted) ? BRAND_COLOR : "#ffffff",
        transition: "color 0.4s ease",
      }}
      className="font-heading font-bold text-4xl md:text-6xl lg:text-7xl text-center"
    >
      {word}
    </motion.span>
  );
}

function DataPath({ config, squeeze, progress }: { config: any; squeeze: MotionValue<number>; progress: MotionValue<number> }) {
  const pathD = useTransform(squeeze, (latestSqueeze) => {
    const startY = (config.y / 100) * 800;
    const middleY = 400;
    const currentY = startY + (middleY - startY) * latestSqueeze;
    return `M 0 ${startY} C 400 ${currentY} 800 ${currentY} 1200 ${startY}`;
  });

  // Dynamic color: Turns red when narrowest (~0.5), then transitions to Branding Color (#CCFF00)
  const strokeColor = useTransform(
    progress,
    [0.3, 0.48, 0.52, 0.7],
    [config.color, "#ff4444", "#ff4444", BRAND_COLOR]
  );

  return (
    <motion.path
      d={pathD}
      fill="none"
      stroke={strokeColor}
      strokeWidth={config.strokeWidth}
      opacity={config.opacity}
      strokeDasharray="20 40"
      animate={{ strokeDashoffset: [0, -60] }}
      transition={{
        duration: config.duration,
        repeat: Infinity,
        ease: "linear",
      }}
    />
  );
}

export function RealityCheckSection() {
  const t = useTranslations("RealityCheck");
  const text: string = t("text");
  const highlightPhrase: string = t("highlightPhrase");

  const containerRef = useRef<HTMLElement>(null);

  // Track whether the scroll has passed the highlight threshold.
  // useMotionValueEvent fires without causing layout thrashing —
  // the state flip happens at most twice (forward + back scroll).
  const [highlighted, setHighlighted] = useState(false);

  // Split full text into words and identify which word indices belong to the
  // highlight phrase. This is locale-aware: the phrase comes from i18n.
  const { words, highlightSet } = useMemo(() => {
    const words = text.split(" ");
    const highlightWords = highlightPhrase.split(" ");

    let startIdx = -1;
    outer: for (let i = 0; i <= words.length - highlightWords.length; i++) {
      for (let j = 0; j < highlightWords.length; j++) {
        const word = words[i + j];
        const highlight = highlightWords[j];
        
        if (!word || !highlight) continue outer;

        // Strip punctuation for comparison so "Taktiken," matches "Taktiken"
        const wordClean = word.replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g,"");
        const highlightClean = highlight.replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g,"");
        
        if (wordClean !== highlightClean) continue outer;
      }
      startIdx = i;
      break;
    }

    const highlightSet = new Set<number>();
    if (startIdx !== -1) {
      for (let k = 0; k < highlightWords.length; k++) {
        highlightSet.add(startIdx + k);
      }
    }

    return { words, highlightSet };
  }, [text, highlightPhrase]);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end start"],
  });

  const contentOpacity = useTransform(scrollYProgress, [0, 0.1, 0.9, 1], [0, 1, 1, 0]);

  const paths = useMemo(() => {
    return Array.from({ length: 40 }).map((_, i) => ({
      y: (i / 40) * 100,
      opacity: 0.05 + ((i % 5) / 50),
      strokeWidth: 1 + (i % 3 === 0 ? 1 : 0),
      color: i % 10 === 0 ? BRAND_COLOR : "white",
      duration: 2 + (i % 3),
    }));
  }, []);

  const squeezeFactor = useTransform(scrollYProgress, [0, 0.4, 0.5, 0.6, 1], [0, 0.95, 0.98, 0.95, 0]);
  const pathsOpacity = useTransform(scrollYProgress, [0, 0.1, 0.9, 1], [0, 0.8, 0.8, 0]);

  return (
    <section
      ref={containerRef}
      className="relative h-[300vh]"
      style={{
        maskImage: `linear-gradient(to bottom, transparent, black 15%, black 85%, transparent)`,
        WebkitMaskImage: `linear-gradient(to bottom, transparent, black 15%, black 85%, transparent)`,
      }}
    >
      <div className="sticky top-0 h-screen flex flex-col items-center justify-center px-6 overflow-hidden">
        {/* Top Gradient Shadow Mask */}
        <div className="absolute top-0 left-0 w-full h-[25vh] bg-linear-to-b from-background to-transparent z-20 pointer-events-none" />

        {/* Bottom Gradient Shadow Mask */}
        <div className="absolute bottom-0 left-0 w-full h-[25vh] bg-linear-to-t from-background to-transparent z-20 pointer-events-none" />

        {/* Pinched Data Flow Background */}
        <motion.div
            className="absolute inset-0 z-0 flex items-center justify-center pointer-events-none overflow-visible"
            style={{ opacity: pathsOpacity }}
        >
          <svg className="w-full h-full" viewBox="0 0 1200 800" preserveAspectRatio="none">
            {paths.map((p: any, i: number) => (
              <DataPath key={i} config={p} squeeze={squeezeFactor} progress={scrollYProgress} />
            ))}
          </svg>
        </motion.div>

        {/* Ambient glow */}
        <div className="absolute inset-0 -z-10 flex items-center justify-center pointer-events-none">
          <div className="w-[120%] h-[150%] bg-[#0A0A0A] blur-[120px] rounded-full opacity-90" />
        </div>

        <motion.div
          style={{ opacity: contentOpacity }}
          className="max-w-5xl mx-auto flex flex-wrap justify-center gap-x-3 gap-y-4 pt-10 z-10 relative"
        >
          {words.map((word, i) => (
            <Word
              key={i}
              word={word}
              index={i}
              total={words.length}
              progress={scrollYProgress}
              isHighlightWord={highlightSet.has(i)}
            />
          ))}
        </motion.div>
      </div>
    </section>
  );
}
