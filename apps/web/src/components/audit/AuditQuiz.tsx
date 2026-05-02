"use client"

import { useState, useEffect, useRef, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { RotateCcw, Info, LucideIcon, ShieldAlert, Database, Binary, TrendingDown, Box, Zap, Cpu, AlertOctagon, Activity, Filter, Lock, Layers, Rocket } from "lucide-react";
import { cn } from "@/lib/utils";
import { AuditResult } from "./AuditResult";
import { MagneticElement } from "@/components/premium/organic-ui";

// --- Types ---

type AuditData = {
  engineeringPoints: number;
  growthPoints: number;
  scale: string | null;
  history: string[];
};

type Option = {
  id: string;
  label: string;
  sub: string;
  points: { eng: number; growth: number };
  icon: LucideIcon;
  feedback: string;
};

type Question = {
  id: string;
  category: string;
  question: string;
  options: Option[];
  condition?: (data: AuditData) => boolean;
};

// --- Data ---

const QUESTIONS: Question[] = [
  {
    id: "traffic",
    category: "System Reliability",
    question: "A 10x traffic surge hits your site tomorrow. What happens?",
    options: [
      { id: "crash", label: "System Anomaly", sub: "We likely crash or become unusable", points: { eng: 2, growth: 0 }, icon: ShieldAlert, feedback: "Infrastructure instability is your #1 threat. Scaling isn't just about servers; it's about architecture." },
      { id: "expensive", label: "Resource Drain", sub: "We stay up, but cloud costs skyrocket", points: { eng: 1, growth: 0 }, icon: Database, feedback: "Your scaling is inefficient. You're throwing money at technical debt instead of solving it." },
      { id: "unknown", label: "The Void", sub: "We honestly have no idea what happens", points: { eng: 1, growth: 1 }, icon: Binary, feedback: "Lack of observability is a silent killer. You can't fix what you can't see." },
    ],
  },
  {
    id: "cac",
    category: "Unit Economics",
    question: "How would you describe your Customer Acquisition Cost (CAC)?",
    options: [
      { id: "rising", label: "Margin Erosion", sub: "CAC is climbing faster than our LTV", points: { eng: 0, growth: 2 }, icon: TrendingDown, feedback: "You're chasing vanity metrics while your margins bleed. A ruthless strategy shift is required." },
      { id: "blackbox", label: "The Black Box", sub: "We spend money, but attribution is a guess", points: { eng: 0, growth: 2 }, icon: Box, feedback: "Hope is not a growth strategy. You need a mathematical approach to attribution." },
      { id: "unscalable", label: "Stagnation", sub: "We can't seem to scale beyond current spend", points: { eng: 0, growth: 1 }, icon: Zap, feedback: "You've hit a local maximum. To scale further, you need to break your current growth model." },
    ],
  },
  {
    id: "tech_debt",
    category: "Code Integrity",
    question: "If you could delete 50% of your codebase today, would you?",
    condition: (data) => data.engineeringPoints >= 2,
    options: [
      { id: "yes", label: "Absolutely", sub: "It's mostly bloat and legacy workarounds", points: { eng: 2, growth: 0 }, icon: Cpu, feedback: "Acknowledging the bloat is the first step. Most enterprise code is 60% waste." },
      { id: "maybe", label: "Hesitantly", sub: "I'd love to, but I'm afraid of what breaks", points: { eng: 1, growth: 0 }, icon: AlertOctagon, feedback: "Fear-driven development is a sign of brittle architecture. We replace fear with tests." },
      { id: "no", label: "Our Code is Lean", sub: "Every line serves a critical purpose", points: { eng: -1, growth: 0 }, icon: Activity, feedback: "Confidence is good. Efficiency is better. Let's see if your numbers back it up." },
    ],
  },
  {
    id: "conversion",
    category: "Revenue Performance",
    question: "What is your primary conversion bottleneck?",
    condition: (data) => data.growthPoints >= 2,
    options: [
      { id: "funnel", label: "The Leaky Funnel", sub: "Traffic is high, but conversion is abysmal", points: { eng: 0, growth: 2 }, icon: Filter, feedback: "You're pouring water into a bucket full of holes. Fix the translation, then scale." },
      { id: "trust", label: "Trust Deficit", sub: "Users visit but don't feel 'safe' to buy", points: { eng: 0, growth: 1 }, icon: Lock, feedback: "Branding is trust engineered. Your current UI is costing you 30% in lost revenue." },
      { id: "complexity", label: "Decision Paralysis", sub: "Too many options, users get overwhelmed", points: { eng: 0, growth: 1 }, icon: Layers, feedback: "Simplicity is the ultimate sophistication. We strip away the noise." },
    ],
  },
  {
    id: "scale",
    category: "Business Maturity",
    question: "Final Step: What is your current operational scale?",
    options: [
      { id: "startup", label: "Seed to Series A", sub: "Finding product-market fit or early scale", points: { eng: 0, growth: 0 }, icon: Rocket, feedback: "Speed is your only currency. Don't waste it on bad infrastructure." },
      { id: "scaleup", label: "Series B+", sub: "Aggressive scaling, breaking legacy patterns", points: { eng: 0, growth: 0 }, icon: Activity, feedback: "What got you here won't get you there. It's time to professionalize the stack." },
      { id: "enterprise", label: "Enterprise", sub: "Digital transformation, modernization", points: { eng: 0, growth: 0 }, icon: Database, feedback: "Agility is the goal. We help you move like a startup again." },
    ],
  },
];

// --- Components ---

const ProgressBar = ({ steps, current }: { steps: number; current: number }) => (
  <div className="flex gap-2 mb-16">
    {Array.from({ length: steps }).map((_, i) => (
      <motion.div
        key={i}
        animate={{ 
          width: i === current ? 40 : 12,
          backgroundColor: i <= current ? "var(--accent-color)" : "rgba(255,255,255,0.05)"
        }}
        className="h-1 rounded-full transition-colors duration-500"
        style={{ 
          boxShadow: i === current ? "0 0 12px var(--accent-color)" : "none" 
        }}
      />
    ))}
  </div>
);

const OptionCard = ({ 
  option, 
  isSelected, 
  isDimmed, 
  onSelect 
}: { 
  option: Option; 
  isSelected: boolean; 
  isDimmed: boolean;
  onSelect: () => void;
}) => {
  const cardRef = useRef<HTMLButtonElement>(null);

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    cardRef.current.style.setProperty("--mouse-x", `${x}px`);
    cardRef.current.style.setProperty("--mouse-y", `${y}px`);
  };

  return (
    <MagneticElement pull={0.03}>
      <button
        ref={cardRef}
        onMouseMove={handleMouseMove}
        onClick={onSelect}
        disabled={isDimmed}
        className={cn(
          "group relative flex flex-col items-start p-8 rounded-[2rem] border transition-all duration-700 overflow-hidden w-full h-full text-left outline-none",
          isSelected 
            ? "bg-(--accent-color)/10 border-(--accent-color)/30 scale-[1.02] shadow-2xl shadow-(--accent-color)/10" 
            : isDimmed 
            ? "bg-white/2 border-white/5 opacity-20 scale-[0.98]"
            : "bg-white/5 border-white/10 hover:border-(--accent-color)/40 hover:bg-white/10"
        )}
      >
        {/* Spotlight Effect */}
        <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700 bg-[radial-gradient(circle_at_var(--mouse-x)_var(--mouse-y),rgba(var(--accent-color),0.15)_0%,transparent_70%)] pointer-events-none" />
        
        {/* Icon Wrapper */}
        <div className={cn(
          "w-12 h-12 rounded-2xl border flex items-center justify-center mb-10 transition-all duration-700",
          isSelected 
            ? "bg-(--accent-color)/20 border-(--accent-color)/30 rotate-12" 
            : "bg-white/5 border-white/10 group-hover:bg-(--accent-color)/10 group-hover:border-(--accent-color)/20 group-hover:rotate-6"
        )}>
          <option.icon 
            className={cn(
              "w-6 h-6 transition-colors duration-700",
              isSelected ? "text-(--accent-color)" : "text-white/40 group-hover:text-(--accent-color)"
            )} 
          />
        </div>
        
        {/* Content */}
        <div className="flex flex-col gap-3 relative z-10">
          <h3 className={cn(
            "text-xl font-bold font-heading tracking-tight transition-colors duration-700",
            isSelected ? "text-(--accent-color)" : "text-white group-hover:text-(--accent-color)"
          )}>
            {option.label}
          </h3>
          <p className="text-white/40 text-sm leading-relaxed font-medium group-hover:text-white/60 transition-colors duration-700">
            {option.sub}
          </p>
        </div>
      </button>
    </MagneticElement>
  );
};

