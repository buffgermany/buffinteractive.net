'use client';

import { FormEvent, useState } from 'react';
import { ChevronDown, ArrowRight } from 'lucide-react';
import { useTranslations } from 'next-intl';

export function GrowthGate() {
  const t = useTranslations('GrowthGate');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hasSubmitted, setHasSubmitted] = useState(false);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    // simulated delay for premium feel
    setTimeout(() => {
      setIsSubmitting(false);
      setHasSubmitted(true);
    }, 1500);
  };

  return (
    <section id="contact" className="relative z-10 w-full py-32 md:py-48 bg-[#050207] border-t border-white/5">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(204,255,0,0.03)_0%,transparent_70%)] pointer-events-none" />
      
      <div className="max-w-4xl mx-auto px-6 md:px-12 w-full flex flex-col gap-16 relative z-10">
        <div className="flex flex-col gap-6 text-center md:text-left">
          <h2 className="text-5xl md:text-7xl font-heading font-bold text-white tracking-tighter">
            {t('title')}
          </h2>
          <p className="text-xl md:text-2xl text-[#A0A0B0] font-sans leading-relaxed max-w-3xl">
            {t('subtext')}
          </p>
        </div>

        {hasSubmitted ? (
            <div className="flex flex-col items-center justify-center py-24 glass rounded-3xl text-center border-t border-white/10 shadow-[0_0_100px_-20px_rgba(204,255,0,0.15)]">
               <div className="w-16 h-16 rounded-full bg-[#CCFF00] text-black flex items-center justify-center font-bold text-3xl mb-8">✓</div>
               <h3 className="text-3xl font-heading font-bold text-white mb-4">{t('success_title')}</h3>
               <p className="text-[#A0A0B0] text-lg font-sans max-w-md">{t('success_text')}</p>
            </div>
        ) : (
            <form onSubmit={handleSubmit} className="flex flex-col gap-8 w-full glass rounded-3xl p-8 md:p-14 shadow-2xl relative overflow-hidden backdrop-blur-2xl">
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 w-full">
                <div className="flex flex-col gap-3 relative group">
                <label htmlFor="name" className="text-sm font-bold uppercase tracking-widest text-[#A0A0B0] group-focus-within:text-[#CCFF00] transition-colors">{t('form_name')}</label>
                <input required type="text" id="name" className="bg-transparent border-b-2 border-white/10 py-3 text-white font-sans text-xl outline-none focus:border-[#CCFF00] transition-colors placeholder:text-white/20 w-full rounded-none" placeholder="Jane Doe" />
                </div>
                
                <div className="flex flex-col gap-3 relative group">
                <label htmlFor="company" className="text-sm font-bold uppercase tracking-widest text-[#A0A0B0] group-focus-within:text-[#CCFF00] transition-colors">{t('form_company')}</label>
                <input required type="text" id="company" className="bg-transparent border-b-2 border-white/10 py-3 text-white font-sans text-xl outline-none focus:border-[#CCFF00] transition-colors placeholder:text-white/20 w-full rounded-none" placeholder="Acme Corp" />
                </div>
            </div>

            <div className="flex flex-col gap-3 relative group mt-4">
                <label htmlFor="mrr" className="text-sm font-bold uppercase tracking-widest text-[#A0A0B0] group-focus-within:text-[#CCFF00] transition-colors">{t('form_mrr')}</label>
                <div className="relative">
                <select required id="mrr" defaultValue="" className="w-full appearance-none bg-transparent border-b-2 border-white/10 py-3 text-white font-sans text-xl outline-none focus:border-[#CCFF00] transition-colors [&>option]:bg-[#100515] [&>option]:text-white cursor-pointer rounded-none">
                    <option value="" disabled className="text-white/20">{t('form_mrr_placeholder')}</option>
                    <option value="under50k">{t('form_mrr_option1')}</option>
                    <option value="50k-250k">{t('form_mrr_option2')}</option>
                    <option value="250k-1m">{t('form_mrr_option3')}</option>
                    <option value="over1m">{t('form_mrr_option4')}</option>
                </select>
                <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 text-[#CCFF00] pointer-events-none" />
                </div>
            </div>

            <div className="flex flex-col gap-3 relative group mt-4">
                <label htmlFor="bottleneck" className="text-sm font-bold uppercase tracking-widest text-[#A0A0B0] group-focus-within:text-[#CCFF00] transition-colors">{t('form_bottleneck')}</label>
                <textarea required id="bottleneck" rows={4} className="bg-transparent border-b-2 border-white/10 py-3 text-white font-sans text-xl outline-none focus:border-[#CCFF00] transition-colors resize-none placeholder:text-white/20 w-full rounded-none" placeholder={t('form_bottleneck_placeholder')} />
            </div>

            <div className="mt-8 w-full flex">
                <button disabled={isSubmitting} type="submit" className="w-full group flex items-center justify-center gap-3 bg-[#CCFF00] text-[#0A0A0A] font-bold text-xl py-6 rounded-2xl hover:shadow-[0_0_40px_-10px_rgba(204,255,0,0.5)] disabled:opacity-50 transition-all uppercase tracking-tighter">
                {isSubmitting ? t('form_submit_pending') : t('form_submit')}
                {!isSubmitting && <ArrowRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />}
                </button>
            </div>
            </form>
        )}
      </div>
    </section>
  );
}
