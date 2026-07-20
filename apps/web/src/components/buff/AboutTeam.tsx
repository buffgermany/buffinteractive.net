"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { useTranslations } from 'next-intl';

const teamMembers = [
  {
    name: "Felix",
    roleKey: "team_felix_role",
    image: "https://images.unsplash.com/photo-1599566150163-29194dcaad36",
    bio: "Visionary leader with a passion for scalable tech and design systems. Building the future of digital presence."
  },
  {
    name: "Leon",
    roleKey: "team_leon_role",
    image: "https://images.unsplash.com/photo-1599566150163-29194dcaad36",
    bio: "Tech enthusiast and architect behind our robust infrastructure. Obsessed with performance and clean code."
  },
  {
    name: "Luca",
    roleKey: "team_luca_role",
    image: "https://images.unsplash.com/photo-1599566150163-29194dcaad36",
    bio: "Creative mind turning complex problems into intuitive user experiences. Lover of details and motion design."
  },
  {
    name: "Marc",
    roleKey: "team_marc_role",
    image: "https://images.unsplash.com/photo-1599566150163-29194dcaad36",
    bio: "Growth and strategy specialist. Bridging the gap between product development and market success."
  }
];

export function AboutTeam() {
  const t = useTranslations('About');
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  const handlePointerEnter = (i: number) => {
    if (typeof window !== 'undefined' && window.matchMedia('(hover: hover)').matches) {
      setActiveIndex(i);
    }
  };

  const handlePointerLeave = () => {
    if (typeof window !== 'undefined' && window.matchMedia('(hover: hover)').matches) {
      setActiveIndex(null);
    }
  };

  const handleClick = (i: number) => {
    if (typeof window !== 'undefined' && !window.matchMedia('(hover: hover)').matches) {
      setActiveIndex(activeIndex === i ? null : i);
    }
  };

  return (
    <section className="py-24 px-6 lg:px-12 bg-background">
      <div className="max-w-7xl mx-auto w-full">
        <div className="mb-16 text-center">
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-3xl md:text-5xl font-bold tracking-tight mb-4 text-foreground font-sans"
          >
            {t('team_title')}
          </motion.h2>
        </div>

        <div className="flex flex-col md:flex-row w-full gap-4 h-[800px] md:h-[600px]">
          {teamMembers.map((member, i) => {
            const isFounder = member.name === "Felix" || member.name === "Leon";
            const isExpanded = activeIndex === i;
            
            let flexClass = isFounder ? "flex-[2]" : "flex-[1]";
            if (activeIndex !== null) {
              flexClass = isExpanded ? "flex-[4]" : "flex-[1]";
            }

            return (
              <motion.div
                key={member.name}
                initial={{ opacity: 0, y: 100 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ delay: i * 0.15, duration: 0.8, ease: [0.25, 1, 0.5, 1] }}
                onPointerEnter={() => handlePointerEnter(i)}
                onPointerLeave={handlePointerLeave}
                onClick={() => handleClick(i)}
                className={`relative rounded-3xl bg-surface border border-border overflow-hidden transition-all duration-700 ease-[cubic-bezier(0.25,1,0.5,1)] cursor-pointer group flex flex-col justify-end p-6 md:p-8 ${flexClass}`}
              >
                {/* Background Image with subtle zoom on hover */}
                <div 
                  className="absolute inset-0 bg-cover bg-center transition-transform duration-700 ease-[cubic-bezier(0.25,1,0.5,1)] group-hover:scale-105"
                  style={{ backgroundImage: `url(${member.image})` }}
                />

                <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-background/40 to-transparent z-10 pointer-events-none" />
                
                {/* Subtle highlight gradient when expanded */}
                <div className={`absolute inset-0 bg-primary/20 transition-opacity duration-700 z-10 ${isExpanded ? 'opacity-100' : 'opacity-0'}`} style={{ mixBlendMode: 'overlay' }} />
                
                <div className="relative z-20 flex flex-col justify-end h-full">
                  <h3 className="text-2xl md:text-4xl font-bold text-white font-sans whitespace-nowrap mb-1 md:mb-2 transition-all duration-700 ease-[cubic-bezier(0.25,1,0.5,1)] drop-shadow-md">
                    {member.name}
                  </h3>
                  
                  <div 
                    className={`overflow-hidden transition-all duration-700 ease-[cubic-bezier(0.25,1,0.5,1)] ${
                      isExpanded ? "max-h-60 opacity-100" : "max-h-0 opacity-0"
                    }`}
                  >
                    <p className="text-sm md:text-base text-white/90 font-bold uppercase tracking-wider font-sans pt-2 drop-shadow-sm">
                      {t(member.roleKey as any)}
                    </p>
                    <p className="text-base md:text-lg text-white/80 font-sans leading-relaxed pt-2 drop-shadow-sm">
                      {member.bio}
                    </p>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