// --- Main Component ---

export const AuditQuiz = () => {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [data, setData] = useState<AuditData>({
    engineeringPoints: 0,
    growthPoints: 0,
    scale: null,
    history: [],
  });
  const [feedback, setFeedback] = useState<string | null>(null);
  const [selectedOptionId, setSelectedOptionId] = useState<string | null>(null);
  const [isFinished, setIsFinished] = useState(false);

  // Dynamic Theme Integration
  const accentColor = useMemo(() => 
    data.engineeringPoints > data.growthPoints ? "#00F0FF" : "#CCFF00"
  , [data.engineeringPoints, data.growthPoints]);

  useEffect(() => {
    document.documentElement.style.setProperty("--accent-color", accentColor);
  }, [accentColor]);

  const availableQuestions = useMemo(() => 
    QUESTIONS.filter(q => !q.condition || q.condition(data))
  , [data]);

  const currentQuestion = availableQuestions[currentStepIndex] as any;

  const handleSelect = (option: Option) => {
    if (selectedOptionId) return;
    
    setSelectedOptionId(option["id"]);
    setFeedback(option["feedback"]);

    setData((prev) => ({
      ...prev,
      engineeringPoints: prev["engineeringPoints"] + option["points"]["eng"],
      growthPoints: prev["growthPoints"] + option["points"]["growth"],
      scale: currentQuestion["id"] === "scale" ? option["id"] : prev["scale"],
      history: [...prev["history"], currentQuestion["id"]],
    }));

    // High-Fidelity Transition Delay (Analysis simulation)
    setTimeout(() => {
      if (currentStepIndex < availableQuestions.length - 1) {
        setCurrentStepIndex((prev) => prev + 1);
        setFeedback(null);
        setSelectedOptionId(null);
      } else {
        setIsFinished(true);
      }
    }, 1400);
  };

  const reset = () => {
    setCurrentStepIndex(0);
    setData({ engineeringPoints: 0, growthPoints: 0, scale: null, history: [] });
    setFeedback(null);
    setSelectedOptionId(null);
    setIsFinished(false);
  };

  if (isFinished) {
    const painPoint = 
      data.engineeringPoints > data.growthPoints + 1 ? "engineering" :
      data.growthPoints > data.engineeringPoints + 1 ? "growth" :
      "both";

    return (
      <AuditResult 
        data={{ 
          painPoint: painPoint as "engineering" | "growth" | "both", 
          scale: data.scale as any,
          objective: null 
        }} 
        reset={reset} 
      />
    );
  }

  return (
    <section className="w-full max-w-6xl mx-auto px-6 py-24 min-h-[90vh] flex flex-col items-center">
      <ProgressBar steps={availableQuestions.length} current={currentStepIndex} />

      <AnimatePresence mode="wait">
        <motion.div
          key={currentQuestion["id"]}
          initial={{ opacity: 0, y: 30, filter: "blur(10px)" }}
          animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          exit={{ opacity: 0, y: -30, filter: "blur(10px)" }}
          transition={{ type: "spring", stiffness: 200, damping: 25 }}
          className="w-full flex flex-col items-center"
        >
          {/* Header */}
          <div className="flex flex-col items-center gap-5 mb-12">
            <div className="flex items-center gap-3 px-4 py-2 rounded-full bg-white/5 border border-white/10">
              <span className="text-(--accent-color) text-[10px] font-bold tracking-[0.2em] uppercase font-sans">
                {currentQuestion.category}
              </span>
              <span className="w-1 h-1 rounded-full bg-white/20" />
              <span className="text-white/40 text-[10px] font-bold tracking-widest uppercase font-sans">
                Step {currentStepIndex + 1}
              </span>
            </div>
            
            <h2 className="text-4xl md:text-5xl lg:text-7xl font-bold font-heading text-white text-center leading-[1.1] tracking-tight text-balance max-w-5xl">
              {currentQuestion.question}
            </h2>
          </div>

          {/* Options Grid */}
          <motion.div 
            className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full"
            initial="hidden"
            animate="show"
            variants={{
              show: { transition: { staggerChildren: 0.1 } }
            }}
          >
            {currentQuestion["options"].map((option: any) => (
              <motion.div
                key={option["id"]}
                variants={{
                  hidden: { opacity: 0, y: 20 },
                  show: { opacity: 1, y: 0 }
                }}
              >
                <OptionCard 
                  option={option}
                  isSelected={selectedOptionId === option["id"]}
                  isDimmed={!!selectedOptionId && selectedOptionId !== option["id"]}
                  onSelect={() => handleSelect(option)}
                />
              </motion.div>
            ))}
          </motion.div>

          {/* Analysis Feedback Layer */}
          <div className="mt-16 w-full flex items-center justify-center min-h-[80px]">
            <AnimatePresence mode="wait">
              {feedback && (
                <motion.div
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -10, scale: 0.95 }}
                  className="flex items-center gap-5 bg-white/5 py-5 px-10 rounded-3xl border border-white/10 backdrop-blur-2xl shadow-2xl"
                >
                  <div className="w-8 h-8 rounded-full bg-(--accent-color)/10 flex items-center justify-center">
                    <Info className="w-4 h-4 text-(--accent-color)" />
                  </div>
                  <p className="text-base md:text-lg font-medium text-white/80 italic leading-relaxed text-balance font-sans">
                    "{feedback}"
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Persistent Actions */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1 }}
        className="mt-12"
      >
        <button
          onClick={reset}
          className="flex items-center gap-3 text-white/30 hover:text-(--accent-color) transition-all text-xs font-bold uppercase tracking-widest group px-6 py-3 rounded-full hover:bg-(--accent-color)/5 font-sans"
        >
          <RotateCcw className="w-4 h-4 group-hover:rotate-[-120deg] transition-transform duration-700" /> 
          <span>Restart Analysis</span>
        </button>
      </motion.div>
    </section>
  );
};
