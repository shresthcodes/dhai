"use client";
import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Play, RotateCcw, ChevronRight, ChevronLeft, X, Timer, BookOpen } from "lucide-react";
import { Container }  from "@/components/ui/Container";
import { Button }     from "@/components/ui/Button";
import { GoldRule }   from "@/components/ui/GoldRule";
import { DemoBadge }  from "@/components/ui/Badge";
import { DemoToolbar } from "@/components/ui/DemoToolbar";

/* ─── Tour steps ──────────────────────────────────────────────────── */
const STEPS = [
  { id: "home",       label: "Home",             href: "/",                        note: "Cinematic 3D hero. Proves: digital museum experience + interactive 3D.", ps: "PS: Immersive web portal" },
  { id: "search",     label: "Smart Search",     href: "/search?q=constitutional+democracy", note: "Type 'constitutional democracy' → semantic results. Proves: AI-powered discovery.", ps: "PS: Intelligent retrieval" },
  { id: "document",   label: "Document Viewer",  href: "/document/doc-001",        note: "Scan viewer → OCR Lab → AI Summary. Proves: full-text access + OCR digitisation.", ps: "PS: OCR + full-text access" },
  { id: "ask",        label: "Ask the Archive",  href: "/ask",                     note: "Ask a question → stages → sources FIRST → cited answer. Proves: evidence-grounded RAG.", ps: "PS: AI research assistant with citations" },
  { id: "refusal",    label: "Refusal Demo",     href: "/ask",                     note: "Ask 'What is cricket score?' → REFUSAL. Proves: hallucination prevention.", ps: "PS: Anti-hallucination gate" },
  { id: "media",      label: "Audio-Visual",     href: "/media/av-001",            note: "Player → Transcript tab → Translation tab. Proves: multimedia archive + multilingual.", ps: "PS: Audio-visual archival system" },
  { id: "timeline",   label: "Timeline",         href: "/timeline",                note: "Immersive 3D corridor → click event → Detail panel. Proves: interactive timeline.", ps: "PS: Interactive timeline" },
  { id: "story",      label: "Story Mode",       href: "/story",                   note: "Cover → Begin → Chapter 4 (Constitutional). Proves: memorial storytelling.", ps: "PS: Memorial story module" },
  { id: "collection", label: "My Collection",    href: "/collection",              note: "Show saved items → Export Markdown. Proves: research compilation.", ps: "PS: Research compilation" },
  { id: "admin",      label: "Admin Portal",     href: "/admin",                   note: "Overview → Assets upload → OCR validate → Approve → Publish. Full workflow.", ps: "PS: Institutional archive management" },
  { id: "kiosk",      label: "Kiosk Mode",       href: "/kiosk",                   note: "Attract → Language → Home tiles. Proves: museum kiosk deployment.", ps: "PS: Touch-screen kiosk" },
  { id: "display",    label: "Smart Display",    href: "/display",                 note: "Auto-playing exhibition playlist. Proves: smart display mode.", ps: "PS: Exhibition display" },
  { id: "showcase",   label: "Showcase",         href: "/showcase",                note: "Concept visual: Web + Kiosk + Display + Phone. One knowledge layer.", ps: "PS: Multi-platform architecture" },
];

/* ─── /demo page ──────────────────────────────────────────────────── */
export default function DemoPage() {
  const [step,    setStep]    = useState(0);
  const [running, setRunning] = useState(false);
  const [notesOn, setNotesOn] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (running) {
      timerRef.current = setInterval(() => setElapsed((e) => e + 1), 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [running]);

  const current = STEPS[step];
  const mins    = Math.floor(elapsed / 60).toString().padStart(2, "0");
  const secs    = (elapsed % 60).toString().padStart(2, "0");

  return (
    <div className="min-h-screen pt-[4.5rem]" style={{ background: "radial-gradient(ellipse 70% 55% at 50% 30%, rgba(201,162,75,0.05) 0%, #0B0D12 70%)" }}>
      <Container className="py-12 space-y-10">
        {/* Header */}
        <div className="text-center space-y-3">
          <p className="eyebrow text-gold/60">Presenter Mode</p>
          <h1 className="font-serif text-h1 text-ivory">DHAI Demo Tour</h1>
          <GoldRule className="mx-auto" />
          <p className="font-sans text-body text-ivory/40">13 modules · SIH 2026 Prototype</p>
          <DemoBadge />
        </div>

        {/* Controls */}
        <div className="flex items-center justify-center gap-4 flex-wrap">
          <Button variant={running ? "secondary" : "primary"} size="lg" onClick={() => setRunning((v) => !v)}>
            <Play size={16} strokeWidth={1.5} className="mr-2" />
            {running ? "Pause timer" : "Start tour"}
          </Button>
          <div className="flex items-center gap-2 glass rounded-card px-4 py-2.5">
            <Timer size={14} strokeWidth={1.5} className="text-gold/60" />
            <span className="font-sans text-lg text-ivory tabular-nums">{mins}:{secs}</span>
          </div>
          <Button variant="ghost" size="md" onClick={() => setNotesOn((v) => !v)}>
            <BookOpen size={14} strokeWidth={1.5} className="mr-1" />
            {notesOn ? "Hide notes" : "Show notes"}
          </Button>
          <Button variant="ghost" size="sm" href="/">
            Reset & home
          </Button>
        </div>

        {/* Step cards grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {STEPS.map((s, i) => (
            <motion.div key={s.id} whileHover={{ y: -2 }} transition={{ duration: 0.15 }}>
              <Link href={s.href}
                onClick={() => setStep(i)}
                className={`block p-5 rounded-card border transition-all focus-visible:outline-gold space-y-2 ${
                  step === i
                    ? "border-gold/40 bg-gold/6 shadow-glow"
                    : "border-[rgba(244,237,224,0.08)] surface hover:border-gold/20"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="eyebrow text-[0.55rem] text-ivory/30">{String(i + 1).padStart(2, "0")}</span>
                  {step === i && <span className="eyebrow text-[0.55rem] text-gold/70">Current</span>}
                </div>
                <p className={`font-serif text-[1.1rem] ${step === i ? "text-gold" : "text-ivory"}`}>{s.label}</p>
                <p className="font-sans text-[0.72rem] text-ivory/40 leading-snug">{s.note}</p>
                {notesOn && (
                  <p className="font-sans text-[0.65rem] text-azure/60 italic border-l-2 border-azure/30 pl-2 mt-1">{s.ps}</p>
                )}
              </Link>
            </motion.div>
          ))}
        </div>

        {/* Prev / Next */}
        <div className="flex items-center justify-center gap-4">
          <Button variant="secondary" size="md" onClick={() => setStep((s) => Math.max(0, s - 1))} disabled={step === 0}>
            <ChevronLeft size={16} strokeWidth={1.5} />Prev
          </Button>
          <span className="font-sans text-sm text-ivory/35">{step + 1} / {STEPS.length}</span>
          <Button variant={step < STEPS.length - 1 ? "primary" : "secondary"} size="md"
            href={current.href}>
            Next <ChevronRight size={16} strokeWidth={1.5} />
          </Button>
        </div>

        {/* Keyboard hint */}
        <p className="font-sans text-[0.65rem] text-ivory/20 text-center">
          Press <kbd className="px-1.5 py-0.5 bg-panel border border-[rgba(244,237,224,0.1)] rounded text-ivory/30 font-sans text-[0.6rem]">Shift+D</kbd> for demo toolbar (reset / force-demo)
        </p>
      </Container>

      <DemoToolbar />
    </div>
  );
}
