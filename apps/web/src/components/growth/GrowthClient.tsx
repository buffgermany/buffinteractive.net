'use client';

import { useEffect } from 'react';
import { TopographicBackground } from './TopographicBackground';
import { GrowthHero } from './GrowthHero';
import { GrowthDiagnosis } from './GrowthDiagnosis';
import { GrowthArsenal } from './GrowthArsenal';
import { GrowthParadigm } from './GrowthParadigm';
import { GrowthGate } from './GrowthGate';

export function GrowthClient() {
  // Apply the specific theme background to the body using the class defined in globals.css
  useEffect(() => {
    document.body.classList.add('bg-theme-growth');
    return () => {
      document.body.classList.remove('bg-theme-growth');
    };
  }, []);

  return (
    <main className="relative min-h-screen w-full selection:bg-[#CCFF00] selection:text-[#0A0A0A] pt-16">
      <TopographicBackground />
      <div className="relative z-10 w-full">
        <GrowthHero />
        <GrowthDiagnosis />
        <GrowthArsenal />
        <GrowthParadigm />
        <GrowthGate />
      </div>
    </main>
  );
}
