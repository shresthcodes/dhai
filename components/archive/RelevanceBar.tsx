"use client";

import React, { useEffect, useRef } from "react";
import { motion, useMotionValue, useSpring } from "framer-motion";
import { cn } from "@/lib/utils";

interface RelevanceBarProps {
  score:     number;  // 0-100
  className?: string;
}

export function RelevanceBar({ score, className }: RelevanceBarProps) {
  const width = useSpring(0, { stiffness: 120, damping: 22, mass: 0.8 });

  useEffect(() => {
    // Slight delay so bar animates in when card appears
    const id = setTimeout(() => width.set(score), 120);
    return () => clearTimeout(id);
  }, [score, width]);

  const color =
    score >= 70 ? "bg-gold" :
    score >= 40 ? "bg-azure" :
    "bg-ivory/20";

  return (
    <div className={cn("space-y-1", className)}>
      <div className="flex items-center justify-between">
        <span className="eyebrow text-[0.52rem] text-ivory/30">Demo relevance</span>
        <span className="font-sans text-[0.65rem] text-ivory/40">{score}%</span>
      </div>
      <div className="h-0.5 w-full bg-[rgba(244,237,224,0.06)] rounded-full overflow-hidden">
        <motion.div
          className={cn("h-full rounded-full", color)}
          style={{ width: width.get() + "%" }}
          animate={{ width: `${score}%` }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
        />
      </div>
    </div>
  );
}
