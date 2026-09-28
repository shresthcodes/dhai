"use client";

import React, { useRef, useEffect } from "react";
import { motion, useInView, AnimatePresence } from "framer-motion";
import { AlertTriangle, CheckCircle, MapPin, ChevronRight } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { CHAPTERS, type TimelineEvent, type TimelineChapter } from "@/data/timelineService";
import { useAccessibilityStore } from "@/store/accessibility";

const CHAPTER_ORDER: TimelineChapter[] = [
  "early-life", "education", "social-public-work", "constitutional-journey", "legacy",
];

interface ClassicTimelineProps {
  events:        TimelineEvent[];
  activeIdx:     number;
  onSelect:      (i: number) => void;
  chapterFilter: TimelineChapter | "";
}

/* ─── Single event row ───────────────────────────────────────────── */
function EventRow({
  event, index, isActive, onSelect,
}: {
  event:    TimelineEvent;
  index:    number;
  isActive: boolean;
  onSelect: (i: number) => void;
}) {
  const ref          = useRef<HTMLDivElement>(null);
  const inView       = useInView(ref, { once: true, margin: "-80px" });
  const { reduceMotion } = useAccessibilityStore();
  const meta         = CHAPTERS[event.chapter];

  // Auto-scroll active event into view
  useEffect(() => {
    if (isActive && ref.current) {
      ref.current.scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth", block: "nearest" });
    }
  }, [isActive, reduceMotion]);

  return (
    <motion.div
      ref={ref}
      initial={reduceMotion ? false : { opacity: 0, x: -16 }}
      animate={inView ? { opacity: 1, x: 0 } : {}}
      transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1], delay: Math.min(index * 0.03, 0.3) }}
    >
      <button
        onClick={() => onSelect(index)}
        className={cn(
          "w-full text-left group flex gap-0 items-stretch overflow-hidden",
          "rounded-[18px] border transition-all duration-300 focus-visible:outline-gold focus-visible:outline-offset-2",
          isActive
            ? "border-[rgba(244,237,224,0.18)] bg-[rgba(18,21,30,0.95)]"
            : "border-[rgba(244,237,224,0.07)] bg-[rgba(14,16,22,0.6)] hover:border-[rgba(244,237,224,0.14)] hover:bg-[rgba(18,21,30,0.8)]"
        )}
        style={isActive ? {
          boxShadow: `0 0 0 1px ${meta.accentHex}25, 0 8px 40px rgba(0,0,0,0.5), 0 0 30px ${meta.accentHex}10`,
        } : undefined}
        aria-current={isActive ? "step" : undefined}
        aria-label={`${event.dateLabel} — ${event.title}`}
      >
        {/* Top accent line (archive card style) */}
        <div className="absolute top-0 left-0 right-0 h-[3px] rounded-t-[18px]"
          style={{
            background: `linear-gradient(to right, ${meta.accentHex}, ${meta.accentHex}50, transparent)`,
            opacity: isActive ? 1 : 0.35,
          }}
        />

        {/* Left accent bar */}
        <div
          className="w-[3px] shrink-0 transition-opacity duration-300"
          style={{
            background: `linear-gradient(to bottom, ${meta.accentHex}, ${meta.accentHex}40)`,
            opacity: isActive ? 1 : 0.25,
          }}
        />

        {/* Year column with radial glow */}
        <div
          className="shrink-0 flex flex-col items-center justify-center py-5 w-[88px] gap-1 relative"
          style={{
            background: isActive
              ? `radial-gradient(ellipse 120% 100% at 50% 50%, ${meta.accentHex}14 0%, transparent 70%)`
              : "transparent",
          }}
        >
          <span
            className="font-serif text-[1.75rem] leading-none tabular-nums transition-all duration-300"
            style={{ color: isActive ? meta.accentHex : `${meta.accentHex}55` }}
          >
            {event.year}
          </span>
          <div
            className="w-1.5 h-1.5 rounded-full mt-1 transition-opacity"
            style={{ background: meta.accentHex, opacity: isActive ? 1 : 0.35 }}
          />
        </div>

        {/* Divider */}
        <div className="w-px self-stretch my-4"
          style={{ background: `linear-gradient(to bottom, transparent, ${meta.accentHex}30, transparent)` }}
        />

        {/* Content */}
        <div className="flex-1 py-5 pr-4 pl-4 min-w-0 space-y-2">
          <div className="flex items-start justify-between gap-3 flex-wrap">
            <div className="space-y-0.5">
              <p className="font-sans text-[0.65rem] uppercase tracking-[0.18em]"
                style={{ color: `${meta.accentHex}90` }}>
                {event.dateLabel} · {meta.label}
              </p>
              <p className={cn(
                "font-serif leading-snug transition-colors duration-200",
                isActive ? "text-ivory text-[1.15rem]" : "text-ivory/65 text-[1.05rem] group-hover:text-ivory/85"
              )}>
                {event.title}
              </p>
            </div>
            {/* Verification badge */}
            <div className={cn(
              "shrink-0 flex items-center gap-1 px-2 py-1 rounded-[8px] border text-[0.58rem] font-sans",
              event.verification.status === "verified"
                ? "text-gold/70 border-gold/20 bg-gold/6"
                : "text-ivory/20 border-[rgba(244,237,224,0.07)]"
            )}>
              {event.verification.status === "verified"
                ? <CheckCircle size={9} strokeWidth={1.5} />
                : <AlertTriangle size={9} strokeWidth={1.5} className="text-terracotta/40" />
              }
              {event.verification.status === "verified" ? "Verified" : "Seed"}
            </div>
          </div>

          {/* Expanded detail when active */}
          <AnimatePresence>
            {isActive && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3 }}
                className="overflow-hidden"
              >
                <p className="font-sans text-[0.84rem] text-ivory/55 leading-relaxed pr-2 pt-0.5">
                  {event.oneLine}
                </p>
                <div className="flex items-center gap-3 mt-2.5 flex-wrap">
                  {event.place && (
                    <span className="flex items-center gap-1 font-sans text-[0.65rem] text-ivory/30">
                      <MapPin size={10} strokeWidth={1.5} />
                      {event.place}
                    </span>
                  )}
                  {event.themes.slice(0, 3).map((th) => (
                    <span key={th}
                      className="font-sans text-[0.6rem] text-ivory/30 border border-[rgba(244,237,224,0.08)] px-2 py-0.5 rounded-[6px]">
                      {th}
                    </span>
                  ))}
                  <Link
                    href={`/timeline?event=${event.id}`}
                    onClick={(e) => e.stopPropagation()}
                    className="ml-auto flex items-center gap-1 font-sans text-[0.68rem] transition-colors focus-visible:outline-gold rounded-sharp"
                    style={{ color: `${meta.accentHex}80` }}
                  >
                    Details <ChevronRight size={10} strokeWidth={2} />
                  </Link>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </button>
    </motion.div>
  );
}

