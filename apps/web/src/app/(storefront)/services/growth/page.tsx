import { Metadata } from 'next';
import Link from 'next/link';
import { Header } from '@/components/buff/Header';
import { Footer } from '@/components/buff/Footer';
import { MadLibsFooter } from '@/components/buff/MadLibsFooter';

export const metadata: Metadata = {
  title: 'Growth | Buff',
  description: 'Strategy, performance marketing, and content scale.',
};

export default function GrowthPage() {
  return (
    <>
      <Header />
      <main className="min-h-screen bg-background">
      {/* Mesh background effect scoped to this page */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(204,255,0,0.1)_0%,transparent_50%)]" />
      </div>

      <section className="relative z-10 pt-48 pb-24 px-6 md:px-12 max-w-7xl mx-auto">
        <div className="flex flex-col items-center text-center">
            <h1 className="heading-massive mb-8 text-transparent bg-clip-text bg-linear-to-br from-white to-gray-500">
                The Growth.
            </h1>
            <p className="text-xl md:text-2xl text-foreground-muted max-w-3xl mx-auto leading-relaxed mb-12">
                We don't care about clicks or impressions. We care about your bottom line. 
                We take your product and engineer its market dominance through aggressive scaling and strategic punch. <span className="text-[#CCFF00] font-medium">Results are the only metric that matters.</span>
            </p>
            <Link href="/#contact" className="interactive-pill bg-[#CCFF00] text-[#0A0A0A] border-2 border-[#CCFF00] px-10 py-4 font-bold text-lg hover:shadow-[0_0_30px_rgba(204,255,0,0.4)] transition-all">
                Scale Your Revenue
            </Link>
        </div>
      </section>

      <section className="relative z-10 py-24 px-6 md:px-12 max-w-7xl mx-auto border-t border-white/5">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
            <div>
                <h2 className="text-4xl md:text-5xl font-heading font-bold mb-6 text-foreground">Revenue Over Vanity.</h2>
                <p className="text-lg text-foreground-muted mb-6 leading-relaxed">
                    While other agencies brag about "engagement," we focus on the entire customer lifecycle. 
                    We identify exactly where you're leaving money on the table and we fix it with ruthless efficiency.
                </p>
                <ul className="space-y-4">
                    {["Dominate Your Market Share", "Maximize Customer Lifetime Value", "Aggressive Revenue Expansion"].map((item, i) => (
                        <li key={i} className="flex items-center gap-3 text-foreground font-medium">
                            <div className="w-2 h-2 rounded-full bg-[#CCFF00]" />
                            {item}
                        </li>
                    ))}
                </ul>
            </div>
            
            <div className="relative aspect-square md:aspect-video rounded-3xl overflow-hidden glass flex flex-col justify-end p-8 border-[#CCFF00]/20">
                {/* Decorative Chart elements */}
                <div className="absolute inset-0 flex items-end opacity-20 pointer-events-none">
                    <svg viewBox="0 0 100 100" className="w-full h-full preserve-aspect-ratio-none" preserveAspectRatio="none">
                        <path d="M0 100 L 20 80 L 40 85 L 60 50 L 80 40 L 100 10" fill="none" stroke="#CCFF00" strokeWidth="2" vectorEffect="non-scaling-stroke" />
                        <path d="M0 100 L 20 80 L 40 85 L 60 50 L 80 40 L 100 10 L 100 100 Z" fill="rgba(204,255,0,0.2)" />
                    </svg>
                </div>
                <div className="relative z-10">
                    <span className="text-5xl font-bold text-white mb-2 block">+340%</span>
                    <span className="text-sm tracking-widest uppercase text-muted-foreground font-mono">Realized Growth Baseline</span>
                </div>
            </div>
        </div>
      </section>
      <MadLibsFooter />
      </main>
      <Footer />
    </>
  );
}
