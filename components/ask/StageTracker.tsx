"use client";

import React from "react";
import { motion } from "framer-motion";
import { CheckCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { ASK_STAGE_LABELS, type AskStage } from "@/lib/ask/types";

const STAGE_ORDER: AskStage[] = [
  "understanding", "retrieving", "ranking", "composing", "citing",
];

interface StageTrackerProps {
  currentStage: AskStage | null;
  done:         boolean;
}

export function StageTracker({ currentStage, done }: StageTrackerProps) {
  const currentIdx = currentStage ? STAGE_ORDER.indexOf(currentStage) : -1;

  return (
    <div className="flex items-center gap-0 w-full" role="status" aria-label="Processing stages" aria-live="polite">
      {STAGE_ORDER.map((stage, i) => {
        const isDone   = done || currentIdx > i;
        const isActive = !done && currentIdx === i;

        return (
          <React.Fragment key={stage}>
            <div className="flex flex-col items-center gap-1 flex-1">
              <div className={cn(
                "w-7 h-7 rounded-full flex items-center justify-center border transition-all duration-300 text-xs",
                isDone
                  ? "bg-gold/20 border-gold/50 text-gold"
                  : isActive
                    ? "bg-azure/15 border-azure/40 text-azure"
                    : "bg-panel border-[rgba(244,237,224,0.1)] text-ivory/20"
              )}>
                {isDone
                  ? <CheckCircle size={13} strokeWidth={1.5} />
                  : isActive
                    ? <motion.span animate={{ opacity: [1, 0.3, 1] }} transition={{ duration: 1, repeat: Infinity }}>{i + 1}</motion.span>
                    : <span>{i + 1}</span>
                }
              </div>
              <span className={cn(
                "font-sans text-[0.55rem] text-center leading-tight max-w-[64px] hidden sm:block",
                isDone || isActive ? "text-ivory/50" : "text-ivory/20"
              )}>
                {ASK_STAGE_LABELS[stage]}
              </span>
            </div>
            {i < STAGE_ORDER.length - 1 && (
              <div className="flex-1 h-px mx-0.5 overflow-hidden">
                <motion.div
                  className="h-full bg-gold/40"
                  initial={{ scaleX: 0, transformOrigin: "left" }}
                  animate={{ scaleX: isDone ? 1 : 0 }}
                  transition={{ duration: 0.4 }}
                />
                {!isDone && <div className="h-full bg-[rgba(244,237,224,0.06)]" />}
              </div>
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
}
