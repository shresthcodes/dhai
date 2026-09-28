"use client";

import React, { useState, useEffect, useRef, useCallback, Suspense } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight, Pause, Play } from "lucide-react";
import { loadTimelineEvents, CHAPTERS } from "@/data/timelineService";
import { loadArchive } from "@/data/archiveService";
import { loadStoryChapters } from "@/data/storyService";
import { DemoBadge } from "@/components/ui/Badge";
import { GoldRule } from "@/components/ui/GoldRule";
import { QRHandoff } from "@/components/kiosk/QRHandoff";
import { useAccessibilityStore } from "@/store/accessibility";

type SceneType = "chapter-title" | "timeline-highlight" | "archive-spotlight" | "ask-demo" | "explore-menu" | "qr-handoff";

interface Scene {
  id:          string;
  type:        SceneType;
  durationSec: number;
  data:        Record<string, unknown>;
}

/* ─── Build default playlist from real data ───────────────────────── */
function buildPlaylist(): Scene[] {
  const events   = loadTimelineEvents().filter((e) => e.chapter === "constitutional-journey");
  const archive  = loadArchive().slice(0, 2);
  const chapters = loadStoryChapters();

  const scenes: Scene[] = [];

  // Chapter title intro
  scenes.push({ id: "s-title", type: "chapter-title", durationSec: 12,
    data: { chapter: chapters.find((c) => c.id === "constitutional-journey") } });

  // Timeline events
  events.slice(0, 4).forEach((evt, i) => {
    scenes.push({ id: `s-evt-${i}`, type: "timeline-highlight", durationSec: 18, data: { event: evt } });
  });

  // Archive spotlight
  archive.forEach((item, i) => {
    scenes.push({ id: `s-arch-${i}`, type: "archive-spotlight", durationSec: 18, data: { item } });
  });

  // Ask demo
  scenes.push({ id: "s-ask", type: "ask-demo", durationSec: 22,
    data: { question: "What archival material relates to constitutional debates?" } });

  // QR handoff
  scenes.push({ id: "s-qr", type: "qr-handoff", durationSec: 15, data: { path: "/archive" } });

  // Explore menu
  scenes.push({ id: "s-explore", type: "explore-menu", durationSec: 12, data: {} });

  return scenes;
}

/* ─── Scene renderers ─────────────────────────────────────────────── */
function SceneChapterTitle({ data }: { data: Record<string, unknown> }) {
  const chapter = data.chapter as ReturnType<typeof loadStoryChapters>[0] | undefined;
  return (
    <div className="flex flex-col items-center justify-center h-full text-center px-12 gap-6"
      style={{ background: "radial-gradient(ellipse 70% 55% at 50% 50%, rgba(201,162,75,0.08) 0%, transparent 70%)" }}>
      <p className="font-sans text-[1.5rem] tracking-[0.4em] text-gold/50 uppercase">Chapter</p>
      <h1 className="font-serif text-[8vw] text-ivory leading-none" style={{ textWrap: "balance" } as React.CSSProperties}>
        {chapter?.title ?? "Constitutional Journey"}
      </h1>
      <GoldRule className="mx-auto w-32" />
      <p className="font-sans text-[1.5rem] text-ivory/40">{chapter?.subtitle ?? "Drafting the foundation of a republic"}</p>
      <DemoBadge />
    </div>
  );
}

function SceneTimelineHighlight({ data }: { data: Record<string, unknown> }) {
  const event = data.event as ReturnType<typeof loadTimelineEvents>[0];
  if (!event) return null;
  const meta = CHAPTERS[event.chapter];
  return (
    <div className="flex flex-col items-center justify-center h-full text-center px-16 gap-8">
      <p className="eyebrow text-[1rem] tracking-[0.25em]" style={{ color: meta?.accentHex ?? "#C9A24B" }}>
        {meta?.label ?? event.chapter}
      </p>
      <p className="font-serif text-[6vw] text-gold leading-none">{event.dateLabel}</p>
      <h2 className="font-serif text-[4vw] text-ivory leading-tight max-w-[80%]">{event.title}</h2>
      <GoldRule className="mx-auto w-24" />
      <p className="font-sans text-[1.75rem] text-ivory/60 max-w-[70%] leading-relaxed">{event.oneLine}</p>
      {/* Seed verification chip */}
      <div className="flex items-center gap-3 mt-2">
        <span className="font-sans text-base text-terracotta/70 border border-terracotta/30 px-4 py-2 rounded-[10px]">
          Seed date — verify with source
        </span>
        <DemoBadge />
      </div>
    </div>
  );
}