/* ─── Chapter section header ─────────────────────────────────────── */
function ChapterHeader({ chapter, eventCount, yearFrom, yearTo }: {
  chapter:    TimelineChapter;
  eventCount: number;
  yearFrom:   number;
  yearTo:     number;
}) {
  const meta = CHAPTERS[chapter];
  return (
    <div className="relative flex items-center gap-0 py-3 mt-4 first:mt-0">
      {/* Full-width background glow */}
      <div
        className="absolute inset-0 rounded-[12px] opacity-[0.06]"
        style={{ background: `radial-gradient(ellipse 60% 100% at 10% 50%, ${meta.accentHex} 0%, transparent 70%)` }}
      />
      {/* Left accent mark */}
      <div
        className="w-1 self-stretch rounded-full mr-4 shrink-0"
        style={{ background: `linear-gradient(to bottom, ${meta.accentHex}, ${meta.accentHex}30)`, minHeight: "2rem" }}
      />
      {/* Chapter info */}
      <div className="flex items-center gap-3 flex-1 min-w-0">
        <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: meta.accentHex }} />
        <span className="font-serif text-[1.05rem]" style={{ color: meta.accentHex }}>
          {meta.label}
        </span>
        <span className="font-sans text-[0.62rem] text-ivory/30">
          {yearFrom}{yearTo !== yearFrom ? `–${yearTo}` : ""} · {eventCount} event{eventCount !== 1 ? "s" : ""}
        </span>
      </div>
      {/* Right gradient rule */}
      <div
        className="flex-1 h-px ml-4"
        style={{ background: `linear-gradient(to right, ${meta.accentHex}60, ${meta.accentHex}15, transparent)` }}
      />
    </div>
  );
}

/* ─── Main export ────────────────────────────────────────────────── */
export function ClassicTimeline({ events, activeIdx, onSelect, chapterFilter }: ClassicTimelineProps) {
  const filtered = chapterFilter
    ? events.filter((e) => e.chapter === chapterFilter)
    : events;

  const filteredIdxMap = new Map(filtered.map((e) => [e.id, events.indexOf(e)]));

  // Group by chapter
  const grouped: Map<TimelineChapter, TimelineEvent[]> = new Map();
  for (const ch of CHAPTER_ORDER) {
    const evts = filtered.filter((e) => e.chapter === ch);
    if (evts.length > 0) grouped.set(ch, evts);
  }

  return (
    <div className="space-y-2 max-h-[72vh] overflow-y-auto pr-1"
      style={{ scrollbarWidth: "thin", scrollbarColor: "rgba(201,162,75,0.2) transparent" }}>
      {Array.from(grouped.entries()).map(([ch, chEvents]) => {
        const years = chEvents.map((e) => e.year);
        return (
          <div key={ch} className="space-y-2">
            <ChapterHeader
              chapter={ch}
              eventCount={chEvents.length}
              yearFrom={Math.min(...years)}
              yearTo={Math.max(...years)}
            />
            <div className="space-y-2 pl-1">
              {chEvents.map((evt) => {
                const globalIdx = filteredIdxMap.get(evt.id) ?? 0;
                return (
                  <EventRow
                    key={evt.id}
                    event={evt}
                    index={globalIdx}
                    isActive={globalIdx === activeIdx}
                    onSelect={onSelect}
                  />
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}
