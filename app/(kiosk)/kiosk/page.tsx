"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import {
  Search, BookOpen, Video, Clock, HelpCircle, Bookmark,
  BookMarked, Accessibility, Globe, LogOut,
} from "lucide-react";
import { useKioskStore } from "@/store/kiosk";
import { KioskTile } from "@/components/kiosk/KioskTile";
import { KioskButton } from "@/components/kiosk/KioskButton";
import { cn } from "@/lib/utils";
import { t } from "@/lib/i18n";
import { loadArchive } from "@/data/archiveService";
import { loadMediaItems } from "@/data/mediaService";

/* ─── Idle timer hook ─────────────────────────────────────────────── */
function useIdleTimer(onWarn: () => void, onReset: () => void, idleSec = 60, warnSec = 30) {
  const timer  = useRef<ReturnType<typeof setTimeout> | null>(null);
  const warnTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const resetTimer = useCallback(() => {
    if (timer.current)     clearTimeout(timer.current);
    if (warnTimer.current) clearTimeout(warnTimer.current);
    timer.current = setTimeout(() => {
      onWarn();
      warnTimer.current = setTimeout(onReset, warnSec * 1000);
    }, idleSec * 1000);
  }, [onWarn, onReset, idleSec, warnSec]);

  useEffect(() => {
    resetTimer();
    const events = ["pointerdown", "keydown", "touchstart"];
    events.forEach((e) => window.addEventListener(e, resetTimer, { passive: true }));
    return () => {
      if (timer.current)     clearTimeout(timer.current);
      if (warnTimer.current) clearTimeout(warnTimer.current);
      events.forEach((e) => window.removeEventListener(e, resetTimer));
    };
  }, [resetTimer]);

  return resetTimer;
}

/* ─── Attract screen ──────────────────────────────────────────────── */
function AttractScreen({ onTouch }: { onTouch: () => void }) {
  const [langIdx, setLangIdx] = useState(0);
  const langs = [
    { code: "en", label: "Touch to begin" },
    { code: "hi", label: "शुरू करने के लिए स्पर्श करें" },
    { code: "gu", label: "શરૂ કરવા સ્પર્શ કરો" },
  ];

  useEffect(() => {
    const id = setInterval(() => setLangIdx((i) => (i + 1) % langs.length), 3000);
    return () => clearInterval(id);
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 flex flex-col items-center justify-center cursor-none select-none"
      style={{ background: "radial-gradient(ellipse 70% 60% at 50% 50%, rgba(201,162,75,0.07) 0%, #0B0D12 70%)" }}
      onPointerDown={onTouch}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === "Enter" && onTouch()}
      aria-label="Touch to begin"
    >
      {/* Title */}
      <div className="text-center space-y-4 mb-16">
        <p className="eyebrow text-gold/50 text-[1rem] tracking-[0.3em]">DIGITAL HERITAGE ARCHIVE & INTELLIGENCE</p>
        <h1 className="font-serif text-[5rem] text-ivory leading-none">DHAI</h1>
        <p className="font-sans text-ivory/30 text-lg">Museum Kiosk · Prototype</p>
      </div>

      {/* Pulsing CTA */}
      <AnimatePresence mode="wait">
        <motion.div
          key={langIdx}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.4 }}
          className="text-center"
        >
          <motion.p
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
            className="font-serif text-[2rem] text-gold"
            lang={langs[langIdx].code}
          >
            {langs[langIdx].label}
          </motion.p>
        </motion.div>
      </AnimatePresence>

      {/* Bottom info */}
      <div className="absolute bottom-8 left-0 right-0 text-center">
        <p className="font-sans text-ivory/20 text-sm">No personal data is stored on this kiosk (prototype)</p>
        <p className="font-sans text-ivory/15 text-xs mt-1">Smart India Hackathon 2026 · Demo data only</p>
      </div>
    </motion.div>
  );
}

