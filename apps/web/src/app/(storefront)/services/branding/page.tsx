import { Metadata } from 'next';
import Link from 'next/link';
import { Header } from '@/components/buff/Header';
import { Footer } from '@/components/buff/Footer';
import { MadLibsFooter } from '@/components/buff/MadLibsFooter';

export const metadata: Metadata = {
  title: 'Branding | Buff',
  description: 'Visual identity, messaging, and positioning that cuts through the noise.',
};

export default function BrandingPage() {
  return (
    <>
      <Header />
      <main className="min-h-screen bg-background">
      <section className="pt-48 pb-24 px-6 md:px-12 max-w-7xl mx-auto border-b border-white/5">
        <div className="flex flex-col md:flex-row gap-16 items-start">
            <div className="flex-1">
                <h1 className="heading-massive text-foreground mb-8">
                    Branding.
                </h1>
                <p className="text-xl text-foreground-muted leading-relaxed mb-12 max-w-lg">
                    Aesthetics matter. We craft visual identities and brand positioning that command authority and justify premium pricing. No generic templates, just bespoke design.
                </p>
                <Link href="/#contact" className="interactive-pill bg-[#F8F8F8] text-[#0A0A0A] border-2 border-[#F8F8F8] px-10 py-4 font-bold text-lg hover:bg-transparent hover:text-[#F8F8F8] transition-all inline-block hover:shadow-[0_0_30px_rgba(255,255,255,0.2)]">
                    Define Your Identity
                </Link>
            </div>

            <div className="flex-1 w-full grid grid-cols-2 gap-4">
               {/* Abstract Brand Identity visual representation */}
               <div className="aspect-square bg-[#0A0A0A] rounded-2xl border border-white/10 flex items-center justify-center p-8">
                    <div className="w-full h-full border border-white/20 rounded-full flex items-center justify-center">
                        <div className="w-1/2 h-1/2 bg-white rounded-full blur-[2px]" />
                    </div>
               </div>
               <div className="aspect-square bg-white rounded-2xl flex items-center justify-center p-8">
                    <span className="font-heading font-black text-6xl text-[#0A0A0A] tracking-tighter">B.</span>
               </div>
               <div className="aspect-square glass rounded-2xl border border-[#CCFF00]/20 flex items-end p-6">
                    <span className="font-mono text-xs uppercase tracking-widest text-[#CCFF00]">Acid Lime<br/>#CCFF00</span>
               </div>
               <div className="aspect-square glass rounded-2xl flex items-center justify-center border-white/5">
                 <p className="font-serif italic text-3xl text-foreground/50">Typography</p>
               </div>
            </div>
        </div>
      </section>

      <section className="py-24 px-6 md:px-12 max-w-7xl mx-auto">
         <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl md:text-5xl font-heading font-bold mb-8">What makes a brand premium?</h2>
            <p className="text-xl text-foreground-muted leading-relaxed">
                It's not just a logo. It's the micro-interactions, the whitespace, the exact tension in a bezier curve, 
                and the tone of voice in your error messages. We obsess over the details so your customers feel the value 
                before they even read the copy.
            </p>
         </div>
      </section>
      <MadLibsFooter />
      </main>
      <Footer />
    </>
  );
}
