"use client";

import React, { useState } from "react";
import { RemoteOrderFormFlow, RemoteInviteData } from "./RemoteOrderFormFlow";
import { GrowthParadigmCheckout } from "./GrowthParadigmCheckout";
import { FaqSection } from "@/components/products/waas/FaqSection";
import { FootnotesSection } from "@/components/buff/FootnotesSection";
import { HeaderCheckout } from "@/components/buff/HeaderCheckout";
import { Footer } from "@/components/buff/Footer";

interface RemoteSignClientWrapperProps {
  inviteData: RemoteInviteData;
  termsContent: string;
  avvContent: string;
  sepaContent: string;
}

export function RemoteSignClientWrapper({
  inviteData,
  termsContent,
  avvContent,
  sepaContent,
}: RemoteSignClientWrapperProps) {
  const [showForm, setShowForm] = useState(false);
  const [selectedTarif, setSelectedTarif] = useState(inviteData.tarif);
  const [selectedZahlungsrhythmus, setSelectedZahlungsrhythmus] = useState(inviteData.zahlungsrhythmus);

  const handleSelectPlan = (tarif: string, zahlungsrhythmus: string) => {
    setSelectedTarif(tarif);
    setSelectedZahlungsrhythmus(zahlungsrhythmus);
    setShowForm(true);
    // Scroll to top
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  if (showForm) {
    return (
      <div className="w-full max-w-4xl mx-auto py-12 px-4 relative z-10">
        <RemoteOrderFormFlow
          invite={inviteData}
          termsContent={termsContent}
          avvContent={avvContent}
          sepaContent={sepaContent}
          overrideTarif={selectedTarif}
          overrideZahlungsrhythmus={selectedZahlungsrhythmus}
        />
      </div>
    );
  }

  return (
    <>
      <HeaderCheckout />
      <div className="pt-16">
        <GrowthParadigmCheckout 
          inviteTarif={inviteData.tarif} 
          onSelectPlan={handleSelectPlan} 
        />
        <FaqSection />
        <FootnotesSection />
        <Footer />
      </div>
    </>
  );
}
