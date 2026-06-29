import type { Metadata } from "next";
import { AuditQuiz } from "@/components/audit/AuditQuiz";

export const metadata: Metadata = {
  title: "The Audit | Engineering & Growth Diagnostic | Buff",
  description: "Get a ruthless, mathematical blueprint for your next stage of scaling. Identify technical bottlenecks and growth plateaus in 120 seconds.",
};

export default function AuditPage() {
  return (
    <main className="relative min-h-screen w-full bg-background selection:bg-accent selection:text-background pt-24 pb-24 flex flex-col items-center overflow-x-hidden">
      <div className="relative z-10 w-full flex flex-col items-center">
        <AuditQuiz />
      </div>
      
      {/* High-Fidelity Background Ambience */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        {/* Intense centered glow for depth */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-[1200px] aspect-square bg-[radial-gradient(circle,rgba(var(--accent-color),0.05)_0%,transparent_70%)] opacity-50 blur-[120px] transition-all duration-1000" />
        
        {/* Dynamic corner accents */}
        <div className="absolute top-[-10%] left-[-10%] w-[60%] h-[60%] bg-[radial-gradient(circle,rgba(var(--accent-color),0.03)_0%,transparent_70%)] blur-[100px] transition-all duration-1000" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] bg-[radial-gradient(circle,rgba(var(--accent-color),0.02)_0%,transparent_70%)] blur-[100px] transition-all duration-1000" />
        
        {/* Fine grain overlay - Premium finish */}
        <div className="absolute inset-0 opacity-[0.04] pointer-events-none bg-[url('https://grainy-gradients.vercel.app/noise.svg')] brightness-100 contrast-150 mix-blend-overlay" />
        
        {/* Bottom fade for smooth transition if needed */}
        <div className="absolute bottom-0 left-0 right-0 h-64 bg-gradient-to-t from-background to-transparent" />
      </div>
    </main>
  );
}
