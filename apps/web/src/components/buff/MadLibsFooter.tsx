"use client";

import { useState, FormEvent } from "react";
import { useTranslations } from "next-intl";
import { api } from "@/lib/api";
import { toast } from "@/components/ui/toast";
import { Loader2 } from "lucide-react";

export function MadLibsFooter() {
  const t = useTranslations('Contact');
  const [formData, setFormData] = useState({
    name: "",
    company: "",
    problemArea: "Tech-Stack",
    action: "build it from scratch",
    email: ""
  });

  const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setStatus('submitting');

    try {
        const { error } = await api.v1.leads.post(formData);
        
        if (error) {
            console.error("API Error:", error);
            setStatus('error');
            return;
        }

        setStatus('success');
        
        // Reset form
        setFormData({
            name: "",
            company: "",
            problemArea: "Tech-Stack",
            action: "build it from scratch",
            email: ""
        });
    } catch (err) {
        console.error("Submission error:", err);
        setStatus('error');
    }
  };

  const inputClasses = "bg-transparent border-b-2 border-primary/50 text-primary font-bold focus:outline-none focus:border-primary px-1 min-w-[80px] md:min-w-[120px] max-w-full transition-colors placeholder:text-primary/30";
  const selectClasses = "bg-transparent border-b-2 border-primary/50 text-primary font-bold focus:outline-none focus:border-primary px-1 cursor-pointer appearance-none pr-6 custom-select-arrow transition-colors max-w-full";

  return (
    <section id="contact" className="bg-surface py-20 md:py-32 px-6 relative overflow-hidden border-t border-white/5">
      
      {/* Decorative large logo or shape behind */}
      <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/3 opacity-5 pointer-events-none">
        <h1 className="text-[20vw] font-heading font-bold leading-none text-primary">BUFF</h1>
      </div>

      <div className="relative z-10 max-w-4xl mx-auto flex flex-col items-center text-center">
        
        <h2 className="heading-massive mb-6 text-foreground">{t('title')}</h2>
        <p className="text-lg md:text-xl text-foreground-muted mb-12 md:mb-16 max-w-2xl leading-relaxed">
          {t('subtext')}
        </p>

        <div className="w-full bg-background rounded-3xl p-6 md:p-12 shadow-2xl border border-white/5 overflow-hidden">
          {status === 'success' ? (
            <div className="py-20 flex flex-col items-center animate-in fade-in zoom-in duration-500">
              <div className="w-16 h-16 bg-primary text-background rounded-full flex items-center justify-center mb-8">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
              </div>
              <h3 className="text-3xl md:text-5xl font-heading font-bold text-foreground mb-4">{t('success_title')}</h3>
              <button 
                onClick={() => setStatus('idle')}
                className="mt-12 text-primary hover:underline font-bold text-lg"
              >
                {t('success_retry')}
              </button>
            </div>
          ) : status === 'error' ? (
            <div className="py-20 flex flex-col items-center animate-in fade-in zoom-in duration-500">
              <div className="w-16 h-16 border-2 border-red-500 text-red-500 rounded-full flex items-center justify-center mb-8">
                <span className="text-2xl font-bold">!</span>
              </div>
              <h3 className="text-3xl md:text-5xl font-heading font-bold text-foreground mb-4">{t('error_title')}</h3>
              <p className="text-foreground-muted text-lg md:text-xl max-w-md">
                {t('error_text')}
              </p>
              <button 
                onClick={() => setStatus('idle')}
                className="mt-12 interactive-pill bg-primary text-background px-10 py-3 text-lg font-bold hover:scale-105 transition-transform"
              >
                {t('error_retry')}
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit}>
              <div className="text-left text-xl md:text-3xl lg:text-4xl leading-relaxed md:leading-loose font-medium text-foreground break-words">
                {t('hi')}{" "}
                <input 
                  type="text" 
                  placeholder={t('placeholder_name')} 
                  className={inputClasses}
                  value={formData.name}
                  onChange={e => setFormData({...formData, name: e.target.value})}
                  required
                />
                {" "}{t('from')}{" "}
                <input 
                  type="text" 
                  placeholder={t('placeholder_company')} 
                  className={inputClasses}
                  value={formData.company}
                  onChange={e => setFormData({...formData, company: e.target.value})}
                  required
                />
                {t('honestly')}{" "}
                <div className="relative inline-block">
                  <select 
                    className={selectClasses}
                    value={formData.problemArea}
                    onChange={e => setFormData({...formData, problemArea: e.target.value})}
                  >
                    <option value="Tech-Stack" className="bg-background text-foreground">{t('select_problem_tech')}</option>
                    <option value="Marketing" className="bg-background text-foreground">{t('select_problem_marketing')}</option>
                    <option value="Agency-Chaos" className="bg-background text-foreground">{t('select_problem_chaos')}</option>
                    <option value="Infrastructure" className="bg-background text-foreground">{t('select_problem_infra')}</option>
                  </select>
                  <div className="absolute right-1 top-1/2 -translate-y-1/2 pointer-events-none border-t-[6px] border-l-[5px] border-r-[5px] border-transparent border-t-primary"></div>
                </div>
                {" "}{t('holding_back')}{" "}
                <div className="relative inline-block">
                  <select 
                    className={selectClasses}
                    value={formData.action}
                    onChange={e => setFormData({...formData, action: e.target.value})}
                  >
                    <option value="build it from scratch" className="bg-background text-foreground">{t('select_action_build')}</option>
                    <option value="scale it aggressively" className="bg-background text-foreground">{t('select_action_scale')}</option>
                    <option value="fix the mess" className="bg-background text-foreground">{t('select_action_fix')}</option>
                  </select>
                  <div className="absolute right-1 top-1/2 -translate-y-1/2 pointer-events-none border-t-[6px] border-l-[5px] border-r-[5px] border-transparent border-t-primary"></div>
                </div>
                {t('reach_out')}{" "}
                <input 
                  type="email" 
                  placeholder={t('placeholder_email')} 
                  className={inputClasses}
                  value={formData.email}
                  onChange={e => setFormData({...formData, email: e.target.value})}
                  required
                />
                {t('lets_go')}
              </div>

              <div className="mt-16 flex justify-center">
                <button 
                    type="submit" 
                    disabled={status === 'submitting'}
                    className="interactive-pill bg-[#0A0A0A] border-2 border-primary text-primary px-12 py-4 text-xl hover:bg-primary hover:text-[#0A0A0A] active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-3"
                >
                  {status === 'submitting' && <Loader2 className="animate-spin" size={24} />}
                  {status === 'submitting' ? t('submit_btn_pending') : t('submit_btn')}
                </button>
              </div>
            </form>
          )}
        </div>

      </div>
    </section>
  );
}