/* ─── Language chooser ────────────────────────────────────────────── */
function LanguageChooser({ onSelect }: { onSelect: (l: "en" | "hi" | "gu") => void }) {
  const langs = [
    { code: "en" as const, native: "English",  sub: "English" },
    { code: "hi" as const, native: "हिन्दी",  sub: "Hindi" },
    { code: "gu" as const, native: "ગુજરાતી", sub: "Gujarati" },
  ];
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      className="fixed inset-0 flex flex-col items-center justify-center gap-8 bg-ink px-8"
    >
      <h2 className="font-serif text-[2.5rem] text-ivory">Choose your language</h2>
      <p className="font-sans text-ivory/40 text-lg">अपनी भाषा चुनें · તમારી ભાષા પસંદ કરો</p>
      <div className="grid grid-cols-3 gap-6 w-full max-w-3xl">
        {langs.map(({ code, native, sub }) => (
          <motion.button
            key={code}
            whileTap={{ scale: 0.95 }}
            onClick={() => onSelect(code)}
            className="flex flex-col items-center justify-center gap-3 py-12 px-6 rounded-[24px] border-2 border-[rgba(244,237,224,0.15)] bg-panel hover:border-gold/40 transition-all focus-visible:outline focus-visible:outline-4 focus-visible:outline-gold min-h-[200px]"
            lang={code}
          >
            <span className="font-serif text-[2.5rem] text-ivory">{native}</span>
            <span className="font-sans text-ivory/40 text-sm">{sub}</span>
          </motion.button>
        ))}
      </div>
    </motion.div>
  );
}

/* ─── Idle warning dialog ─────────────────────────────────────────── */
function IdleWarning({ countdown, onStillHere }: { countdown: number; onStillHere: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="fixed inset-0 z-[500] flex items-center justify-center bg-black/70"
    >
      <motion.div
        initial={{ scale: 0.9 }}
        animate={{ scale: 1 }}
        className="glass rounded-[32px] p-12 text-center space-y-6 max-w-lg w-full mx-6"
      >
        <h2 className="font-serif text-[2rem] text-ivory">Are you still there?</h2>
        <p className="font-sans text-ivory/50 text-lg">Returning to start in {countdown} seconds</p>
        <KioskButton onClick={onStillHere} size="xl" fullWidth>
          I'm still here
        </KioskButton>
      </motion.div>
    </motion.div>
  );
}

/* ─── Kiosk header ────────────────────────────────────────────────── */
function KioskHeader({ language, onHome, onEnd }: {
  language: "en" | "hi" | "gu";
  onHome:   () => void;
  onEnd:    () => void;
}) {
  const tr = (k: string) => t(k, language);
  return (
    <div className="flex items-center justify-between px-6 py-4 bg-night border-b border-[rgba(244,237,224,0.1)] shrink-0">
      <div className="flex items-center gap-3">
        <span className="font-serif text-[1.5rem] font-semibold text-gold">DHAI</span>
        <span className="font-sans text-xs text-ivory/30 hidden sm:block">Museum Kiosk · Prototype</span>
      </div>
      <div className="flex gap-3">
        <KioskButton variant="secondary" size="lg" onClick={onHome}>
          {tr("kiosk.home")}
        </KioskButton>
        <KioskButton variant="ghost" size="lg" onClick={onEnd}>
          <LogOut size={20} strokeWidth={1.5} />
        </KioskButton>
      </div>
    </div>
  );
}

