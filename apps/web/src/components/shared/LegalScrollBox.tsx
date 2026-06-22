"use client";
import React, { useRef, useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Check } from "lucide-react";

interface LegalScrollBoxProps {
  title: string;
  content: string;
  onRead?: () => void;
  className?: string;
}

export function LegalScrollBox({ title, content, onRead, className }: LegalScrollBoxProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [hasScrolledToBottom, setHasScrolledToBottom] = useState(false);

  const handleScroll = () => {
    if (!scrollRef.current || hasScrolledToBottom) return;

    const { scrollTop, scrollHeight, clientHeight } = scrollRef.current;
    // Allow a small threshold (15px) to account for rounding errors on high-DPI zoom screens
    if (scrollTop + clientHeight >= scrollHeight - 15) {
      setHasScrolledToBottom(true);
      if (onRead) onRead();
    }
  };

  // Check immediately if the content is small enough to not need scrolling
  useEffect(() => {
    if (scrollRef.current) {
      const { scrollHeight, clientHeight } = scrollRef.current;
      if (scrollHeight <= clientHeight && scrollHeight > 0) {
        setHasScrolledToBottom(true);
        if (onRead) onRead();
      }
    }
  }, [content, onRead]);

  return (
    <div
      className={cn(
        "border-2 rounded-xl bg-card flex flex-col overflow-hidden shadow-sm transition-all duration-300",
        hasScrolledToBottom ? "border-emerald-500/40 shadow-emerald-950/5" : "border-primary/20",
        className
      )}
    >
      <div
        className={cn(
          "px-4 py-3 border-b flex justify-between items-center transition-colors duration-300",
          hasScrolledToBottom ? "bg-emerald-950/10 border-emerald-500/20" : "bg-muted border-primary/20"
        )}
      >
        <h4 className="font-medium text-sm text-foreground">{title}</h4>
        {hasScrolledToBottom ? (
          <span className="flex items-center gap-1 text-xs font-semibold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full animate-fade-in">
            <Check className="w-3.5 h-3.5" /> Gelesen
          </span>
        ) : (
          <span className="text-xs text-muted-foreground animate-pulse font-medium">
            Bitte vollständig lesen
          </span>
        )}
      </div>
      <div
        ref={scrollRef}
        onScroll={handleScroll}
        className="p-6 h-[32vh] min-h-[250px] max-h-[400px] overflow-y-auto prose prose-sm dark:prose-invert max-w-none text-muted-foreground bg-background/50 scrollbar-thin"
      >
        <ReactMarkdown remarkPlugins={[remarkGfm]}>
          {content}
        </ReactMarkdown>
      </div>
    </div>
  );
}

