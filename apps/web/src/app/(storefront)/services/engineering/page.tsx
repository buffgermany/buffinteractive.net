import { Metadata } from 'next';
import Link from 'next/link';
import { Header } from '@/components/buff/Header';
import { Footer } from '@/components/buff/Footer';
import { MadLibsFooter } from '@/components/buff/MadLibsFooter';

export const metadata: Metadata = {
  title: 'Engineering | Buff',
  description: 'Custom software, high-performance hosting, and SaaS infrastructures.',
};

export default function EngineeringPage() {
  return (
    <>
      <Header />
      <main className="min-h-screen bg-background">
      <section className="pt-48 pb-24 px-6 md:px-12 max-w-7xl mx-auto">
        <div className="flex flex-col items-center text-center">
            <h1 className="heading-massive text-foreground mb-8">
                The Build.
            </h1>
            <p className="text-xl md:text-2xl text-foreground-muted max-w-3xl mx-auto leading-relaxed mb-12">
                You want a finished, working product — not a 50-page technical documentation. 
                We handle the complexity, the infrastructure, and the edge-cases so you can actually run your business. <span className="text-foreground font-medium">No tech-debt, no excuses. Just execution.</span>
            </p>
            <Link href="/#contact" className="interactive-pill bg-[#00F0FF] text-[#0A0A0A] border-2 border-[#00F0FF] px-10 py-4 font-bold text-lg hover:shadow-[0_0_30px_rgba(0,240,255,0.4)] transition-all">
                Let's Build It
            </Link>
        </div>
      </section>

      <section className="py-24 px-6 md:px-12 max-w-7xl mx-auto border-t border-white/5">
        <h2 className="text-4xl md:text-5xl font-heading font-bold mb-16 text-center">Forget the How. <br className="hidden md:block"/> Focus on the Done.</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
                { title: "Zero Maintenance", desc: "We build systems that don't need a babysitter. No crashes, no 'scheduled maintenance' — just uptime." },
                { title: "Infinite Scale", desc: "From your first 100 users to your first 100 million. Your tech won't be the bottleneck. Ever." },
                { title: "Ironclad Security", desc: "Data breaches are for amateurs. We implement banking-grade security from day one." },
                { title: "Absolute Speed", desc: "Seconds cost millions. We build at the edge to ensure your users never have to wait." },
                { title: "Seamless Handoff", desc: "Finished products, fully tested. We don't drop half-baked code in your lap." },
                { title: "Technical Clarity", desc: "We talk in results, not buzzwords. You'll know exactly what's done and why it wins." },
            ].map((f, i) => (
                <div key={i} className="glass p-8 rounded-3xl border border-[#00F0FF]/20 hover:border-[#00F0FF] transition-colors group">
                    <h3 className="text-2xl font-bold mb-3 text-foreground">{f.title}</h3>
                    <p className="text-foreground-muted leading-relaxed">{f.desc}</p>
                </div>
            ))}
        </div>
      </section>
      <MadLibsFooter />
      </main>
      <Footer />
    </>
  );
}
