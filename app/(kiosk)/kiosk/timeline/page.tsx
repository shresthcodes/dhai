"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, ArrowRight, Clock } from "lucide-react";
import { KioskButton } from "@/components/kiosk/KioskButton";
import { DemoBadge } from "@/components/ui/Badge";
import { GoldRule } from "@/components/ui/GoldRule";
import { useKioskStore } from "@/store/kiosk";
import { loadTimelineEvents, CHAPTERS, type TimelineChapter } from "@/data/timelineService";
import { t } from "@/lib/i18n";
import type { Language } from "@/data/models";

const CHAPTER_ORDER: TimelineChapter[] = [
  "early-life",
  "education",
  "social-public-work",
  "constitutional-journey",
  "legacy",
];

export default function KioskTimelinePage() {
  const router   = useRouter();
  const { language } = useKioskStore();
  const lang     = (language as Language) ?? "en";
  const tr       = (k: string) => t(k, lang);

  const allEvents = loadTimelineEvents();
  const [chapter, setChapter]   = useState<TimelineChapter>("constitutional-journey");
  const [eventIdx, setEventIdx] = useState(0);

  const events  = allEvents.filter((e) => e.chapter === chapter);
  const event   = events[eventIdx] ?? null;
  const meta    = CHAPTERS[chapter];

  function selectChapter(c: TimelineChapter) {
    setChapter(c);
    setEventIdx(0);
  }

  function getChapterLabel(c: TimelineChapter) {
    if (lang === "hi") return CHAPTERS[c].labelHi;
    if (lang === "gu") return CHAPTERS[c].labelGu;
    return CHAPTERS[c].label;
  }

  return (
    <div className="fixed inset-0 bg-ink flex flex-col">
      {/* Header */}
      <div className="flex items-center gap-4 px-6 py-4 bg-night border-b border-[rgba(244,237,224,0.1)] shrink-0">
        <KioskButton variant="secondary" size="lg" onClick={() => router.push("/kiosk")}>
          <ArrowLeft size={22} strokeWidth={1.5} />
        </KioskButton>
        <Clock size={26} strokeWidth={1.5} className="text-gold/60" />
        <h1 className="font-serif text-[1.75rem] text-ivory flex-1">{tr("kiosk.timeline")}</h1>
        <DemoBadge />
      </div>

      {/* Chapter tabs */}
      <div className="flex gap-3 px-6 py-4 overflow-x-auto scrollbar-none shrink-0 border-b border-[rgba(244,237,224,0.06)]">
        {CHAPTER_ORDER.map((c) => {
          const count = allEvents.filter((e) => e.chapter === c).length;
          return (
            <button key={c}
              onClick={() => selectChapter(c)}
              className={`shrink-0 font-sans text-lg px-6 py-3 rounded-[14px] border-2 transition-all min-h-[60px] focus-visible:outline-gold ${
                chapter === c
                  ? "border-gold/40 text-gold bg-gold/10"
                  : "border-[rgba(244,237,224,0.12)] text-ivory/50 hover:border-gold/25"
              }`}
            >
              {getChapterLabel(c)} <span className="text-ivory/30 text-sm ml-1">({count})</span>
            </button>
          );
        })}
      </div>

      {/* Event display */}
      <div className="flex-1 flex flex-col items-center justify-center px-8 py-6 overflow-hidden">
        <AnimatePresence mode="wait">
          {event && (
            <motion.div
              key={event.id}
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -18 }}
              transition={{ duration: 0.3 }}
              className="w-full max-w-3xl text-center space-y-6"
            >
              <p className="font-sans text-[1.1rem] tracking-[0.25em] uppercase"
                style={{ color: meta.accentHex }}>
                {getChapterLabel(chapter)}
              </p>
              <p className="font-serif text-[5rem] leading-none" style={{ color: meta.accentHex }}>
                {event.dateLabel}
              </p>
              <h2 className="font-serif text-[2.5rem] text-ivory leading-tight">{event.title}</h2>
              <GoldRule className="mx-auto w-24" />
              <p className="font-sans text-[1.4rem] text-ivory/60 leading-relaxed max-w-2xl mx-auto">
                {event.oneLine}
              </p>

              {event.place && (
                <p className="font-sans text-base text-ivory/35">📍 {event.place}</p>
              )}

              {/* Verification badge */}
              <div className="flex items-center justify-center gap-3 flex-wrap">
                <span className={`font-sans text-sm px-4 py-2 rounded-[10px] border ${
                  event.verification.status === "verified"
                    ? "border-emerald-500/30 text-emerald-400/70"
                    : "border-terracotta/30 text-terracotta/70"
                }`}>
                  {event.verification.status === "verified" ? "✓ Verified" : "Seed — verify with source"}
                </span>
                <DemoBadge />
              </div>

              {/* Themes */}
              {event.themes.length > 0 && (
                <div className="flex flex-wrap justify-center gap-2">
                  {event.themes.map((th) => (
                    <span key={th} className="font-sans text-sm text-ivory/40 border border-[rgba(244,237,224,0.1)] px-3 py-1.5 rounded-[10px]">
                      {th}
                    </span>
                  ))}
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Navigation */}
      <div className="flex items-center justify-between px-8 py-5 border-t border-[rgba(244,237,224,0.08)] shrink-0">
        <KioskButton variant="secondary" size="xl"
          onClick={() => setEventIdx((i) => Math.max(0, i - 1))}
          disabled={eventIdx === 0}>
          <ArrowLeft size={24} strokeWidth={1.5} />{tr("common.prev")}
        </KioskButton>

        <div className="flex gap-2">
          {events.map((_, i) => (
            <button key={i}
              onClick={() => setEventIdx(i)}
              className={`w-4 h-4 rounded-full transition-all focus-visible:outline-gold ${
                i === eventIdx ? "bg-gold scale-125" : "bg-[rgba(244,237,224,0.2)] hover:bg-[rgba(244,237,224,0.4)]"
              }`}
              aria-label={`Event ${i + 1} of ${events.length}`}
            />
          ))}
        </div>

        <KioskButton variant="secondary" size="xl"
          onClick={() => setEventIdx((i) => Math.min(events.length - 1, i + 1))}
          disabled={eventIdx >= events.length - 1}>
          {tr("common.next")}<ArrowRight size={24} strokeWidth={1.5} />
        </KioskButton>
      </div>

      <div className="text-center pb-3 shrink-0">
        <p className="font-sans text-xs text-ivory/20 italic">{tr("timeline.seedBanner")}</p>
      </div>
    </div>
  );
}
