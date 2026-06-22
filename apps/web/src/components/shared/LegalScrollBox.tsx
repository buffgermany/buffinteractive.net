"use client";

import React, { useRef, useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

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
    // Allow a small threshold (10px) to account for rounding errors
    if (scrollTop + clientHeight >= scrollHeight - 10) {
      setHasScrolledToBottom(true);
      if (onRead) onRead();
    }
  };

  // Check immediately if the content is small enough to not need scrolling
  useEffect(() => {
    if (scrollRef.current) {
      const { scrollHeight, clientHeight } = scrollRef.current;
      if (scrollHeight <= clientHeight) {
        setHasScrolledToBottom(true);
        if (onRead) onRead();
      }
    }
  }, [content]);

  return (
    <div className={cn("border-2 border-primary/20 rounded-xl bg-card flex flex-col overflow-hidden shadow-sm", className)}>
      <div className="bg-muted px-4 py-3 border-b border-primary/20 flex justify-between items-center">
        <h4 className="font-medium text-sm text-foreground">{title}</h4>
        {!hasScrolledToBottom && (
          <span className="text-xs text-muted-foreground animate-pulse">
            Bitte bis zum Ende scrollen ↓
          </span>
        )}
      </div>
      <div 
        ref={scrollRef}
        onScroll={handleScroll}
        className="p-6 h-[400px] overflow-y-auto prose prose-sm dark:prose-invert max-w-none text-muted-foreground bg-background"
      >
        <ReactMarkdown remarkPlugins={[remarkGfm]}>
          {content}
        </ReactMarkdown>
      </div>
    </div>
  );
}