/* ─── Kiosk home ──────────────────────────────────────────────────── */
function KioskHome({ language }: { language: "en" | "hi" | "gu" }) {
  const router   = useRouter();
  const tr       = (k: string) => t(k, language);
  const archive  = loadArchive();
  const media    = loadMediaItems();

  const TILES = [
    { icon: <Search size={36} strokeWidth={1.5} />,   label: tr("kiosk.search"),   sub: `${archive.length} records`,            path: "/kiosk/search",   accent: "#C9A24B" },
    { icon: <BookOpen size={36} strokeWidth={1.5} />,  label: tr("kiosk.explore"),  sub: "Writings, speeches & more",            path: "/kiosk/archive",  accent: "#4C7FB8" },
    { icon: <Video size={36} strokeWidth={1.5} />,     label: tr("kiosk.watch"),    sub: `${media.length} media records`,        path: "/kiosk/watch",    accent: "#B5573A" },
    { icon: <Clock size={36} strokeWidth={1.5} />,     label: tr("kiosk.timeline"), sub: "13 anchor events",                     path: "/kiosk/timeline", accent: "#E3C77A" },
    { icon: <HelpCircle size={36} strokeWidth={1.5} />,label: tr("kiosk.ask"),      sub: "Evidence-grounded research",           path: "/kiosk/ask",      accent: "#C9A24B" },
    { icon: <BookMarked size={36} strokeWidth={1.5} />,label: tr("kiosk.story"),    sub: "Five chapters",                        path: "/kiosk/story",    accent: "#4C7FB8" },
  ];
  const SECONDARY = [
    { icon: <Bookmark size={28} strokeWidth={1.5} />,    label: tr("kiosk.session"),       path: "/kiosk/session",   accent: "#E8DCC3" },
    { icon: <Accessibility size={28} strokeWidth={1.5} />, label: tr("kiosk.accessibility"), path: "#a11y",             accent: "#C9A24B" },
    { icon: <Globe size={28} strokeWidth={1.5} />,        label: "Language",                path: "#lang",             accent: "#4C7FB8" },
  ];

  return (
    <div className="flex-1 overflow-y-auto p-6 space-y-6">
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        {TILES.map((tile) => (
          <KioskTile
            key={tile.path}
            icon={tile.icon}
            label={tile.label}
            sublabel={tile.sub}
            accent={tile.accent}
            onClick={() => router.push(tile.path)}
          />
        ))}
      </div>
      <div className="grid grid-cols-3 gap-3">
        {SECONDARY.map((tile) => (
          <KioskTile
            key={tile.label}
            icon={tile.icon}
            label={tile.label}
            accent={tile.accent}
            onClick={() => tile.path.startsWith("#") ? {} : router.push(tile.path)}
            className="min-h-[100px]"
          />
        ))}
      </div>
      {/* Demo notice */}
      <div className="text-center py-4">
        <p className="font-sans text-ivory/20 text-sm">{tr("kiosk.demoNotice")}</p>
        <p className="font-sans text-ivory/15 text-xs mt-1">{tr("kiosk.noPersonalData")}</p>
      </div>
    </div>
  );
}

/* ─── Main kiosk page ─────────────────────────────────────────────── */
export default function KioskPage() {
  const { phase, language, setPhase, setLanguage, reset } = useKioskStore();
  const [showWarning, setShowWarning] = useState(false);
  const [countdown,   setCountdown]   = useState(30);
  const countdownRef = useRef<ReturnType<typeof setInterval> | null>(null);

  function handleReset() {
    setShowWarning(false);
    if (countdownRef.current) clearInterval(countdownRef.current);
    reset();
  }

  function handleWarn() {
    setShowWarning(true);
    setCountdown(30);
    countdownRef.current = setInterval(() => {
      setCountdown((c) => {
        if (c <= 1) {
          clearInterval(countdownRef.current!);
          handleReset();
          return 0;
        }
        return c - 1;
      });
    }, 1000);
  }

  function handleStillHere() {
    setShowWarning(false);
    if (countdownRef.current) clearInterval(countdownRef.current);
  }

  useIdleTimer(
    phase === "home" || phase === "active" ? handleWarn : () => {},
    handleReset,
    60, 30
  );

  return (
    <div className="fixed inset-0 bg-ink flex flex-col overflow-hidden select-none"
      style={{ touchAction: "none" }}
    >
      <AnimatePresence mode="wait">
        {phase === "attract" && (
          <AttractScreen key="attract" onTouch={() => setPhase("language")} />
        )}
        {phase === "language" && (
          <LanguageChooser key="language" onSelect={(l) => setLanguage(l)} />
        )}
        {(phase === "home" || phase === "active") && (
          <motion.div key="main" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col h-full">
            <KioskHeader
              language={language as "en" | "hi" | "gu"}
              onHome={() => setPhase("home")}
              onEnd={handleReset}
            />
            <KioskHome language={language as "en" | "hi" | "gu"} />
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showWarning && (
          <IdleWarning countdown={countdown} onStillHere={handleStillHere} />
        )}
      </AnimatePresence>
    </div>
  );
}
