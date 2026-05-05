"use client";

import React from "react";
import { motion } from "framer-motion";
import { Lock } from "lucide-react";
import { GridModule } from "./GridModule";

const SECURITY_POLICIES = [
  { label: 'Ingress Firewall', status: 'Active', accent: true },
  { label: 'DDoS Mitigation', status: 'Monitoring', accent: false },
  { label: 'Zero-Trust Proxy', status: 'Enforced', accent: true },
  { label: 'Rate Limiting', status: 'Active', accent: true }
];

export const SecurityPolicies = () => {
  return (
    <GridModule title="Security Policies" icon={Lock} className="col-span-3 row-span-3 gap-6">
      <div className="flex flex-col gap-3">
         {SECURITY_POLICIES.map((policy, i) => (
           <motion.div 
             key={policy.label} 
             initial={{ opacity: 0, y: 10 }}
             animate={{ opacity: 1, y: 0 }}
             transition={{ delay: 0.2 + (i * 0.05) }}
             className="flex justify-between items-center bg-white/[0.03] p-3 rounded-xl border border-white/5"
           >
             <span className="font-mono text-[10px] text-white/70">{policy.label}</span>
             <motion.span 
              animate={policy.accent ? { opacity: [0.6, 1, 0.6] } : {}}
              transition={{ duration: 2, repeat: Infinity }}
              className={`font-mono text-[9px] ${policy.accent ? 'text-primary' : 'text-white/60'}`}
             >
               {policy.status}
             </motion.span>
           </motion.div>
         ))}
      </div>
    </GridModule>
  );
};
