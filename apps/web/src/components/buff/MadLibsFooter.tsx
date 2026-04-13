"use client";

import { useState, FormEvent } from "react";
import { useTranslations } from "next-intl";

export function MadLibsFooter() {
  const t = useTranslations('Contact');
  const [formData, setFormData] = useState({
    name: "",
    company: "",
    problemArea: "Tech-Stack",
    action: "build it from scratch",
    email: ""
  });

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    console.log("Mad Libs Submitted:", formData);
    alert("Message sent. If it's ambitious, we'll reach out.");
  };

  const inputClasses = "bg-transparent border-b-2 border-primary/50 text-primary font-bold focus:outline-none focus:border-primary px-1 min-w-[80px] md:min-w-[120px] max-w-full transition-colors placeholder:text-primary/30";
  const selectClasses = "bg-transparent border-b-2 border-primary/50 text-primary font-bold focus:outline-none focus:border-primary px-1 cursor-pointer appearance-none pr-6 custom-select-arrow transition-colors max-w-full";

  return (
    <section className="bg-surface py-20 md:py-32 px-6 relative overflow-hidden border-t border-white/5">
      
      {/* Decorative large logo or shape behind */}
      <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/3 opacity-5 pointer-events-none">
        <h1 className="text-[20vw] font-heading font-black leading-none text-primary">BUFF</h1>
      </div>

      <div className="relative z-10 max-w-4xl mx-auto flex flex-col items-center text-center">
        
        <h2 className="heading-massive mb-6 text-foreground">{t('title')}</h2>
        <p className="text-lg md:text-xl text-foreground-muted mb-12 md:mb-16 max-w-2xl leading-relaxed">
          {t('subtext')}
        </p>

        <form onSubmit={handleSubmit} className="w-full bg-background rounded-3xl p-6 md:p-12 shadow-2xl border border-white/5">
          <div className="text-left text-xl md:text-3xl lg:text-4xl leading-relaxed md:leading-loose font-medium text-foreground break-words">
            Hi Buff. I am{" "}
            <input 
              type="text" 
              placeholder="Your Name" 
              className={inputClasses}
              value={formData.name}
              onChange={e => setFormData({...formData, name: e.target.value})}
              required
            />
            {" "}from{" "}
            <input 
              type="text" 
              placeholder="Company" 
              className={inputClasses}
              value={formData.company}
              onChange={e => setFormData({...formData, company: e.target.value})}
              required
            />
            . Honestly, right now our{" "}
            <div className="relative inline-block">
              <select 
                className={selectClasses}
                value={formData.problemArea}
                onChange={e => setFormData({...formData, problemArea: e.target.value})}
              >
                <option value="Tech-Stack" className="bg-background text-foreground">Tech-Stack</option>
                <option value="Marketing" className="bg-background text-foreground">Marketing</option>
                <option value="Agency-Chaos" className="bg-background text-foreground">Agency-Chaos</option>
                <option value="Infrastructure" className="bg-background text-foreground">Infrastructure</option>
              </select>
              <div className="absolute right-1 top-1/2 -translate-y-1/2 pointer-events-none border-t-[6px] border-l-[5px] border-r-[5px] border-transparent border-t-primary"></div>
            </div>
            {" "}is holding us back. We need someone who can{" "}
            <div className="relative inline-block">
              <select 
                className={selectClasses}
                value={formData.action}
                onChange={e => setFormData({...formData, action: e.target.value})}
              >
                <option value="build it from scratch" className="bg-background text-foreground">build it from scratch</option>
                <option value="scale it aggressively" className="bg-background text-foreground">scale it aggressively</option>
                <option value="fix the mess" className="bg-background text-foreground">fix the mess</option>
              </select>
              <div className="absolute right-1 top-1/2 -translate-y-1/2 pointer-events-none border-t-[6px] border-l-[5px] border-r-[5px] border-transparent border-t-primary"></div>
            </div>
            . Reach out to me at{" "}
            <input 
              type="email" 
              placeholder="Email address" 
              className={inputClasses}
              value={formData.email}
              onChange={e => setFormData({...formData, email: e.target.value})}
              required
            />
            . Let's go.
          </div>

          <div className="mt-16 flex justify-center">
            <button type="submit" className="interactive-pill bg-[#0A0A0A] border-2 border-primary text-primary px-12 py-4 text-xl hover:bg-primary hover:text-[#0A0A0A] active:scale-95 transition-all">
              Send it.
            </button>
          </div>
        </form>

      </div>
    </section>
  );
}
