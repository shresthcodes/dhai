"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Play, Pause, Square, Volume2, ChevronDown, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { useSpeech } from "@/lib/useSpeech";
import type { Language } from "@/data/models";

const SPEEDS = [0.75, 1, 1.25, 1.5] as const;
type Speed = typeof SPEEDS[number];

const LANG_LABELS: Partial<Record<Language, string>> = {
  en: "English", hi: "हिन्दी", gu: "ગુજરાતી",
};

interface AudioPlayerProps {
  text:     string;
  lang?:    Language;
  onClose:  () => void;
  onSentenceChange?: (idx: number) => void;
}

export function AudioPlayer({ text, lang = "en", onClose, onSentenceChange }: AudioPlayerProps) {
  const [speed,     setSpeed]     = useState<Speed>(1);
  const [speedOpen, setSpeedOpen] = useState(false);
  const [activeLang, setActiveLang] = useState<Language>(lang);
  const { state, speak, stop, pause, resume } = useSpeech(text, activeLang);

  useEffect(() => {
    onSentenceChange?.(state.currentSentence);
  }, [state.currentSentence, onSentenceChange]);

  // Stop on unmount
  useEffect(() => () => stop(), [stop]);

  function handlePlay() {
    if (state.speaking) { stop(); } else { speak(speed); }
  }

  const langs: Language[] = ["en", "hi", "gu"];

  return (
    <motion.div
      initial={{ y: 80, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      exit={{ y: 80, opacity: 0 }}
      transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
      className="fixed bottom-0 left-0 right-0 z-[150] glass border-t border-[rgba(244,237,224,0.12)]"
      role="region"
      aria-label="Audio narration player"
    >
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-3 flex items-center gap-4 flex-wrap">
        {/* Icon */}
        <div className="flex items-center gap-2 shrink-0">
          <Volume2 size={15} strokeWidth={1.5} className="text-gold/60" />
          <span className="eyebrow text-[0.55rem] text-ivory/40">Demo narration (browser TTS)</span>
        </div>

        {/* Play / Pause / Stop */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={handlePlay}
            disabled={!state.supported}
            className={cn(
              "w-9 h-9 rounded-full flex items-center justify-center transition-all focus-visible:outline-gold",
              state.supported ? "bg-gold text-ink hover:bg-gold-soft" : "bg-panel/50 text-ivory/20 cursor-not-allowed"
            )}
            aria-label={state.speaking ? "Stop" : "Play"}
          >
            {state.speaking
              ? <Pause size={14} strokeWidth={2} />
              : <Play  size={14} strokeWidth={2} className="ml-0.5" />
            }
          </button>
          {state.speaking && (
            <button onClick={stop} className="p-1.5 text-ivory/40 hover:text-ivory/70 transition-colors focus-visible:outline-gold rounded-sharp" aria-label="Stop narration">
              <Square size={12} strokeWidth={2} />
            </button>
          )}
        </div>

        {/* Speaking indicator */}
        {state.speaking && (
          <div className="flex items-center gap-1 shrink-0">
            {[0,1,2].map((i) => (
              <motion.div key={i} className="w-0.5 h-3 bg-gold/50 rounded-full"
                animate={{ scaleY: [0.4, 1, 0.4] }}
                transition={{ duration: 0.8, repeat: Infinity, delay: i * 0.15 }}
              />
            ))}
          </div>
        )}

        {/* Speed */}
        <div className="relative shrink-0">
          <button
            onClick={() => setSpeedOpen((v) => !v)}
            className="flex items-center gap-1 font-sans text-xs text-ivory/45 hover:text-ivory/80 px-2 py-1 rounded-sharp border border-[rgba(244,237,224,0.1)] transition-colors focus-visible:outline-gold"
            aria-label="Playback speed"
            aria-expanded={speedOpen}
          >
            {speed}× <ChevronDown size={10} strokeWidth={1.5} className={cn(speedOpen && "rotate-180")} />
          </button>
          <AnimatePresence>
            {speedOpen && (
              <motion.div initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 4 }}
                className="absolute bottom-full mb-1 left-0 glass rounded-card py-1 min-w-[72px] shadow-card"
              >
                {SPEEDS.map((s) => (
                  <button key={s} onClick={() => { setSpeed(s); setSpeedOpen(false); }}
                    className={cn("w-full px-3 py-1.5 font-sans text-xs text-left transition-colors",
                      speed === s ? "text-gold bg-gold/8" : "text-ivory/55 hover:text-ivory"
                    )}
                  >{s}×</button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Language */}
        <div className="flex items-center gap-1 shrink-0">
          {langs.map((l) => (
            <button key={l} onClick={() => { stop(); setActiveLang(l); }}
              className={cn("px-2 py-1 rounded-sharp font-sans text-[0.68rem] border transition-all focus-visible:outline-gold",
                activeLang === l ? "bg-gold/12 text-gold border-gold/25" : "text-ivory/35 border-[rgba(244,237,224,0.1)] hover:text-ivory/60"
              )}
              aria-pressed={activeLang === l}
              lang={l}
            >{LANG_LABELS[l] ?? l}</button>
          ))}
        </div>

        {/* Error */}
        {state.error && (
          <div className="flex items-center gap-1.5 text-terracotta/70 ml-2">
            <AlertCircle size={12} strokeWidth={1.5} />
            <span className="font-sans text-xs">{state.error}</span>
          </div>
        )}

        {/* Close */}
        <button onClick={() => { stop(); onClose(); }}
          className="ml-auto text-ivory/30 hover:text-ivory/70 font-sans text-xs transition-colors focus-visible:outline-gold"
          aria-label="Close audio player"
        >Close</button>
      </div>
    </motion.div>
  );
}
