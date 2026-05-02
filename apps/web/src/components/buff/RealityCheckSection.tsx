"use client";

import {
  motion,
  useScroll,
  useTransform,
  MotionValue,
} from "framer-motion";
import { useRef, useMemo } from "react";
import { useTranslations } from "next-intl";

// ─── Design constants ────────────────────────────────────────────────────────

const BRAND_COLOR = "#CCFF00";
const DIM_COLOR = "#4a4a4a";
const WHITE_COLOR = "#ffffff";

/**
 * Word reveal completes at 40 % of the section's scroll progress.
 * The sticky section releases at ~66.7 % progress (200 / 300vh), so this
 * leaves ~26 % of scroll (~80 vh) as guaranteed reading time after the last
 * word is fully visible — ensuring the "scroll lock" is never released while
 * words are still being revealed.
 */
const REVEAL_END = 0.4;

/**
 * Content envelope fade keyframes.
 * Exit starts at 0.56 and completes at 0.70 — both inside the sticky window
 * (~0.667 unstick point). By the time CSS hands the element back to natural
 * scroll, the content is already partially faded and translated, so the
 * transition feels like one continuous, intentional motion.
 */
const CONTENT_FADE_INPUT = [0, 0.08, 0.56, 0.70] as const;
const CONTENT_FADE_OUTPUT = [0, 1, 1, 0] as const;

/**
 * Exit drift: the content rises inside the sticky viewport before the CSS
 * sticky releases (~0.667). This pre-motion means the physical unlock is
 * invisible — the eye perceives one smooth upward scroll, not a snap.
 */
const CONTENT_EXIT_INPUT = [0.52, 0.70] as const;
const CONTENT_EXIT_OUTPUT = [0, -120] as const;

// ─── Types ───────────────────────────────────────────────────────────────────

interface WordToken {
  text: string;
  isHighlight: boolean;
}

interface WordProps {
  token: WordToken;
  /** 0-based position in the word list */
  index: number;
  /** Total word count — drives the per-word scroll window */
  total: number;
  progress: MotionValue<number>;
}

interface DataPathConfig {
  y: number;
  opacity: number;
  strokeWidth: number;
  color: string;
  duration: number;
}

interface DataPathProps {
  config: DataPathConfig;
  squeeze: MotionValue<number>;
  progress: MotionValue<number>;
}

// ─── Word component ───────────────────────────────────────────────────────────

/**
 * Renders a single word whose opacity, vertical position, color, and glow are
 * all driven by MotionValues — never by React state.
 *
 * This means framer-motion can batch all style updates through its own RAF
 * loop and apply them directly to the DOM without triggering React re-renders.
 */
function Word({ token, index, total, progress }: WordProps) {
  // Each word owns a slice of the [0, REVEAL_END] scroll range.
  const start = (index / total) * REVEAL_END;
  const end = ((index + 1) / total) * REVEAL_END;

  // Opacity: dim → fully visible as the word is revealed.
  const opacity = useTransform(progress, [start, end], [0.08, 1]);

  // Subtle upward drift synchronized with the opacity reveal.
  const y = useTransform(progress, [start, end], [12, 0]);

  // Color interpolation: non-highlight words reveal white; highlight words
  // transition from dim → brand green — both synchronized to the same scroll
  // window as opacity so the highlight lands exactly when the user reads it.
  const targetColor = token.isHighlight ? BRAND_COLOR : WHITE_COLOR;
  const color = useTransform(progress, [start, end], [DIM_COLOR, targetColor]);

  // Glow effect for highlight words: grows from 0 to a green halo.
  const textShadow = useTransform(
    progress,
    [start, end],
    [
      "0 0 0px transparent",
      token.isHighlight
        ? `0 0 20px ${BRAND_COLOR}55, 0 0 40px ${BRAND_COLOR}22`
        : "0 0 0px transparent",
    ]
  );

  return (
    <motion.span
      style={{
        opacity,
        y,
        color,
        textShadow,
        // will-change lets the browser promote this element to its own
        // compositing layer, enabling GPU-accelerated updates.
        willChange: "opacity, transform, color",
        display: "inline-block",
      }}
      className="font-heading font-bold text-3xl sm:text-4xl md:text-5xl lg:text-6xl 2xl:text-7xl text-center"
    >
      {token.text}
    </motion.span>
  );
}

