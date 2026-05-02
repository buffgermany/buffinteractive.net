import { useTranslations } from 'next-intl';
import { BentoCard } from '@/components/buff/BentoCard';
import { Target, Zap, Code } from 'lucide-react';

export function GrowthArsenal() {
  const t = useTranslations('GrowthArsenal');
  
  return (
    <section 
      id="architecture" 
      className="relative py-24 md:py-32 px-6 overflow-hidden bg-[#050505]"
      style={{
        maskImage: `linear-gradient(to bottom, transparent, black 2%, black 100%)`,
        WebkitMaskImage: `linear-gradient(to bottom, transparent, black 2%, black 100%)`
      }}
    >
      <div className="max-w-6xl mx-auto w-full relative z-10 flex flex-col gap-12">
        <h2 className="text-4xl md:text-6xl font-heading font-bold text-white tracking-tighter text-center">{t('title')}</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full">
          {/* Box 1 (Strategy) */}
          <BentoCard className="md:col-span-2 md:min-h-[380px]">
            <div className="flex flex-col justify-between h-full">
              <Target className="w-10 h-10 text-[#CCFF00] mb-8" />
              <div>
                <h3 className="text-3xl md:text-5xl text-white font-heading font-bold mb-6">{t('card1_title')}</h3>
                <p className="text-lg md:text-2xl text-[#A0A0B0] font-sans max-w-3xl leading-relaxed">
                  {t('card1_text')}
                </p>
              </div>
            </div>
          </BentoCard>

          {/* Box 2 (Acquisition) */}
          <BentoCard className="min-h-[320px]">
            <div>
              <Zap className="w-8 h-8 text-[#CCFF00] mb-6" />
              <h3 className="text-xl md:text-2xl font-bold text-white mb-3">{t('card2_title')}</h3>
              <p className="text-[#A0A0B0] leading-relaxed text-sm md:text-base">
                {t('card2_text')}
              </p>
            </div>
          </BentoCard>

          {/* Box 3 (Execution) */}
          <BentoCard className="min-h-[320px]">
            <div>
              <Code className="w-8 h-8 text-[#CCFF00] mb-6" />
              <h3 className="text-xl md:text-2xl font-bold text-white mb-3">{t('card3_title')}</h3>
              <p className="text-[#A0A0B0] leading-relaxed text-sm md:text-base">
                {t('card3_text')}
              </p>
            </div>
          </BentoCard>
        </div>
      </div>

      {/* Visual Transition: Connecting Line to Paradigm */}
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[1px] h-24 bg-gradient-to-t from-primary/50 to-transparent z-20 pointer-events-none" />
    </section>
  );
}
