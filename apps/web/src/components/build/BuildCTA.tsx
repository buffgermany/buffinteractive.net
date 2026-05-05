"use client";

import { motion } from "framer-motion";

import { useTranslations } from "next-intl";

export const BuildCTA = () => {
  const t = useTranslations('Build');

  return (
    <section id="architecture-review" className="py-32 px-6 border-t border-border/50 relative overflow-hidden bg-transparent">
      <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-20 relative z-10">
        <div className="flex flex-col gap-8">
          <h2 className="text-4xl md:text-5xl lg:text-7xl font-bold font-heading text-foreground tracking-tight leading-tight">
            {t.rich('cta_header', {
              br: () => <br />
            })}
          </h2>
          <p className="text-foreground-muted text-xl leading-relaxed font-sans max-w-md">
            {t('cta_subtext')}
          </p>
        </div>

        <form className="flex flex-col gap-6" onSubmit={(e) => e.preventDefault()}>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="flex flex-col gap-3">
              <label htmlFor="name" className="text-xs font-bold tracking-[0.2em] text-foreground-muted uppercase font-heading">{t('form_name')}</label>
              <input 
                id="name"
                type="text" 
                placeholder="John Doe"
                className="bg-surface border border-border rounded-2xl p-4 text-foreground focus:outline-none focus:border-primary transition-all focus:bg-surface/80"
              />
            </div>
            <div className="flex flex-col gap-3">
              <label htmlFor="role" className="text-xs font-bold tracking-[0.2em] text-foreground-muted uppercase font-heading">{t('form_role')}</label>
              <input 
                id="role"
                type="text" 
                placeholder="CTO / Founder"
                className="bg-surface border border-border rounded-2xl p-4 text-foreground focus:outline-none focus:border-primary transition-all focus:bg-surface/80"
              />
            </div>
          </div>
          
          <div className="flex flex-col gap-3">
            <label htmlFor="challenge" className="text-xs font-bold tracking-[0.2em] text-foreground-muted uppercase font-heading">{t('form_challenge')}</label>
            <textarea 
              id="challenge"
              placeholder={t('form_challenge_placeholder')}
              rows={5}
              className="bg-surface border border-border rounded-2xl p-4 text-foreground focus:outline-none focus:border-primary transition-all focus:bg-surface/80 resize-none"
            />
          </div>

          <motion.button
            whileHover={{ scale: 1.01, boxShadow: "0 0 30px hsl(var(--primary)/0.3)" }}
            whileTap={{ scale: 0.99 }}
            className="w-full py-5 interactive-pill bg-primary text-primary-foreground font-heading font-extrabold uppercase tracking-[0.2em] transition-all text-lg mt-4 shadow-[0_0_20px_hsl(var(--primary)/0.2)]"
          >
            {t('form_submit')}
          </motion.button>
        </form>
      </div>

      {/* Decorative gradient */}
      <div className="absolute -bottom-[20%] -right-[10%] w-[50%] h-[50%] bg-primary/5 blur-[120px] rounded-full pointer-events-none" />
    </section>
  );
};
