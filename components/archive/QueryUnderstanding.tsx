"use client";

import React from "react";
import { motion } from "framer-motion";
import { Brain, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface QueryUnderstandingProps {
  concepts:   string[];
  total:      number;
  queryTime:  number;
  query:      string;
  className?: string;
}

export function QueryUnderstanding({ concepts, total, queryTime, query, className }: QueryUnderstandingProps) {
  if (!query || !concepts.length) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className={cn(
        "flex flex-wrap items-center gap-3",
        "px-4 py-3 rounded-card border border-azure/15 bg-azure/4",
        className
      )}
      role="status"
      aria-live="polite"
    >
      <div className="flex items-center gap-1.5 shrink-0">
        <motion.div
          animate={{ scale: [1, 1.2, 1] }}
          transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
        >
          <Brain size={13} strokeWidth={1.5} className="text-azure/70" />
        </motion.div>
        <span className="font-sans text-[0.72rem] text-ivory/50">Searching by meaning, not just keywords</span>
      </div>

      <div className="flex flex-wrap gap-1.5" aria-label="Detected concepts">
        {concepts.map((c) => (
          <span
            key={c}
            className="font-sans text-[0.65rem] font-medium text-azure/70 bg-azure/8 border border-azure/20 px-2 py-0.5 rounded-sharp"
          >
            {c}
          </span>
        ))}
      </div>

      <div className="ml-auto flex items-center gap-2 shrink-0">
        <span className="font-sans text-[0.62rem] text-ivory/25">
          {total} result{total !== 1 ? "s" : ""} · {queryTime}ms
        </span>
        <span className="eyebrow text-[0.5rem] text-ivory/20 border border-[rgba(244,237,224,0.1)] px-1.5 py-0.5 rounded-sharp">
          DEMO
        </span>
      </div>
    </motion.div>
  );
}
