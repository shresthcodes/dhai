"use client";

import React, { useEffect, useRef } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { X, ZoomIn, Sun, Wind, Volume2, Type, Underline, Focus, RotateCcw } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAccessibilityStore, type TextScale } from "@/store/accessibility";
import { useLanguageStore } from "@/store/language";
import { GoldRule } from "@/components/ui/GoldRule";
import { t } from "@/lib/i18n";
import type { Language } from "@/data/models";

interface AccessibilityPanelProps {
  open:    boolean;
  onClose: () => void;
  id:      string;
}

const TEXT_SCALES: { label: string; value: TextScale }[] = [
  { label: "100%", value: 1 },
  { label: "115%", value: 1.125 },
  { label: "130%", value: 1.25 },
  { label: "150%", value: 1.5 },
];

function Toggle({
  icon: Icon, label, value, onToggle,
}: {
  icon:     React.ElementType;
  label:    string;
  value:    boolean;
  onToggle: () => void;
}) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-2 text-ivory/70">
        <Icon size={14} strokeWidth={1.5} />
        <span className="font-sans text-xs">{label}</span>
      </div>
      <button
        role="switch"
        aria-checked={value}
        onClick={onToggle}
        className={cn(
          "relative rounded-full border transition-all duration-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-gold",
          value ? "bg-gold/30 border-gold/50" : "bg-panel border-[rgba(244,237,224,0.15)]"
        )}
        style={{ width: 36, height: 20 }}
        aria-label={label}
      >
        <span className={cn(
          "absolute top-0.5 w-4 h-4 rounded-full transition-all duration-200",
          value ? "bg-gold" : "bg-ivory/30"
        )}
          style={{ left: value ? "calc(100% - 1.1rem)" : "2px" }}
        />
      </button>
    </div>
  );
}

export function AccessibilityPanel({ open, onClose, id }: AccessibilityPanelProps) {
  const {
    textScale, highContrast, reduceMotion, narration,
    readableFont, underlineLinks, focusHighlight,
    setTextScale, setHighContrast, setReduceMotion,
    setNarration, setReadableFont, setUnderlineLinks, setFocusHighlight,
    reset,
  } = useAccessibilityStore();
  const { language } = useLanguageStore();
  const lang = language as Language;
  const firstFocusRef = useRef<HTMLButtonElement>(null);

  // Focus trap
  useEffect(() => {
    if (open) setTimeout(() => firstFocusRef.current?.focus(), 50);
  }, [open]);

  // Alt+A shortcut
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.altKey && e.key === "a") { e.preventDefault(); onClose(); }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[105] bg-black/20"
            onClick={onClose}
            aria-hidden="true"
          />
          <motion.div
            id={id}
            role="dialog"
            aria-modal="true"
            aria-label={t("a11y.panel", lang)}
            initial={{ opacity: 0, x: 16, y: -8 }}
            animate={{ opacity: 1, x: 0, y: 0 }}
            exit={{ opacity: 0, x: 16, y: -8 }}
            transition={{ duration: 0.22 }}
            className="fixed right-4 top-[4.75rem] z-[110] w-76 glass rounded-card p-5 space-y-4 overflow-y-auto max-h-[80vh]"
            style={{ width: 300 }}
          >
            {/* Header */}
            <div className="flex items-center justify-between">
              <h2 className="font-sans text-sm font-semibold text-ivory">{t("a11y.panel", lang)}</h2>
              <button ref={firstFocusRef} onClick={onClose}
                className="text-ivory/50 hover:text-ivory transition-colors p-1 rounded focus-visible:outline-gold"
                aria-label={t("common.close", lang)}
              >
                <X size={16} strokeWidth={1.5} />
              </button>
            </div>

            <GoldRule width="full" />

            {/* Text scale */}
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-ivory/60">
                <ZoomIn size={13} strokeWidth={1.5} />
                <span className="font-sans text-xs uppercase tracking-widest">{t("a11y.textSize", lang)}</span>
              </div>
              <div className="flex gap-1.5" role="group" aria-label={t("a11y.textSize", lang)}>
                {TEXT_SCALES.map(({ label, value }) => (
                  <button key={value} onClick={() => setTextScale(value)}
                    className={cn(
                      "flex-1 py-1.5 rounded-sharp text-xs font-medium font-sans border transition-all focus-visible:outline-gold",
                      textScale === value
                        ? "bg-gold/15 text-gold border-gold/30"
                        : "text-ivory/50 border-[rgba(244,237,224,0.12)] hover:text-ivory/80"
                    )}
                    aria-pressed={textScale === value}
                  >{label}</button>
                ))}
              </div>
            </div>

            <GoldRule width="full" />

            {/* Toggles */}
            <div className="space-y-3">
              <Toggle icon={Sun}       label={t("a11y.highContrast", lang)}  value={highContrast}   onToggle={() => setHighContrast(!highContrast)} />
              <Toggle icon={Wind}      label={t("a11y.reduceMotion", lang)}  value={reduceMotion}   onToggle={() => setReduceMotion(!reduceMotion)} />
              <Toggle icon={Volume2}   label={t("a11y.narration", lang)}     value={narration}      onToggle={() => setNarration(!narration)} />
              <Toggle icon={Type}      label={t("a11y.readableFont", lang)}  value={readableFont}   onToggle={() => setReadableFont(!readableFont)} />
              <Toggle icon={Underline} label={t("a11y.underlineLinks", lang)}value={underlineLinks} onToggle={() => setUnderlineLinks(!underlineLinks)} />
              <Toggle icon={Focus}     label={t("a11y.focusHighlight", lang)}value={focusHighlight} onToggle={() => setFocusHighlight(!focusHighlight)} />
            </div>

            <GoldRule width="full" />

            {/* Reset + shortcuts hint */}
            <div className="flex items-center justify-between">
              <button onClick={reset}
                className="flex items-center gap-1.5 font-sans text-xs text-ivory/35 hover:text-ivory/70 transition-colors focus-visible:outline-gold rounded-sharp"
              >
                <RotateCcw size={11} strokeWidth={1.5} />{t("a11y.resetDefaults", lang)}
              </button>
              <span className="font-sans text-[0.6rem] text-ivory/20">Alt+A to toggle</span>
            </div>

            <p className="font-sans text-[0.62rem] text-ivory/20 italic">{t("a11y.shortcutsHint", lang)}</p>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