// ─── DataPath components ─────────────────────────────────────────────────────

function DataPath({ config, squeeze, progress }: DataPathProps) {
  const pathD = useTransform(squeeze, (latestSqueeze) => {
    const startY = (config.y / 100) * 800;
    const middleY = 400;
    const currentY = startY + (middleY - startY) * latestSqueeze;
    return `M 0 ${startY} C 400 ${currentY} 800 ${currentY} 1200 ${startY}`;
  });

  // Turns red at pinch, then resolves to brand green.
  const strokeColor = useTransform(
    progress,
    [0.3, 0.48, 0.52, 0.7],
    [config.color, "#ff4444", "#ff4444", BRAND_COLOR]
  );

  // Opacity spikes at the green phase so dense paths don't wash out.
  const opacity = useTransform(
    progress,
    [0.0, 0.3, 0.48, 0.52, 0.62, 0.70],
    [
      config.opacity,
      config.opacity,
      config.opacity * 3,
      config.opacity * 8,
      config.opacity * 5,
      config.opacity,
    ]
  );

  return (
    <motion.path
      d={pathD}
      fill="none"
      stroke={strokeColor}
      strokeWidth={config.strokeWidth}
      style={{ opacity }}
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



// ─── Helpers ──────────────────────────────────────────────────────────────────

/**
 * Splits `text` into an array of WordTokens, marking which words belong to
 * `highlightPhrase`. The match is locale-aware and punctuation-tolerant.
 *
 * Words are joined with a non-breaking thin space (\u202F) inside the span
 * text so the layout engine treats each word as an inline unit while
 * preserving natural reading flow between them at the CSS level via
 * `flex-wrap` + `gap`.
 */
function buildWordTokens(text: string, highlightPhrase: string): WordToken[] {
  const words = text.split(" ");
  const phraseWords = highlightPhrase.split(" ");

  // Strip punctuation for a locale-tolerant comparison.
  const normalize = (str: string) =>
    str.replace(/[.,/#!$%^&*;:{}=\-_`~()]/g, "").toLowerCase();

  // Find the first contiguous run of words matching the highlight phrase.
  let matchStartIndex = -1;
  outer: for (let i = 0; i <= words.length - phraseWords.length; i++) {
    for (let j = 0; j < phraseWords.length; j++) {
      const w = words[i + j];
      const p = phraseWords[j];
      if (!w || !p || normalize(w) !== normalize(p)) continue outer;
    }
    matchStartIndex = i;
    break;
  }

  const highlightSet = new Set<number>();
  if (matchStartIndex !== -1) {
    for (let k = 0; k < phraseWords.length; k++) {
      highlightSet.add(matchStartIndex + k);
    }
  }

  return words.map((word, i) => ({
    text: word,
    isHighlight: highlightSet.has(i),
  }));
}

function buildDataPathConfigs(count: number): DataPathConfig[] {
  return Array.from({ length: count }, (_, i) => ({
    y: (i / count) * 100,
    // Higher base opacity so the surge during green phase is more dramatic
    // and the base state is not completely invisible.
    opacity: 0.08 + (i % 5) / 30,
    strokeWidth: 1 + (i % 3 === 0 ? 1 : 0),
    color: i % 10 === 0 ? BRAND_COLOR : "white",
    duration: 2 + (i % 3),
  }));
}

// ─── Main section ─────────────────────────────────────────────────────────────

export function RealityCheckSection() {
  const t = useTranslations("RealityCheck");

  const text: string = t("text");
  const highlightPhrase: string = t("highlightPhrase");

  const containerRef = useRef<HTMLElement>(null);

  // Tokenize once per locale change — not on every render or scroll tick.
  const wordTokens = useMemo(
    () => buildWordTokens(text, highlightPhrase),
    [text, highlightPhrase]
  );

  const dataPathConfigs = useMemo(() => buildDataPathConfigs(40), []);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end start"],
  });

  // Outer wrapper fades in slightly before the first word and out near exit.
  const contentOpacity = useTransform(
    scrollYProgress,
    CONTENT_FADE_INPUT,
    CONTENT_FADE_OUTPUT
  );

  // Align path exit to the same window as the content exit.
  const pathsOpacity = useTransform(
    scrollYProgress,
    [0, 0.1, 0.56, 0.70],
    [0, 1.0, 1.0, 0]
  );

  // Pre-motion that begins inside the sticky window so CSS sticky release
  // feels like a continuation rather than a sudden unlock.
  const contentY = useTransform(
    scrollYProgress,
    CONTENT_EXIT_INPUT,
    CONTENT_EXIT_OUTPUT
  );

  // Drives the "pinch" animation on the data-flow paths.
  const squeezeFactor = useTransform(
    scrollYProgress,
    [0, 0.4, 0.5, 0.6, 1],
    [0, 0.95, 0.98, 0.95, 0]
  );

  return (
    <section
      id="about"
      ref={containerRef}
      className="relative h-[300vh]"
      style={{
        maskImage:
          "linear-gradient(to bottom, transparent, black 15%, black 85%, transparent)",
        WebkitMaskImage:
          "linear-gradient(to bottom, transparent, black 15%, black 85%, transparent)",
      }}
    >
      <div className="sticky top-0 h-screen flex flex-col items-center justify-center px-6 overflow-hidden">
        {/* Top gradient vignette */}
        <div className="absolute top-0 left-0 w-full h-[25vh] bg-linear-to-b from-background to-transparent z-20 pointer-events-none" />

        {/* Bottom gradient vignette */}
        <div className="absolute bottom-0 left-0 w-full h-[25vh] bg-linear-to-t from-background to-transparent z-20 pointer-events-none" />

        {/* Animated data-flow background — base layer */}
        <motion.div
          className="absolute inset-0 z-0 flex items-center justify-center pointer-events-none overflow-visible"
          style={{ opacity: pathsOpacity }}
        >
          <svg
            className="w-full h-full"
            viewBox="0 0 1200 800"
            preserveAspectRatio="xMidYMid slice"
          >
            {dataPathConfigs.map((config, i) => (
              <DataPath
                key={i}
                config={config}
                squeeze={squeezeFactor}
                progress={scrollYProgress}
              />
            ))}
          </svg>
        </motion.div>

        {/* Text legibility backdrop: sits between the SVG layers (z-0) and the
            text (z-10). A dark radial vignette ensures the words remain crisp
            even at peak green-bloom intensity. Larger than the viewport so the
            edges always bleed off-screen on any aspect ratio. */}
        <div className="absolute inset-0 z-5 flex items-center justify-center pointer-events-none">
          <div
            className="rounded-full"
            style={{
              width: "160%",
              height: "70%",
              background:
                "radial-gradient(ellipse at center, rgba(0,0,0,0.82) 0%, rgba(0,0,0,0.60) 40%, transparent 75%)",
              filter: "blur(40px)",
            }}
          />
        </div>

        {/* Parallax text reveal */}
        <motion.div
          style={{ opacity: contentOpacity, y: contentY }}
          className="max-w-6xl mx-auto z-10 relative text-center leading-tight pt-10"
        >
          {/*
           * Words are rendered as inline-block spans inside a wrapping div
           * that uses inline layout. We inject a plain space character between
           * each token so the browser handles word-wrap naturally — no flex
           * gap arithmetic needed, and long words in any locale simply wrap.
           */}
          <p className="font-heading font-bold text-3xl sm:text-4xl md:text-5xl lg:text-6xl 2xl:text-7xl leading-snug">
            {wordTokens.map((token, i) => (
              <span key={i}>
                <Word
                  token={token}
                  index={i}
                  total={wordTokens.length}
                  progress={scrollYProgress}
                />
                {/* Preserve natural inter-word spacing without gap utilities */}
                {i < wordTokens.length - 1 ? "\u00A0" : null}
              </span>
            ))}
          </p>
        </motion.div>
      </div>
    </section>
  );
}