function SceneArchiveSpotlight({ data }: { data: Record<string, unknown> }) {
  const item = data.item as ReturnType<typeof loadArchive>[0];
  if (!item) return null;
  return (
    <div className="flex flex-col items-center justify-center h-full text-center px-16 gap-6"
      style={{ background: "radial-gradient(ellipse 60% 50% at 50% 40%, rgba(76,127,184,0.06) 0%, transparent 70%)" }}>
      <span className="font-sans text-base text-azure/60 border border-azure/25 px-4 py-2 rounded-[10px] uppercase tracking-widest">
        Archive · {item.type}
      </span>
      <h2 className="font-serif text-[4vw] text-ivory max-w-[80%] leading-tight">{item.title}</h2>
      <GoldRule className="mx-auto w-20" />
      <p className="font-sans text-[1.75rem] text-ivory/55 max-w-[65%] leading-relaxed">{item.summary}</p>
      <div className="flex items-center gap-3">
        <span className="font-sans text-base text-ivory/30 border border-[rgba(244,237,224,0.12)] px-4 py-2 rounded-[10px]">
          {item.collection}
        </span>
        <DemoBadge />
      </div>
    </div>
  );
}

function SceneAskDemo({ data }: { data: Record<string, unknown> }) {
  const question = data.question as string;
  const [step, setStep] = useState(0);
  useEffect(() => {
    const timers = [
      setTimeout(() => setStep(1), 1500),
      setTimeout(() => setStep(2), 4000),
      setTimeout(() => setStep(3), 7000),
    ];
    return () => timers.forEach(clearTimeout);
  }, []);

  return (
    <div className="flex flex-col items-center justify-center h-full px-16 gap-8">
      <div className="max-w-[80%] w-full space-y-6">
        <div className="flex items-center gap-3 mb-2">
          <span className="font-sans text-base text-gold/60 border border-gold/25 px-4 py-2 rounded-[10px]">Ask the Archive</span>
          <span className="font-sans text-base text-terracotta/60 border border-terracotta/20 px-4 py-2 rounded-[10px]">DEMO_SCRIPTED</span>
          <DemoBadge />
        </div>
        {/* Question */}
        <div className="bg-gold/8 border-2 border-gold/20 rounded-[20px] px-8 py-6">
          <p className="font-sans text-[2rem] text-ivory/80">{question}</p>
        </div>
        {/* Stages */}
        {step >= 1 && (
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="flex gap-3 flex-wrap">
            {["Understanding query","Searching archive","Ranking sources"].map((s, i) => (
              <span key={s} className={`font-sans text-base px-4 py-2 rounded-[10px] border transition-all ${step >= i + 1 ? "border-azure/40 text-azure/70 bg-azure/8" : "border-[rgba(244,237,224,0.08)] text-ivory/25"}`}>{s}</span>
            ))}
          </motion.div>
        )}
        {/* Answer */}
        {step >= 3 && (
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
            className="border-2 border-azure/25 bg-azure/4 rounded-[20px] px-8 py-6 space-y-3">
            <p className="font-sans text-base text-azure/60 uppercase tracking-widest">AI-Generated — Not Archival Text</p>
            <p className="font-sans text-[1.5rem] text-ivory/70 leading-relaxed">
              Based on retrieved archive records, relevant materials on constitutional debates include
              speech transcripts, debate records and written documents from the Demo Collection.
            </p>
            <p className="font-sans text-base text-ivory/30 italic">
              DEMO RESPONSE — Generated from placeholder archive records only.
            </p>
          </motion.div>
        )}
      </div>
    </div>
  );
}

function SceneQRHandoff({ data }: { data: Record<string, unknown> }) {
  const path = data.path as string ?? "/archive";
  return (
    <div className="flex flex-col items-center justify-center h-full gap-8">
      <h2 className="font-serif text-[3.5rem] text-ivory">Continue on your phone</h2>
      <p className="font-sans text-[1.5rem] text-ivory/50">Scan this QR code to explore the full archive</p>
      <QRHandoff path={path} size={320} />
      <DemoBadge />
    </div>
  );
}

