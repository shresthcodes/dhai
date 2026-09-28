"use client";

import React, {
  useState, useEffect, useRef, useCallback, Suspense,
} from "react";
import { useSearchParams, useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import { AnimatePresence, motion } from "framer-motion";
import {
  Play, Square, Volume2, VolumeX, List, X,
  ChevronDown, ChevronUp, BookOpen, Clock,
  Archive, Mic,
} from "lucide-react";
import { Container } from "@/components/ui/Container";
import { DemoBadge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { GoldRule } from "@/components/ui/GoldRule";
import { ChapterContent } from "@/components/story/ChapterContent";
import { usePerformanceTier } from "@/lib/performance";
import { useAccessibilityStore } from "@/store/accessibility";
import { usePlaybackStore } from "@/store/playback";
import {
  loadStoryChapters, getChapterForEvent,
  ACCENT_HEX, MOOD_GRADIENT,
  type StoryChapter,
} from "@/data/storyService";import { cn } from "@/lib/utils";
import Link from "next/link";

const StoryScene = dynamic(
  () => import("@/components/three/StoryScene").then((m) => ({ default: m.StoryScene })),
  { ssr: false }
);

/* ─── Cover screen ────────────────────────────────────────────────── */
function CoverScreen({ onBegin, onSkip }: { onBegin: () => void; onSkip: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.8 }}
      className="min-h-screen flex flex-col items-center justify-center text-center px-6 relative z-10"
    >
      {/* Radial glow behind text */}
      <div
        aria-hidden="true"
        className="absolute inset-0 pointer-events-none"
        style={{ background: "radial-gradient(ellipse 50% 40% at 50% 50%, rgba(201,162,75,0.09) 0%, transparent 70%)" }}
      />

      {/* ── Constitution-inspired decorative layer ── */}
      <div aria-hidden="true" className="absolute inset-0 pointer-events-none overflow-hidden select-none">

        {/* Preamble text fragments — top-left */}
        <div className="absolute top-[8%] left-[3%] text-left opacity-[0.055] rotate-[-2deg]">
          <p className="font-serif text-ivory text-[0.72rem] leading-[1.9] tracking-[0.08em] max-w-[220px]">
            WE, THE PEOPLE OF INDIA,<br/>
            having solemnly resolved to<br/>
            constitute India into a<br/>
            SOVEREIGN SOCIALIST<br/>
            SECULAR DEMOCRATIC<br/>
            REPUBLIC and to secure to<br/>
            all its citizens: JUSTICE,<br/>
            social, economic and political;
          </p>
        </div>

        {/* Hindi Preamble — top-right */}
        <div className="absolute top-[6%] right-[3%] text-right opacity-[0.05] rotate-[1.5deg]">
          <p className="font-serif text-ivory text-[0.7rem] leading-[2] tracking-[0.05em] max-w-[200px]">
            हम, भारत के लोग,<br/>
            भारत को एक सम्पूर्ण<br/>
            प्रभुत्व-सम्पन्न समाजवादी<br/>
            पंथनिरपेक्ष लोकतंत्रात्मक<br/>
            गणराज्य बनाने के लिए<br/>
            तथा उसके समस्त नागरिकों को
          </p>
        </div>

        {/* Decorative seal ring — center background */}
        <svg
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-[0.04]"
          width="520" height="520" viewBox="0 0 520 520"
        >
          {/* Outer ring */}
          <circle cx="260" cy="260" r="240" fill="none" stroke="#C9A24B" strokeWidth="1.5" />
          <circle cx="260" cy="260" r="220" fill="none" stroke="#C9A24B" strokeWidth="0.5" strokeDasharray="4 6" />
          {/* Inner ring */}
          <circle cx="260" cy="260" r="180" fill="none" stroke="#C9A24B" strokeWidth="1" />
          <circle cx="260" cy="260" r="155" fill="none" stroke="#C9A24B" strokeWidth="0.4" strokeDasharray="2 8" />
          {/* Spokes — 24 */}
          {Array.from({ length: 24 }).map((_, i) => {
            const angle = (i / 24) * Math.PI * 2;
            const x1 = 260 + Math.cos(angle) * 60;
            const y1 = 260 + Math.sin(angle) * 60;
            const x2 = 260 + Math.cos(angle) * 150;
            const y2 = 260 + Math.sin(angle) * 150;
            return <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke="#C9A24B" strokeWidth="0.8" />;
          })}
          {/* Center hub */}
          <circle cx="260" cy="260" r="55" fill="none" stroke="#C9A24B" strokeWidth="1" />
          <circle cx="260" cy="260" r="8" fill="#C9A24B" opacity="0.6" />
          {/* Lotus petals — 8 */}
          {Array.from({ length: 8 }).map((_, i) => {
            const angle = (i / 8) * Math.PI * 2 - Math.PI / 2;
            const cx2 = 260 + Math.cos(angle) * 35;
            const cy2 = 260 + Math.sin(angle) * 35;
            return (
              <ellipse
                key={i}
                cx={cx2} cy={cy2}
                rx="10" ry="18"
                transform={`rotate(${(i / 8) * 360}, ${cx2}, ${cy2})`}
                fill="none" stroke="#C9A24B" strokeWidth="0.6"
              />
            );
          })}
          {/* Outer decorative dots */}
          {Array.from({ length: 48 }).map((_, i) => {
            const angle = (i / 48) * Math.PI * 2;
            const x = 260 + Math.cos(angle) * 232;
            const y = 260 + Math.sin(angle) * 232;
            return <circle key={i} cx={x} cy={y} r={i % 4 === 0 ? 2.5 : 1} fill="#C9A24B" />;
          })}
        </svg>

        {/* Article text — bottom-left */}
        <div className="absolute bottom-[12%] left-[4%] opacity-[0.04] rotate-[1deg]">
          <p className="font-serif text-ivory text-[0.65rem] leading-[1.9] tracking-[0.06em] max-w-[180px]">
            Article 17 — Abolition of<br/>
            Untouchability. Untouchability<br/>
            is abolished and its practice<br/>
            in any form is forbidden.<br/>
            <br/>
            Article 21 — Protection of<br/>
            life and personal liberty.
          </p>
        </div>

        {/* Article text — bottom-right */}
        <div className="absolute bottom-[10%] right-[4%] text-right opacity-[0.04] rotate-[-1.5deg]">
          <p className="font-serif text-ivory text-[0.65rem] leading-[1.9] tracking-[0.06em] max-w-[190px]">
            अनुच्छेद ३२५ — धर्म,<br/>
            मूलवंश, जाति या लिंग के<br/>
            आधार पर निर्वाचक-नामावली<br/>
            में सम्मिलित न किए जाने<br/>
            का निषेध
          </p>
        </div>

        {/* Horizontal rule lines — document feel */}
        {[22, 38, 55, 68, 80].map((top, i) => (
          <div
            key={i}
            className="absolute left-0 right-0 h-px"
            style={{
              top: `${top}%`,
              background: `linear-gradient(to right, transparent, rgba(201,162,75,${0.03 + i * 0.005}), transparent)`,
            }}
          />
        ))}

        {/* Vertical margin lines — like a ruled page */}
        <div className="absolute top-0 bottom-0 left-[8%] w-px"
          style={{ background: "linear-gradient(to bottom, transparent, rgba(201,162,75,0.06), transparent)" }} />
        <div className="absolute top-0 bottom-0 right-[8%] w-px"
          style={{ background: "linear-gradient(to bottom, transparent, rgba(201,162,75,0.06), transparent)" }} />

        {/* Corner ornaments */}
        {[
          { top: "2%",  left: "1.5%", rotate: "0" },
          { top: "2%",  right: "1.5%", rotate: "90" },
          { bottom: "2%", left: "1.5%", rotate: "270" },
          { bottom: "2%", right: "1.5%", rotate: "180" },
        ].map((pos, i) => (
          <svg key={i} width="48" height="48" viewBox="0 0 48 48"
            className="absolute opacity-[0.07]"
            style={{ ...pos, transform: `rotate(${pos.rotate ?? 0}deg)` }}>
            <path d="M4 4 L4 20 M4 4 L20 4" stroke="#C9A24B" strokeWidth="1.5" fill="none" strokeLinecap="round"/>
            <circle cx="4" cy="4" r="2" fill="#C9A24B" />
          </svg>
        ))}
      </div>

      <div className="max-w-2xl space-y-10 relative z-10">
        <div className="space-y-4">
          <p className="eyebrow text-gold/60 tracking-[0.3em]">Memorial Story</p>
          <h1
            className="font-serif text-display text-ivory"
            style={{ textWrap: "balance", fontSize: "clamp(3rem, 8vw, 6rem)", lineHeight: 1.05 } as React.CSSProperties}
          >
            A Life of Ideas
          </h1>
          <p className="font-serif text-ivory/40" style={{ fontSize: "clamp(1.1rem, 2.5vw, 1.5rem)" }}>
            Five chapters. One archive.
          </p>
        </div>

        <GoldRule className="mx-auto w-24" />

        <p className="font-sans text-body text-ivory/35 max-w-md mx-auto leading-relaxed">
          A scroll-driven memorial experience drawn from archival records.
          Chapter text is placeholder until verified sources are added.
        </p>

        <div className="flex items-center gap-2 justify-center flex-wrap">
          <DemoBadge />
          <span className="font-sans text-[0.68rem] text-ivory/25 italic">
            Placeholder narrative — verified content to be added
          </span>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button variant="primary" size="lg" onClick={onBegin}>
            Begin the story
          </Button>
          <Button variant="ghost" size="lg" onClick={onSkip}>
            Skip to chapter list
          </Button>
        </div>
      </div>
    </motion.div>
  );
}

