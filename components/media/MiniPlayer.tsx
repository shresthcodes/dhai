"use client";

import React from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Play, Pause, X, ExternalLink } from "lucide-react";
import { usePlaybackStore } from "@/store/playback";
import { cn } from "@/lib/utils";
import { formatDuration } from "@/data/mediaService";

export function MiniPlayer() {
  const { activeId, title, isPlaying, currentSec, durationSec, setPlaying, stop } = usePlaybackStore();
  const progress = durationSec > 0 ? (currentSec / durationSec) * 100 : 0;

  return (
    <AnimatePresence>
      {activeId && (
        <motion.div
          initial={{ y: 80, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 80, opacity: 0 }}
          transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
          className="fixed bottom-0 left-0 right-0 z-[140] glass border-t border-[rgba(244,237,224,0.1)]"
          role="region"
          aria-label="Mini player"
        >
          {/* Progress line */}
          <div className="h-0.5 w-full bg-[rgba(244,237,224,0.06)]">
            <div className="h-full bg-gold/60 transition-all duration-1000" style={{ width: `${progress}%` }} />
          </div>

          <div className="max-w-4xl mx-auto px-4 py-2.5 flex items-center gap-4">
            {/* Play/Pause */}
            <button
              onClick={() => setPlaying(!isPlaying)}
              className="w-8 h-8 rounded-full bg-gold/80 text-ink flex items-center justify-center hover:bg-gold transition-colors shrink-0 focus-visible:outline-gold"
              aria-label={isPlaying ? "Pause" : "Play"}
            >
              {isPlaying ? <Pause size={13} strokeWidth={2} /> : <Play size={13} strokeWidth={2} className="ml-0.5" />}
            </button>

            {/* Title */}
            <div className="flex-1 min-w-0 space-y-0">
              <p className="font-sans text-xs text-ivory/70 truncate">{title}</p>
              <p className="font-sans text-[0.6rem] text-ivory/30 tabular-nums">
                {formatDuration(currentSec)} / {formatDuration(durationSec)}
              </p>
            </div>

            {/* Open full player */}
            <Link href={`/media/${activeId}`}
              className="p-1.5 text-ivory/30 hover:text-gold transition-colors rounded-sharp focus-visible:outline-gold"
              aria-label="Open full player"
            >
              <ExternalLink size={13} strokeWidth={1.5} />
            </Link>

            {/* Close */}
            <button onClick={stop}
              className="p-1.5 text-ivory/30 hover:text-ivory/70 transition-colors rounded-sharp focus-visible:outline-gold"
              aria-label="Close player"
            >
              <X size={13} strokeWidth={1.5} />
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