function SceneExploreMenu() {
  return (
    <div className="flex flex-col items-center justify-center h-full gap-8">
      <p className="font-sans text-[2rem] text-gold/60 tracking-widest uppercase">Touch to explore</p>
      <div className="grid grid-cols-2 gap-6">
        {["Documents","Speeches","Photographs","Timeline"].map((label) => (
          <div key={label} className="w-80 h-48 rounded-[28px] border-2 border-[rgba(244,237,224,0.15)] bg-panel flex items-center justify-center">
            <p className="font-serif text-[2rem] text-ivory/70">{label}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ─── Main display ────────────────────────────────────────────────── */
function DisplayContent() {
  const { reduceMotion } = useAccessibilityStore();
  const [scenes]  = useState(buildPlaylist);
  const [idx,     setIdx]     = useState(0);
  const [paused,  setPaused]  = useState(false);
  const timerRef  = useRef<ReturnType<typeof setInterval> | null>(null);

  const next = useCallback(() => setIdx((i) => (i + 1) % scenes.length), [scenes.length]);
  const prev = useCallback(() => setIdx((i) => (i - 1 + scenes.length) % scenes.length), [scenes.length]);

  useEffect(() => {
    if (paused) return;
    const scene = scenes[idx];
    timerRef.current = setInterval(next, scene.durationSec * 1000);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [idx, paused, scenes, next]);

  // Wake lock
  useEffect(() => {
    let lock: WakeLockSentinel | null = null;
    if ("wakeLock" in navigator) {
      (navigator as Navigator & { wakeLock: { request: (t: string) => Promise<WakeLockSentinel> } })
        .wakeLock.request("screen").then((l) => { lock = l; }).catch(() => {});
    }
    return () => { lock?.release().catch(() => {}); };
  }, []);

  // Keyboard shortcuts
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === " ") setPaused((v) => !v);
      if (e.key === "ArrowRight") next();
      if (e.key === "ArrowLeft")  prev();
      if (e.key === "f") document.documentElement.requestFullscreen?.().catch(() => {});
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [next, prev]);

  const scene = scenes[idx];
  const SceneRenderers: Record<SceneType, React.ComponentType<{ data: Record<string, unknown> }>> = {
    "chapter-title":      SceneChapterTitle,
    "timeline-highlight": SceneTimelineHighlight,
    "archive-spotlight":  SceneArchiveSpotlight,
    "ask-demo":           SceneAskDemo,
    "qr-handoff":         SceneQRHandoff,
    "explore-menu":       SceneExploreMenu,
  };
  const Renderer = SceneRenderers[scene.type];

  return (
    <div className="fixed inset-0 bg-ink overflow-hidden"
      style={{
        background: "radial-gradient(ellipse 80% 60% at 50% 50%, rgba(201,162,75,0.04) 0%, #0B0D12 70%)",
        fontSize: "clamp(16px, 1.5vw, 24px)",
      }}
    >
      {/* Scene */}
      <AnimatePresence mode="wait">
        <motion.div key={scene.id} className="absolute inset-0 flex flex-col"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: reduceMotion ? 0 : 0.8 }}
        >
          <Renderer data={scene.data} />
        </motion.div>
      </AnimatePresence>

      {/* Progress bar */}
      <div className="absolute bottom-0 left-0 right-0 h-1 bg-[rgba(244,237,224,0.06)]">
        <motion.div
          key={`${scene.id}-bar`}
          className="h-full bg-gold/40"
          initial={{ width: "0%" }}
          animate={{ width: "100%" }}
          transition={{ duration: scene.durationSec, ease: "linear" }}
        />
      </div>

      {/* Demo badge corner */}
      <div className="absolute bottom-4 right-4 pointer-events-none">
        <DemoBadge />
      </div>

      {/* Staff controls — visible on hover */}
      <div className="absolute top-4 left-1/2 -translate-x-1/2 flex items-center gap-3 opacity-0 hover:opacity-100 transition-opacity duration-300">
        <button onClick={prev} className="p-2 glass rounded-sharp text-ivory/50 hover:text-ivory focus-visible:outline-gold"><ChevronLeft size={18} strokeWidth={1.5} /></button>
        <button onClick={() => setPaused((v) => !v)} className="p-2 glass rounded-sharp text-ivory/50 hover:text-ivory focus-visible:outline-gold">
          {paused ? <Play size={16} strokeWidth={1.5} /> : <Pause size={16} strokeWidth={1.5} />}
        </button>
        <button onClick={next} className="p-2 glass rounded-sharp text-ivory/50 hover:text-ivory focus-visible:outline-gold"><ChevronRight size={18} strokeWidth={1.5} /></button>
        <span className="font-sans text-[0.65rem] text-ivory/25 glass rounded-sharp px-2 py-1">
          {idx + 1}/{scenes.length} · Space pause · F fullscreen
        </span>
      </div>
    </div>
  );
}

export default function DisplayPage() {
  return (
    <Suspense fallback={<div className="fixed inset-0 bg-ink flex items-center justify-center"><p className="font-serif text-ivory/30 text-2xl">DHAI Display</p></div>}>
      <DisplayContent />
    </Suspense>
  );
}