/* ─── Closing screen ──────────────────────────────────────────────── */
function ClosingScreen({ onReplay }: { onReplay: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.7 }}
      className="min-h-screen flex flex-col items-center justify-center text-center px-6 relative z-10 py-20"
    >
      <div className="max-w-3xl space-y-12">
        <div className="space-y-3">
          <p className="eyebrow text-gold/60">End of story</p>
          <h2 className="font-serif text-h1 text-ivory">Continue exploring</h2>
          <GoldRule className="mx-auto" />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {[
            { label: "Explore the Archive",      href: "/archive",  icon: Archive,  desc: "Browse all archival materials" },
            { label: "Interactive Timeline",      href: "/timeline", icon: Clock,    desc: "The full chronological journey" },
            { label: "Ask the Archive",           href: "/ask",      icon: Mic,      desc: "Evidence-grounded AI research" },
            { label: "Audio-Visual Archive",      href: "/media",    icon: BookOpen, desc: "Lectures, speeches and recordings" },
          ].map(({ label, href, icon: Icon, desc }) => (
            <Link key={label} href={href}
              className="group p-5 surface rounded-card hover:border-gold/20 transition-all border border-[rgba(244,237,224,0.08)] text-left space-y-2 focus-visible:outline-gold"
            >
              <div className="w-9 h-9 rounded-sharp bg-gold/8 border border-gold/15 flex items-center justify-center group-hover:bg-gold/15 transition-colors">
                <Icon size={16} strokeWidth={1.5} className="text-gold/60" />
              </div>
              <p className="font-serif text-[1rem] text-ivory group-hover:text-gold transition-colors">{label}</p>
              <p className="font-sans text-caption text-ivory/35">{desc}</p>
            </Link>
          ))}
        </div>

        <div className="flex flex-wrap gap-3 justify-center">
          <Button variant="secondary" size="md" onClick={onReplay}>↺ Replay story</Button>
          <Button variant="ghost"     size="md" href="/display">Launch Exhibition Mode →</Button>
        </div>
      </div>
    </motion.div>
  );
}

