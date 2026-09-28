"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, ArrowRight, BookMarked } from "lucide-react";
import { KioskButton } from "@/components/kiosk/KioskButton";
import { DemoBadge } from "@/components/ui/Badge";
import { GoldRule } from "@/components/ui/GoldRule";
import { useKioskStore } from "@/store/kiosk";
import { loadStoryChapters, MOOD_GRADIENT, ACCENT_HEX } from "@/data/storyService";
import { getChapterEvents } from "@/data/storyService";
import { t } from "@/lib/i18n";
import type { Language } from "@/data/models";

export default function KioskStoryPage() {
  const router = useRouter();
  const { language } = useKioskStore();
  const lang = (language as Language) ?? "en";
  const tr   = (k: string) => t(k, lang);

  const chapters = loadStoryChapters();
  const [idx, setIdx] = useState(0);

  const chapter = chapters[idx];
  const events  = chapter ? getChapterEvents(chapter) : [];
  const accent  = chapter ? ACCENT_HEX[chapter.accent] : "#C9A24B";
  const gradient = chapter ? MOOD_GRADIENT[chapter.visual.mood] : "";

  return (
    <div className="fixed inset-0 bg-ink flex flex-col" style={{ background: gradient || "#0B0D12" }}>
      {/* Header */}
      <div className="flex items-center gap-4 px-6 py-4 bg-black/30 border-b border-[rgba(244,237,224,0.08)] shrink-0">
        <KioskButton variant="secondary" size="lg" onClick={() => router.push("/kiosk")}>
          <ArrowLeft size={22} strokeWidth={1.5} />
        </KioskButton>
        <BookMarked size={26} strokeWidth={1.5} style={{ color: accent }} />
        <h1 className="font-serif text-[1.75rem] text-ivory flex-1">{tr("kiosk.story")}</h1>

        {/* Chapter dots */}
        <div className="flex gap-2 items-center">
          {chapters.map((_, i) => (
            <button key={i}
              onClick={() => setIdx(i)}
              className={`w-3 h-3 rounded-full transition-all focus-visible:outline-gold ${
                i === idx ? "scale-125" : "bg-[rgba(244,237,224,0.2)] hover:bg-[rgba(244,237,224,0.4)]"
              }`}
              style={i === idx ? { backgroundColor: accent } : undefined}
              aria-label={`Chapter ${i + 1}`}
            />
          ))}
        </div>
        <DemoBadge />
      </div>

      {/* Chapter content */}
      <div className="flex-1 overflow-y-auto px-8 py-8">
        <AnimatePresence mode="wait">
          {chapter && (
            <motion.div
              key={chapter.id}
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -30 }}
              transition={{ duration: 0.35 }}
              className="max-w-3xl mx-auto space-y-8"
            >
              {/* Chapter number + eyebrow */}
              <div className="space-y-2">
                <p className="font-sans text-[1rem] tracking-[0.3em] uppercase"
                  style={{ color: `${accent}80` }}>
                  {tr("story.eyebrow")} · Chapter {chapter.number}
                </p>
                <h2 className="font-serif text-[3.5rem] text-ivory leading-tight">{chapter.title}</h2>
                <p className="font-sans text-[1.25rem] text-ivory/50">{chapter.subtitle}</p>
              </div>

              <GoldRule className="opacity-60" />

              {/* Narrative paragraphs */}
              {chapter.narrative.paragraphs.length > 0 && (
                <div className="space-y-4">
                  {chapter.narrative.paragraphs.map((para, i) => (
                    <p key={i} className="font-sans text-[1.3rem] text-ivory/70 leading-relaxed">
                      {para}
                    </p>
                  ))}
                  {chapter.narrative.status === "placeholder" && (
                    <p className="font-sans text-sm text-ivory/30 italic">{tr("story.placeholderNarrative")}</p>
                  )}
                </div>
              )}

              {/* Key timeline events */}
              {events.length > 0 && (
                <div className="space-y-3">
                  <p className="eyebrow text-[0.75rem] tracking-[0.2em] text-ivory/40">{tr("story.keyEvents")}</p>
                  {events.map((ev) => (
                    <div key={ev.id}
                      className="flex items-start gap-4 bg-black/25 rounded-[16px] px-5 py-4 border border-[rgba(244,237,224,0.07)]">
                      <span className="font-serif text-[1.5rem] shrink-0" style={{ color: accent }}>
                        {ev.dateLabel}
                      </span>
                      <div>
                        <p className="font-serif text-[1.15rem] text-ivory">{ev.title}</p>
                        <p className="font-sans text-sm text-ivory/45 mt-1">{ev.oneLine}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Archival evidence chips */}
              {(chapter.evidence.documents.length + chapter.evidence.speeches.length) > 0 && (
                <div className="space-y-3">
                  <p className="eyebrow text-[0.75rem] tracking-[0.2em] text-ivory/40">{tr("story.evidence")}</p>
                  <div className="flex flex-wrap gap-3">
                    {[...chapter.evidence.documents, ...chapter.evidence.speeches].map((id) => (
                      <span key={id}
                        className="font-sans text-base text-ivory/45 border border-[rgba(244,237,224,0.1)] px-4 py-2 rounded-[12px]">
                        {id}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              <div className="pt-2">
                <DemoBadge />
                <p className="font-sans text-xs text-ivory/25 italic mt-2">{tr("story.demoPrototype")}</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Navigation */}
      <div className="flex items-center justify-between px-8 py-5 border-t border-[rgba(244,237,224,0.08)] shrink-0 bg-black/30">
        <KioskButton variant="secondary" size="xl"
          onClick={() => setIdx((i) => Math.max(0, i - 1))}
          disabled={idx === 0}>
          <ArrowLeft size={24} strokeWidth={1.5} />{tr("common.prev")}
        </KioskButton>

        <span className="font-sans text-base text-ivory/40">
          {idx + 1} / {chapters.length}
        </span>

        <KioskButton variant="secondary" size="xl"
          onClick={() => setIdx((i) => Math.min(chapters.length - 1, i + 1))}
          disabled={idx >= chapters.length - 1}>
          {tr("common.next")}<ArrowRight size={24} strokeWidth={1.5} />
        </KioskButton>
      </div>
    </div>
  );
}
