"use client";

import React, { useState } from "react";
import { RemoteOrderFormFlow, RemoteInviteData } from "./RemoteOrderFormFlow";
import { RemoteSignDealOverview } from "./RemoteSignDealOverview";
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
  const [selectedTarif] = useState(inviteData.tarif);
  const [selectedZahlungsrhythmus] = useState(inviteData.zahlungsrhythmus);

  const handleStartSign = () => {
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleBackToOverview = () => {
    setShowForm(false);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  if (showForm) {
    return (
      <>
        <HeaderCheckout />
        <div className="pt-24 pb-20 px-4 min-h-screen bg-[#050505] text-foreground">
          <div className="w-full max-w-4xl mx-auto relative z-10">
            <RemoteOrderFormFlow
              invite={inviteData}
              termsContent={termsContent}
              avvContent={avvContent}
              sepaContent={sepaContent}
              overrideTarif={selectedTarif}
              overrideZahlungsrhythmus={selectedZahlungsrhythmus}
              onBackToOverview={handleBackToOverview}
            />
          </div>
        </div>
        <FootnotesSection />
        <Footer />
      </>
    );
  }

  return (
    <>
      <HeaderCheckout />
      <div className="pt-20 bg-[#050505] min-h-screen">
        <RemoteSignDealOverview
          invite={inviteData}
          onStartSign={handleStartSign}
        />
        <FaqSection />
        <FootnotesSection />
        <Footer />
      </div>
    </>
  );
}