/* ─── Progress rail ───────────────────────────────────────────────── */
function ProgressRail({
  chapters, activeIdx, onJump,
}: {
  chapters:  StoryChapter[];
  activeIdx: number;
  onJump:    (i: number) => void;
}) {
  return (
    <div className="flex flex-col items-center gap-1" aria-label="Chapter progress" role="navigation">
      {chapters.map((ch, i) => {
        const accent = ACCENT_HEX[ch.accent];
        const isActive = i === activeIdx;
        return (
          <button key={ch.id} onClick={() => onJump(i)}
            className="flex items-center gap-2 group focus-visible:outline-gold rounded-sharp"
            aria-label={`Chapter ${ch.number}: ${ch.title}`}
            aria-current={isActive ? "step" : undefined}
          >
            <div className="w-2.5 h-2.5 rounded-full border-2 transition-all duration-300 flex-shrink-0"
              style={{
                borderColor: accent,
                background: isActive ? accent : "transparent",
                boxShadow: isActive ? `0 0 8px ${accent}70` : "none",
              }}
            />
            <span className={cn(
              "font-sans text-[0.68rem] hidden lg:block transition-colors whitespace-nowrap",
              isActive ? "text-ivory/80" : "text-ivory/25 group-hover:text-ivory/50"
            )}>
              {String(ch.number).padStart(2, "0")} {ch.title}
            </span>
          </button>
        );
      })}
    </div>
  );
}

