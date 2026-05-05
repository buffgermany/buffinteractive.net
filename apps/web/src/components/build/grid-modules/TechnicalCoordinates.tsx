"use client";

import React from "react";

export const TechnicalCoordinates = () => {
  return (
    <>
      <div className="absolute top-[10%] left-[45%] font-mono text-[8px] text-white/10 rotate-90 tracking-[0.5em] pointer-events-none">
        X: 42.0839 // Y: -71.0589 // LATENCY: 0.12ms
      </div>
      <div className="absolute bottom-[20%] right-[35%] font-mono text-[8px] text-white/10 tracking-[0.5em] pointer-events-none">
        BUF_OVRFLOW_DETECTED // AUTO_REPAIR: ON
      </div>
      <div className="absolute top-[50%] left-[5%] font-mono text-[8px] text-white/10 -rotate-90 tracking-[0.5em] pointer-events-none">
        ENCRYPTION: AES-256-GCM // STATUS: SECURE
      </div>
    </>
  );
};
