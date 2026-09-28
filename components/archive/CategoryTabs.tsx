"use client";

import React, { useRef } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

const TABS = [
  { label: "All",                   value: "" },
  { label: "Writings",              value: "writing" },
  { label: "Speeches",              value: "speech" },
  { label: "Manuscripts",           value: "manuscript" },
  { label: "Constitutional Debates",value: "debate" },
  { label: "Photographs",           value: "photograph" },
  { label: "Historical Records",    value: "record" },
  { label: "Audio-Visual",          value: "audio,video" },
] as const;

type TabValue = typeof TABS[number]["value"];

interface CategoryTabsProps {
  active:   string;
  onChange: (v: string) => void;
}

export function CategoryTabs({ active, onChange }: CategoryTabsProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  return (
    <div
      ref={containerRef}
      role="tablist"
      aria-label="Archive categories"
      className="flex items-center gap-0 overflow-x-auto scrollbar-none"
    >
      {TABS.map(({ label, value }) => {
        const isActive = active === value;
        return (
          <button
            key={value}
            role="tab"
            aria-selected={isActive}
            onClick={() => onChange(value)}
            className={cn(
              "relative shrink-0 px-4 py-3 font-sans text-[0.8125rem] font-medium",
              "transition-colors duration-200 whitespace-nowrap",
              "focus-visible:outline focus-visible:outline-2 focus-visible:outline-gold focus-visible:rounded-sharp",
              isActive ? "text-gold" : "text-ivory/50 hover:text-ivory/80"
            )}
          >
            {label}
            {isActive && (
              <motion.span
                layoutId="tab-underline"
                className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-gold to-transparent"
                transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
              />
            )}
          </button>
        );
      })}
    </div>
  );
}