/* ─── Chapter drawer ──────────────────────────────────────────────── */
function ChapterDrawer({
  chapters, activeIdx, onJump, onClose,
}: {
  chapters:  StoryChapter[];
  activeIdx: number;
  onJump:    (i: number) => void;
  onClose:   () => void;
}) {
  return (
    <motion.div
      initial={{ x: "100%" }}
      animate={{ x: 0 }}
      exit={{ x: "100%" }}
      transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
      className="fixed right-0 top-0 bottom-0 z-[160] w-72 glass border-l border-[rgba(244,237,224,0.1)] p-6 overflow-y-auto"
      role="dialog"
      aria-label="Chapter list"
    >
      <div className="flex items-center justify-between mb-6">
        <p className="eyebrow text-ivory/50">Chapters</p>
        <button onClick={onClose} className="text-ivory/30 hover:text-ivory/70 p-1 rounded focus-visible:outline-gold" aria-label="Close">
          <X size={16} strokeWidth={1.5} />
        </button>
      </div>
      <div className="space-y-2">
        {chapters.map((ch, i) => {
          const accent = ACCENT_HEX[ch.accent];
          const evtCount = ch.eventIds.length;
          return (
            <button key={ch.id} onClick={() => { onJump(i); onClose(); }}
              className={cn(
                "w-full text-left p-3 rounded-card border transition-all focus-visible:outline-gold space-y-1",
                i === activeIdx ? "border-[rgba(244,237,224,0.15)] bg-white/5" : "border-transparent hover:border-[rgba(244,237,224,0.08)]"
              )}
            >
              <div className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: accent }} />
                <span className="font-sans text-[0.68rem] font-semibold text-ivory/70">
                  {String(ch.number).padStart(2, "0")} {ch.title}
                </span>
              </div>
              <p className="font-sans text-[0.62rem] text-ivory/35 pl-3.5">{ch.subtitle}</p>
              <p className="font-sans text-[0.58rem] text-ivory/20 pl-3.5">{evtCount} event{evtCount !== 1 ? "s" : ""}</p>
            </button>
          );
        })}
      </div>
    </motion.div>
  );
}

