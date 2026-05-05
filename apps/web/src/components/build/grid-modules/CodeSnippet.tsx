"use client";

import React from "react";
import { Code } from "lucide-react";
import { GridModule } from "./GridModule";

export const CodeSnippet = () => {
  return (
    <GridModule className="col-span-4 row-span-3 font-mono text-[11px] leading-loose relative">
      <div className="absolute top-0 right-0 p-6 opacity-20"><Code className="w-6 h-6 text-white" /></div>
      <div className="flex gap-2 mb-6 border-b border-white/5 pb-4">
        <div className="w-2.5 h-2.5 rounded-full bg-[#FF5F56]/40" />
        <div className="w-2.5 h-2.5 rounded-full bg-[#FFBD2E]/40" />
        <div className="w-2.5 h-2.5 rounded-full bg-[#27C93F]/40" />
      </div>
      <pre className="text-white/50 opacity-80">
        <span className="text-primary/70">export async function</span> handleRequest(req) {'{\n'}
        {'  '}const {'{ payload }'} = <span className="text-white/80">await</span> req.json();{'\n'}
        {'  '}<span className="text-primary/70">try</span> {'{\n'}
        {'    '}const node = <span className="text-white/80">await</span> resolveEdgeNode(payload);{'\n'}
        {'    '}<span className="text-primary/70">return</span> Response.json({'{\n'}
        {'      '}status: <span className="text-primary/70">200</span>,{'\n'}
        {'      '}latency: <span className="text-white/80">node.latency</span>{'\n'}
        {'    }'});{'\n'}
        {'  }'} <span className="text-primary/70">catch</span> (err) {'{\n'}
        {'    '}reportAnomaly(err);{'\n'}
        {'  }'}{'\n'}
        {'}'}
      </pre>
    </GridModule>
  );
};
