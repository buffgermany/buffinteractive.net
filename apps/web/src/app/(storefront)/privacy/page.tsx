import type { Metadata } from "next";
import { useTranslations } from "next-intl";
import { Header } from "@/components/buff/Header";
import { Footer } from "@/components/buff/Footer";

export const metadata: Metadata = {
  title: "Privacy Policy — Buff",
};

export default function PrivacyPolicyPage() {
  const t = useTranslations('Legal');
  
  return (
    <>
      <Header />
      <main className="min-h-screen bg-background text-foreground font-sans pt-40 pb-32 px-6 md:px-12 relative overflow-hidden">
        {/* Subtle background glow */}
        <div className="absolute top-0 right-0 w-[80vw] h-[80vw] max-w-[800px] max-h-[800px] rounded-full blur-[120px] bg-[radial-gradient(circle,rgba(0,240,255,0.05)_0%,rgba(0,0,0,0)_70%)] pointer-events-none -z-10" />

        <div className="max-w-3xl mx-auto rounded-3xl border border-white/5 bg-[#0A0A0A]/50 backdrop-blur-sm p-8 md:p-16 shadow-2xl relative z-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
           <h1 className="text-4xl md:text-5xl lg:text-6xl font-heading font-black mb-12 text-white tracking-tighter uppercase relative wrap-break-word hyphens-auto">
             {t('privacy_title')}
             <span className="absolute -bottom-4 left-0 w-12 h-1 bg-[#00F0FF]" />
           </h1>
           <div className="text-foreground-muted leading-relaxed whitespace-pre-line text-sm md:text-base">
             {t('privacy_content')}
           </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