/* ─── Main story content ──────────────────────────────────────────── */
function StoryContent() {
  const params  = useSearchParams();
  const router  = useRouter();
  const tier    = usePerformanceTier();
  const { reduceMotion } = useAccessibilityStore();
  const { stop: stopMedia } = usePlaybackStore();

  const chapters = loadStoryChapters();

  // Hide footer and mini player on story page — they bleed through the fixed 3D canvas
  useEffect(() => {
    document.documentElement.setAttribute("data-story-active", "true");
    return () => document.documentElement.removeAttribute("data-story-active");
  }, []);

  const [phase,        setPhase]        = useState<"cover" | "story" | "end">("cover");
  const [activeIdx,    setActiveIdx]    = useState(0);
  const [narrating,    setNarrating]    = useState(false);
  const [drawerOpen,   setDrawerOpen]   = useState(false);
  const [guidedMode,   setGuidedMode]   = useState(false);
  const [narrationOn,  setNarrationOn]  = useState(false);
  const chapterRefs    = useRef<(HTMLElement | null)[]>([]);
  const guidedTimer    = useRef<ReturnType<typeof setTimeout> | null>(null);
  const liveRef        = useRef<HTMLParagraphElement>(null);

  // Scroll progress → 3D progress (0–1)
  const progress = phase === "story" ? (activeIdx + 1) / (chapters.length + 1) : 0;

  // Deep links
  useEffect(() => {
    const chapterId = params.get("chapter");
    const eventId   = params.get("event");
    if (chapterId) {
      const i = chapters.findIndex((c) => c.id === chapterId);
      if (i >= 0) { setPhase("story"); setActiveIdx(i); }
    } else if (eventId) {
      const ch = getChapterForEvent(eventId);
      if (ch) {
        const i = chapters.findIndex((c) => c.id === ch.id);
        if (i >= 0) { setPhase("story"); setActiveIdx(i); }
      }
    }
  }, [params, chapters]);

  // Keyboard navigation
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (phase !== "story") return;
      const tag = (e.target as HTMLElement).tagName;
      if (tag === "INPUT" || tag === "TEXTAREA") return;
      if (e.key === "ArrowDown" || e.key === "PageDown") goTo(Math.min(chapters.length - 1, activeIdx + 1));
      if (e.key === "ArrowUp"   || e.key === "PageUp")   goTo(Math.max(0, activeIdx - 1));
      if (e.key === "Home") goTo(0);
      if (e.key === "End")  goTo(chapters.length - 1);
      if (e.key === "Escape") { setNarrating(false); window.speechSynthesis?.cancel(); setGuidedMode(false); }
      // Number keys 1–5
      const num = parseInt(e.key);
      if (num >= 1 && num <= 5) goTo(num - 1);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase, activeIdx, chapters.length]);

  function goTo(idx: number) {
    setActiveIdx(idx);
    router.replace(`/story?chapter=${chapters[idx].id}`, { scroll: false });
    chapterRefs.current[idx]?.scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth" });
    if (liveRef.current) {
      liveRef.current.textContent = `Chapter ${chapters[idx].number}: ${chapters[idx].title}`;
    }
  }

  function handleNarrate(text: string) {
    if (!("speechSynthesis" in window)) return;
    stopMedia();
    window.speechSynthesis.cancel();
    if (narrating) { setNarrating(false); return; }
    const utt = new SpeechSynthesisUtterance(text);
    utt.lang = "en-IN";
    utt.rate = 0.9;
    utt.onend = () => {
      setNarrating(false);
      if (guidedMode && activeIdx < chapters.length - 1) {
        guidedTimer.current = setTimeout(() => goTo(activeIdx + 1), 1200);
      }
    };
    window.speechSynthesis.speak(utt);
    setNarrating(true);
  }

  function handleBegin() {
    setPhase("story");
    setTimeout(() => chapterRefs.current[0]?.scrollIntoView({ behavior: "smooth" }), 100);
  }

  const useScene = tier !== "none" && !reduceMotion;
  const activeChapter = chapters[activeIdx];

  if (phase === "cover") {
    return (
      <div className="min-h-screen relative">
        {useScene && <StoryScene progress={0} accent="gold" tier={tier} />}
        <div className="absolute inset-0 bg-gradient-to-b from-ink/80 via-ink/60 to-ink/80 pointer-events-none" />
        <CoverScreen
          onBegin={handleBegin}
          onSkip={() => { setPhase("story"); setDrawerOpen(true); }}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen relative" style={{ background: "#0B0D12" }}>
      {/* 3D background scene */}
      {useScene && (
        <div className="fixed inset-0 z-0">
          <StoryScene progress={progress} accent={activeChapter?.accent ?? "gold"} tier={tier} />
        </div>
      )}
      {/* CSS fallback gradient */}
      {!useScene && (
        <div
          className="fixed inset-0 z-0 transition-all duration-1000"
          style={{ background: activeChapter ? MOOD_GRADIENT[activeChapter.visual.mood] : undefined }}
        />
      )}

      {/* Dark overlay — stronger at edges, lighter in center so corridor shows */}
      <div className="fixed inset-0 z-[1] pointer-events-none"
        style={{ background: "radial-gradient(ellipse 55% 80% at 65% 50%, rgba(11,13,18,0.35) 0%, rgba(11,13,18,0.88) 100%)" }}
      />

      {/* Top progress line */}
      <div className="fixed top-[4.5rem] left-0 right-0 h-0.5 z-[50] bg-[rgba(244,237,224,0.06)]">
        <motion.div
          className="h-full bg-gradient-to-r from-transparent via-gold to-transparent"
          animate={{ width: `${((activeIdx + 1) / chapters.length) * 100}%` }}
          transition={{ duration: 0.5 }}
        />
      </div>

      {/* Toolbar */}
      <div className="fixed top-[4.5rem+2px] left-0 right-0 z-[50]">
        <div className="max-w-screen-xl mx-auto px-4 py-1.5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            {/* Narration toggle */}
            <button
              onClick={() => {
                setNarrationOn((v) => !v);
                if (narrating) { window.speechSynthesis?.cancel(); setNarrating(false); }
              }}
              className={cn("flex items-center gap-1.5 px-2.5 py-1.5 rounded-sharp border font-sans text-xs transition-all focus-visible:outline-gold",
                narrationOn ? "bg-gold/12 text-gold border-gold/30" : "text-ivory/30 border-[rgba(244,237,224,0.1)] hover:text-ivory/60"
              )}
              aria-pressed={narrationOn}
            >
              {narrationOn ? <Volume2 size={11} strokeWidth={1.5} /> : <VolumeX size={11} strokeWidth={1.5} />}
              Sound
            </button>
            {/* Guided mode */}
            {narrationOn && (
              <button
                onClick={() => setGuidedMode((v) => !v)}
                className={cn("flex items-center gap-1.5 px-2.5 py-1.5 rounded-sharp border font-sans text-xs transition-all focus-visible:outline-gold",
                  guidedMode ? "bg-azure/12 text-azure border-azure/30" : "text-ivory/30 border-[rgba(244,237,224,0.1)]"
                )}
                aria-pressed={guidedMode}
              >
                {guidedMode ? <Square size={10} strokeWidth={2} /> : <Play size={10} strokeWidth={2} />}
                {guidedMode ? "Guided on" : "Guided"}
              </button>
            )}
          </div>

          {/* Chapter list toggle */}
          <button
            onClick={() => setDrawerOpen((v) => !v)}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-sharp border border-[rgba(244,237,224,0.1)] font-sans text-xs text-ivory/40 hover:text-ivory/70 transition-all focus-visible:outline-gold"
            aria-label="Chapter list"
            aria-expanded={drawerOpen}
          >
            <List size={12} strokeWidth={1.5} />Chapters
          </button>
        </div>
      </div>

      {/* Side progress rail */}
      <div className="fixed left-4 top-1/2 -translate-y-1/2 z-[50] hidden lg:block">
        <ProgressRail chapters={chapters} activeIdx={activeIdx} onJump={goTo} />
      </div>

      {/* Aria live */}
      <p ref={liveRef} aria-live="polite" className="sr-only" />

      {/* Chapter sections */}
      <div className="relative z-[10] pt-[5rem]">
        {chapters.map((ch, i) => {
          const accentHex = ACCENT_HEX[ch.accent];
          const isActive  = activeIdx === i;
          return (
            <section
              key={ch.id}
              ref={(el) => { chapterRefs.current[i] = el; }}
              id={`chapter-${ch.id}`}
              className="relative"
              aria-label={`Chapter ${ch.number}: ${ch.title}`}
              onFocus={() => goTo(i)}
            >
              {/* ── Full-screen chapter title card (cinematic interstitial) ── */}
              <div className="min-h-screen flex flex-col items-center justify-center relative overflow-hidden">
                {/* Big chapter number — decorative background */}
                <p
                  className="absolute select-none pointer-events-none font-serif text-ivory leading-none"
                  aria-hidden="true"
                  style={{
                    fontSize: "clamp(12rem, 35vw, 28rem)",
                    opacity: 0.03,
                    top: "50%",
                    left: "50%",
                    transform: "translate(-50%, -50%)",
                    letterSpacing: "-0.04em",
                  }}
                >
                  {String(ch.number).padStart(2, "0")}
                </p>

                {/* Title card content */}
                <motion.div
                  initial={{ opacity: 0, y: 40 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: false, margin: "-20%" }}
                  transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
                  className="text-center space-y-5 relative z-10 px-8"
                  onViewportEnter={() => goTo(i)}
                >
                  <p
                    className="font-sans text-[0.75rem] tracking-[0.35em] uppercase"
                    style={{ color: `${accentHex}99` }}
                  >
                    Chapter {String(ch.number).padStart(2, "0")}
                  </p>
                  <h2
                    className="font-serif text-ivory"
                    style={{
                      fontSize: "clamp(2.5rem, 7vw, 5.5rem)",
                      lineHeight: 1.05,
                      textShadow: `0 0 80px ${accentHex}30`,
                    }}
                  >
                    {ch.title}
                  </h2>
                  <p className="font-sans text-ivory/40 text-[1.1rem]">{ch.subtitle}</p>

                  {/* Gold rule with accent */}
                  <div
                    className="h-px w-24 mx-auto"
                    style={{ background: `linear-gradient(to right, transparent, ${accentHex}, transparent)` }}
                  />

                  {/* Scroll hint */}
                  <motion.p
                    animate={{ opacity: [0.3, 0.7, 0.3], y: [0, 4, 0] }}
                    transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
                    className="font-sans text-xs text-ivory/25 tracking-widest pt-4"
                  >
                    scroll to read ↓
                  </motion.p>
                </motion.div>
              </div>

              {/* ── Chapter content card ── */}
              <div className="min-h-screen flex items-center justify-center py-20 px-4">
                <motion.div
                  initial={{ opacity: 0, scale: 0.97 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true, margin: "-10%" }}
                  transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
                  className="w-full max-w-3xl mx-auto"
                >
                  <div
                    className="backdrop-blur-[10px] rounded-[28px] p-8 lg:p-12 transition-shadow duration-700"
                    style={{
                      background: "rgba(10,12,17,0.84)",
                      border: `1px solid ${isActive ? `${accentHex}35` : "rgba(244,237,224,0.07)"}`,
                      boxShadow: isActive
                        ? `0 0 0 1px ${accentHex}18, 0 12px 80px rgba(0,0,0,0.7), 0 0 60px ${accentHex}12`
                        : "0 8px 64px rgba(0,0,0,0.6)",
                    }}
                    onClick={() => setActiveIdx(i)}
                  >
                    <ChapterContent
                      chapter={ch}
                      onNarrate={handleNarrate}
                      isNarrating={narrating && isActive}
                    />
                  </div>
                </motion.div>
              </div>
            </section>
          );
        })}

        {/* End screen */}
        <div
          className="min-h-screen relative z-[10]"
          style={{ background: "#0B0D12" }}
        >
          <ClosingScreen onReplay={() => { setPhase("cover"); setActiveIdx(0); }} />
        </div>
      </div>

      {/* Floating prev/next */}
      <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-[50] flex items-center gap-3">
        <button
          onClick={() => goTo(Math.max(0, activeIdx - 1))}
          disabled={activeIdx === 0}
          className="flex items-center gap-1.5 px-3 py-2 glass rounded-card font-sans text-xs text-ivory/50 hover:text-ivory/80 disabled:opacity-20 transition-all focus-visible:outline-gold border border-[rgba(244,237,224,0.1)]"
          aria-label="Previous chapter"
        >
          <ChevronUp size={12} strokeWidth={1.5} />Prev
        </button>
        <span className="font-sans text-[0.65rem] text-ivory/25 tabular-nums">
          {activeIdx + 1} / {chapters.length}
        </span>
        <button
          onClick={() => {
            if (activeIdx < chapters.length - 1) goTo(activeIdx + 1);
            else setPhase("end");
          }}
          className="flex items-center gap-1.5 px-3 py-2 glass rounded-card font-sans text-xs text-ivory/50 hover:text-ivory/80 transition-all focus-visible:outline-gold border border-[rgba(244,237,224,0.1)]"
          aria-label="Next chapter"
        >
          Next <ChevronDown size={12} strokeWidth={1.5} />
        </button>
      </div>

      {/* Chapter drawer */}
      <AnimatePresence>
        {drawerOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 z-[155] bg-black/30"
              onClick={() => setDrawerOpen(false)}
              aria-hidden="true"
            />
            <ChapterDrawer
              chapters={chapters}
              activeIdx={activeIdx}
              onJump={goTo}
              onClose={() => setDrawerOpen(false)}
            />
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

export function StoryPageClient() {
  return (
    <Suspense fallback={<div className="min-h-screen pt-24 flex items-center justify-center"><span className="eyebrow text-ivory/30">Loading story…</span></div>}>
      <StoryContent />
    </Suspense>
  );
}
