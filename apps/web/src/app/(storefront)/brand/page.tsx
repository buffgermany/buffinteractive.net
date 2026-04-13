import type { Metadata } from "next";
import { useTranslations } from "next-intl";
import { Header } from "@/components/buff/Header";
import { Footer } from "@/components/buff/Footer";
import { Download } from "lucide-react";

export const metadata: Metadata = {
  title: "Brandkit & Assets — Buff",
  description: "Official Buff Brand Assets, Logos and Guidelines",
};

export default function BrandPage() {
  const t = useTranslations('Brand');

  return (
    <>
      <Header />
      <main className="min-h-screen bg-background text-foreground font-sans pt-40 pb-32 px-6 md:px-12 relative overflow-hidden">
        {/* Glow */}
        <div className="absolute top-0 right-1/4 w-[80vw] h-[80vw] max-w-[800px] max-h-[800px] rounded-full blur-[140px] bg-[radial-gradient(circle,rgba(204,255,0,0.08)_0%,rgba(0,0,0,0)_70%)] pointer-events-none -z-10" />

        <div className="max-w-4xl mx-auto z-10 relative">
          
          <div className="text-center mb-16 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <h1 className="text-5xl md:text-7xl font-heading font-black mb-6 text-white tracking-tighter uppercase relative wrap-break-word hyphens-auto inline-block">
              {t('title')}
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-10 leading-relaxed">
              {t('description')}
            </p>
            <button className="inline-flex items-center gap-3 px-8 py-4 bg-[#CCFF00] text-black font-bold text-base uppercase tracking-wider rounded-full hover:bg-white hover:scale-105 transition-all shadow-[0_0_30px_rgba(204,255,0,0.3)] hover:shadow-[0_0_40px_rgba(255,255,255,0.4)]">
              <Download size={20} className="stroke-[2.5]" />
              {t('download_btn')}
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-16">
            
            {/* Colors Section */}
            <div className="rounded-3xl border border-white/5 bg-[#0A0A0A]/50 backdrop-blur-sm p-8 shadow-2xl animate-in fade-in slide-in-from-bottom-8 duration-700 delay-150">
              <h3 className="text-xl font-bold text-white uppercase tracking-widest mb-8">{t('colors_title')}</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-3">
                  <div className="w-full aspect-[4/3] rounded-2xl bg-[#CCFF00] shadow-[0_0_40px_rgba(204,255,0,0.15)] ring-1 ring-inset ring-black/10" />
                  <div>
                    <h4 className="text-white font-bold">Acid Lime</h4>
                    <p className="text-xs text-muted-foreground font-mono mt-1">HEX #CCFF00</p>
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="w-full aspect-[4/3] rounded-2xl bg-[#FFFFFF] shadow-[0_0_40px_rgba(255,255,255,0.1)] ring-1 ring-inset ring-black/10" />
                  <div>
                    <h4 className="text-white font-bold">Pure White</h4>
                    <p className="text-xs text-muted-foreground font-mono mt-1">HEX #FFFFFF</p>
                  </div>
                </div>
                <div className="space-y-3 mt-4">
                  <div className="w-full aspect-[4/3] rounded-2xl bg-[#0A0A0A] ring-1 ring-white/10" />
                  <div>
                    <h4 className="text-white font-bold">Surface Dark</h4>
                    <p className="text-xs text-muted-foreground font-mono mt-1">HEX #0A0A0A</p>
                  </div>
                </div>
                <div className="space-y-3 mt-4">
                  <div className="w-full aspect-[4/3] rounded-2xl bg-[#050A15] ring-1 ring-white/10" />
                  <div>
                    <h4 className="text-white font-bold">The Void</h4>
                    <p className="text-xs text-muted-foreground font-mono mt-1">HEX #050A15</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Typography Section */}
            <div className="rounded-3xl border border-white/5 bg-[#0A0A0A]/50 backdrop-blur-sm p-8 shadow-2xl flex flex-col animate-in fade-in slide-in-from-bottom-8 duration-700 delay-300">
              <h3 className="text-xl font-bold text-white uppercase tracking-widest mb-8">{t('typography_title')}</h3>
              
              <div className="flex-1 flex flex-col justify-center space-y-12">
                <div className="space-y-4">
                  <div className="flex items-end gap-3 border-b border-white/10 pb-4">
                    <span className="text-5xl font-heading font-black tracking-tighter leading-none text-[#CCFF00]">Aa</span>
                    <span className="text-sm text-muted-foreground uppercase tracking-widest mb-1">Headings</span>
                  </div>
                  <h4 className="text-2xl text-white font-heading font-black uppercase tracking-tighter">Outfit Black</h4>
                  <p className="text-sm text-foreground-muted leading-relaxed">Used for massive impact, provocative statements, and capturing immediate attention.</p>
                </div>

                <div className="space-y-4">
                  <div className="flex items-end gap-3 border-b border-white/10 pb-4">
                    <span className="text-5xl font-sans font-medium leading-none text-white">Aa</span>
                    <span className="text-sm text-muted-foreground uppercase tracking-widest mb-1">Body Text</span>
                  </div>
                  <h4 className="text-2xl text-white font-sans font-medium">Inter</h4>
                  <p className="text-sm text-foreground-muted leading-relaxed">Clean, legible, and unobtrusive. Designed to hold the content seamlessly without fighting the headings.</p>
                </div>
              </div>
            </div>

          </div>

        </div>
      </main>
      <Footer />
    </>
  );
}
