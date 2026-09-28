"use client";

import React, {
  useState, useEffect, useCallback, useRef, Suspense,
} from "react";
import { useSearchParams, useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import { AnimatePresence, motion } from "framer-motion";
import {
  Play, Square, Layers, AlertTriangle, X,
} from "lucide-react";
import { Container }   from "@/components/ui/Container";
import { DemoBadge }   from "@/components/ui/Badge";
import { GoldRule }    from "@/components/ui/GoldRule";
import { ScrollReveal } from "@/components/ui/ScrollReveal";
import { Button }      from "@/components/ui/Button";
import { YearScrubber }    from "@/components/timeline/YearScrubber";
import { DetailPanel }     from "@/components/timeline/DetailPanel";
import { ClassicTimeline } from "@/components/timeline/ClassicTimeline";
import { usePerformanceTier } from "@/lib/performance";
import { useAccessibilityStore } from "@/store/accessibility";
import { useLanguageStore }      from "@/store/language";
import { usePlaybackStore }      from "@/store/playback";
import {
  loadTimelineEvents, CHAPTERS,
  type TimelineChapter,
} from "@/data/timelineService";
import { cn } from "@/lib/utils";

const TimelineCorridor = dynamic(
  () => import("@/components/three/TimelineCorridor").then((m) => ({ default: m.TimelineCorridor })),
  { ssr: false }
);

type ViewMode = "immersive" | "classic";

const CHAPTER_FILTERS: { label: string; value: TimelineChapter | "" }[] = [
  { label: "All",                    value: "" },
  { label: "Early Life",             value: "early-life" },
  { label: "Education",              value: "education" },
  { label: "Social & Public Work",   value: "social-public-work" },
  { label: "Constitutional Journey", value: "constitutional-journey" },
  { label: "Legacy",                 value: "legacy" },
];

function TimelineContent() {
  const params  = useSearchParams();
  const router  = useRouter();
  const tier    = usePerformanceTier();
  const { reduceMotion } = useAccessibilityStore();
  const { language }     = useLanguageStore();
  const { stop: stopMedia } = usePlaybackStore();

  const events = loadTimelineEvents();

  const [mode,          setMode]          = useState<ViewMode>("classic");
  const [activeIdx,     setActiveIdx]     = useState(0);
  const [selectedEvt,   setSelectedEvt]   = useState<string | null>(null);
  const [chapterFilter, setChapterFilter] = useState<TimelineChapter | "">("");
  const [showChapters,  setShowChapters]  = useState(false);
  const [playing,       setPlaying]       = useState(false);
  const [bannerDismissed, setBannerDismissed] = useState(false);
  const playIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Deep link: ?event=ID
  useEffect(() => {
    const eventId = params.get("event");
    if (eventId) {
      const idx = events.findIndex((e) => e.id === eventId);
      if (idx >= 0) {
        setActiveIdx(idx);
        setSelectedEvt(eventId);
      }
    }
  }, [params, events]);

  // Keyboard navigation
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if ((e.target as HTMLElement).tagName === "INPUT") return;
      if (e.key === "ArrowRight" || e.key === "PageDown") selectIdx(Math.min(events.length - 1, activeIdx + 1));
      if (e.key === "ArrowLeft"  || e.key === "PageUp")   selectIdx(Math.max(0, activeIdx - 1));
      if (e.key === "Escape") { setSelectedEvt(null); setPlaying(false); }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeIdx, events.length]);

  // Play journey auto-advance
  useEffect(() => {
    if (!playing || reduceMotion) return;
    playIntervalRef.current = setInterval(() => {
      setActiveIdx((i) => {
        const next = i + 1;
        if (next >= events.length) { setPlaying(false); return i; }
        return next;
      });
    }, 6000);
    return () => { if (playIntervalRef.current) clearInterval(playIntervalRef.current); };
  }, [playing, events.length, reduceMotion]);

  function selectIdx(idx: number) {
    setActiveIdx(idx);
    router.replace(`/timeline?event=${events[idx].id}`, { scroll: false });
  }

  function handleSelect(idx: number) {
    selectIdx(idx);
    setSelectedEvt(events[idx].id);
  }

  function handleNarrate() {
    const evt = events[activeIdx];
    if (!evt || !("speechSynthesis" in window)) return;
    stopMedia();
    window.speechSynthesis.cancel();
    const utt = new SpeechSynthesisUtterance(`${evt.dateLabel}. ${evt.title}. ${evt.oneLine}`);
    utt.lang = "en-IN";
    window.speechSynthesis.speak(utt);
  }

  const selectedEvent = selectedEvt ? events.find((e) => e.id === selectedEvt) ?? null : null;
  const selectedEventIdx = selectedEvent ? events.indexOf(selectedEvent) : -1;

  return (
    <div className="min-h-screen pt-[4.5rem]">
      {/* Seed data banner */}
      <AnimatePresence>
        {!bannerDismissed && (
          <motion.div
            initial={{ height: "auto" }}
            exit={{ height: 0, opacity: 0 }}
            className="bg-terracotta/8 border-b border-terracotta/20 overflow-hidden"
          >
            <Container className="py-2.5">
              <div className="flex items-center gap-3">
                <AlertTriangle size={13} strokeWidth={1.5} className="text-terracotta/70 shrink-0" />
                <p className="font-sans text-[0.72rem] text-ivory/55 flex-1">
                  <strong className="text-terracotta/80">Seed timeline.</strong>{" "}
                  Dates are widely cited but not yet verified against primary official sources.
                  Verify each event before public use. Events are labelled "Seed — verify".
                </p>
                <button onClick={() => setBannerDismissed(true)}
                  className="text-ivory/30 hover:text-ivory/60 transition-colors shrink-0 focus-visible:outline-gold rounded-sharp p-0.5"
                  aria-label="Dismiss banner"
                >
                  <X size={13} strokeWidth={1.5} />
                </button>
              </div>
            </Container>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Page header */}
      <div className="bg-night border-b border-[rgba(244,237,224,0.07)]">
        <Container className="py-10">
          <ScrollReveal>
            <div className="flex flex-wrap items-end justify-between gap-6">
              <div className="space-y-2">
                <p className="eyebrow text-gold/70 tracking-[0.25em]">Interactive Timeline</p>
                <h1 className="font-serif text-h1 text-ivory">The Journey</h1>
                <GoldRule />
                <p className="font-sans text-caption text-ivory/45 mt-1">
                  13 anchor events — seed data, pending verification against primary sources.
                </p>
              </div>
              {/* Stats */}
              <div className="flex items-end gap-8">
                {[
                  { value: "1891", label: "Born" },
                  { value: "1956", label: "Legacy" },
                  { value: "13", label: "Events" },
                ].map(({ value, label }) => (
                  <div key={label} className="text-center">
                    <p className="font-serif text-[2.2rem] text-gold/80 leading-none tabular-nums">{value}</p>
                    <p className="font-sans text-[0.62rem] text-ivory/30 mt-1 tracking-widest uppercase">{label}</p>
                  </div>
                ))}
                <div className="flex flex-col items-end gap-1.5">
                  <DemoBadge />
                  <span className="eyebrow text-[0.55rem] text-terracotta/60 border border-terracotta/20 px-2 py-0.5 rounded-sharp">
                    Seed data
                  </span>
                </div>
              </div>
            </div>
          </ScrollReveal>
        </Container>
      </div>

      {/* Controls bar */}
      <div className="sticky top-[4.5rem] z-40 bg-night/95 backdrop-blur-sm border-b border-[rgba(244,237,224,0.07)]">
        <Container className="py-2">
          <div className="flex items-center gap-3 flex-wrap">
            {/* Mode toggle */}
            <div className="flex items-center border border-[rgba(244,237,224,0.12)] rounded-sharp overflow-hidden" role="group" aria-label="View mode">
              {(["immersive", "classic"] as ViewMode[]).map((m) => (
                <button key={m}
                  onClick={() => setMode(m)}
                  className={cn("px-3 py-2 font-sans text-xs font-medium capitalize transition-all focus-visible:outline-gold border-r border-[rgba(244,237,224,0.08)] last:border-0",
                    mode === m ? "bg-gold/12 text-gold" : "text-ivory/40 hover:text-ivory/70"
                  )}
                  aria-pressed={mode === m}
                >
                  {m}
                </button>
              ))}
            </div>

            {/* Chapter filters */}
            <div className="flex gap-1.5 overflow-x-auto" role="group" aria-label="Chapter filters">
              {CHAPTER_FILTERS.map(({ label, value }) => (
                <button key={value}
                  onClick={() => setChapterFilter(value)}
                  className={cn("shrink-0 px-2.5 py-1.5 rounded-sharp font-sans text-[0.72rem] border transition-all focus-visible:outline-gold",
                    chapterFilter === value
                      ? "bg-gold/12 text-gold border-gold/30"
                      : "text-ivory/40 border-[rgba(244,237,224,0.1)] hover:text-ivory/70"
                  )}
                  aria-pressed={chapterFilter === value}
                >
                  {label}
                </button>
              ))}
            </div>

            {/* Play journey */}
            {!reduceMotion && mode === "immersive" && (
              <button
                onClick={() => setPlaying((v) => !v)}
                className={cn("flex items-center gap-1.5 px-3 py-1.5 rounded-sharp border font-sans text-xs transition-all focus-visible:outline-gold ml-auto",
                  playing ? "bg-gold/12 text-gold border-gold/30" : "text-ivory/40 border-[rgba(244,237,224,0.1)] hover:text-gold"
                )}
                aria-pressed={playing}
                aria-label={playing ? "Stop auto-play" : "Play the journey"}
              >
                {playing ? <Square size={11} strokeWidth={2} /> : <Play size={11} strokeWidth={2} />}
                {playing ? "Stop" : "Play Journey"}
              </button>
            )}

            {/* Show chapters toggle */}
            <button
              onClick={() => setShowChapters((v) => !v)}
              className={cn("flex items-center gap-1.5 px-2.5 py-1.5 rounded-sharp border font-sans text-xs transition-all focus-visible:outline-gold",
                showChapters ? "bg-gold/12 text-gold border-gold/30" : "text-ivory/35 border-[rgba(244,237,224,0.1)]"
              )}
              aria-pressed={showChapters}
            >
              <Layers size={11} strokeWidth={1.5} />Chapters
            </button>
          </div>
        </Container>
      </div>

      <Container className="py-6 space-y-4">
        {/* Chapter overview (when showChapters) */}
        <AnimatePresence>
          {showChapters && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden"
            >
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 pb-2">
                {(["early-life", "education", "social-public-work", "constitutional-journey", "legacy"] as TimelineChapter[]).map((ch) => {
                  const meta  = CHAPTERS[ch];
                  const count = events.filter((e) => e.chapter === ch).length;
                  const range = events.filter((e) => e.chapter === ch);
                  return (
                    <div key={ch} className="surface rounded-card p-3 border-l-2 space-y-1"
                      style={{ borderColor: meta.accentHex }}
                    >
                      <p className="font-sans text-[0.68rem] font-semibold" style={{ color: meta.accentHex }}>{meta.label}</p>
                      <p className="font-sans text-[0.6rem] text-ivory/30">
                        {range[0]?.year}{range.length > 1 ? `–${range[range.length - 1].year}` : ""} · {count} events
                      </p>
                    </div>
                  );
                })}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Main layout: scene + detail panel */}
        <div className="flex gap-5 items-start">
          <div className="flex-1 min-w-0 space-y-4">
            {/* 3D Corridor or Classic */}
            {mode === "immersive" && tier !== "none" && !reduceMotion ? (
              <TimelineCorridor
                events={chapterFilter ? events.filter((e) => e.chapter === chapterFilter) : events}
                activeIdx={activeIdx}
                onSelect={handleSelect}
                tier={tier}
                mode="immersive"
              />
            ) : (
              <ClassicTimeline
                events={events}
                activeIdx={activeIdx}
                onSelect={handleSelect}
                chapterFilter={chapterFilter}
              />
            )}

            {/* Year scrubber (immersive only) */}
            {mode === "immersive" && !reduceMotion && (
              <YearScrubber
                events={events}
                activeIdx={activeIdx}
                onJump={selectIdx}
                showChapters={showChapters}
              />
            )}

            {/* Prev / Next */}
            <div className="flex items-center justify-between pt-2">
              <Button variant="ghost" size="sm"
                onClick={() => selectIdx(Math.max(0, activeIdx - 1))}
              >
                ← Prev
              </Button>
              <span className="font-sans text-xs text-ivory/30">
                {activeIdx + 1} / {events.length}
              </span>
              <Button variant="ghost" size="sm"
                onClick={() => selectIdx(Math.min(events.length - 1, activeIdx + 1))}
              >
                Next →
              </Button>
            </div>

            {/* Aria live region */}
            <div aria-live="polite" className="sr-only">
              {events[activeIdx] && `Now showing: ${events[activeIdx].dateLabel} — ${events[activeIdx].title}`}
            </div>
          </div>

          {/* Detail Panel */}
          <AnimatePresence>
            {selectedEvent && (
              <DetailPanel
                event={selectedEvent}
                onClose={() => setSelectedEvt(null)}
                onPrev={selectedEventIdx > 0 ? () => {
                  const i = selectedEventIdx - 1;
                  selectIdx(i);
                  setSelectedEvt(events[i].id);
                } : undefined}
                onNext={selectedEventIdx < events.length - 1 ? () => {
                  const i = selectedEventIdx + 1;
                  selectIdx(i);
                  setSelectedEvt(events[i].id);
                } : undefined}
                hasPrev={selectedEventIdx > 0}
                hasNext={selectedEventIdx < events.length - 1}
                onNarrate={handleNarrate}
              />
            )}
          </AnimatePresence>
        </div>
      </Container>
    </div>
  );
}

export function TimelinePageClient() {
  return (
    <Suspense fallback={<div className="min-h-screen pt-24 flex items-center justify-center"><span className="eyebrow text-ivory/30">Loading timeline…</span></div>}>
      <TimelineContent />
    </Suspense>
  );
}
