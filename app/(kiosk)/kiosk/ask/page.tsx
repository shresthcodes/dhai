"use client";
import React, { useState, useRef, useCallback, Suspense } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, HelpCircle, Send } from "lucide-react";
import { KioskButton } from "@/components/kiosk/KioskButton";
import { OnScreenKeyboard } from "@/components/kiosk/OnScreenKeyboard";
import { DemoBadge } from "@/components/ui/Badge";
import { GoldRule } from "@/components/ui/GoldRule";
import { useKioskStore } from "@/store/kiosk";
import { loadArchive } from "@/data/archiveService";
import { t } from "@/lib/i18n";
import type { Language } from "@/data/models";

const SUGGESTED_QUESTIONS = [
  "What writings relate to social equality?",
  "Which speeches discuss constitutional rights?",
  "What manuscripts are in the archive?",
  "Which documents discuss education?",
];

type Stage = "idle" | "understanding" | "searching" | "ranking" | "composing" | "done";

const STAGE_LABELS: Stage[] = ["understanding", "searching", "ranking", "composing"];
const STAGE_DISPLAY: Record<string, string> = {
  understanding: "Understanding query",
  searching:     "Searching archive",
  ranking:       "Ranking sources",
  composing:     "Composing answer",
};

function AskContent() {
  const router = useRouter();
  const { language } = useKioskStore();
  const lang = (language as Language) ?? "en";
  const tr   = (k: string) => t(k, lang);

  const [query,    setQuery]    = useState("");
  const [stage,    setStage]    = useState<Stage>("idle");
  const [sources,  setSources]  = useState<{ title: string; type: string }[]>([]);
  const [answer,   setAnswer]   = useState("");
  const [kbOpen,   setKbOpen]   = useState(false);

  const stageTimers = useRef<ReturnType<typeof setTimeout>[]>([]);

  const runQuery = useCallback((q: string) => {
    if (!q.trim()) return;
    // Clear previous
    stageTimers.current.forEach(clearTimeout);
    setSources([]);
    setAnswer("");
    setStage("understanding");

    const archive = loadArchive().slice(0, 3);

    const delays: [number, () => void][] = [
      [1200, () => setStage("searching")],
      [2600, () => setStage("ranking")],
      [3800, () => {
        setStage("composing");
        setSources(archive.map((i) => ({ title: i.title, type: i.type })));
      }],
      [5400, () => {
        setStage("done");
        setAnswer(
          `Based on the archive, relevant records include documents from the Demo Collection on topics related to "${q}". ` +
          `The retrieved sources include writings, speech transcripts and historical records. ` +
          `This is a prototype DEMO response generated from placeholder archive data only.`
        );
      }],
    ];

    delays.forEach(([ms, fn]) => {
      stageTimers.current.push(setTimeout(fn, ms));
    });
  }, []);

  const handleSubmit = (q: string) => {
    setKbOpen(false);
    runQuery(q);
  };

  const isActive = stage !== "idle";

  return (
    <div className="fixed inset-0 bg-ink flex flex-col">
      {/* Header */}
      <div className="flex items-center gap-4 px-6 py-4 bg-night border-b border-[rgba(244,237,224,0.1)] shrink-0">
        <KioskButton variant="secondary" size="lg" onClick={() => router.push("/kiosk")}>
          <ArrowLeft size={22} strokeWidth={1.5} />
        </KioskButton>
        <HelpCircle size={26} strokeWidth={1.5} className="text-gold/60" />
        <h1 className="font-serif text-[1.75rem] text-ivory flex-1">{tr("kiosk.ask")}</h1>
        <span className="font-sans text-xs text-terracotta/60 border border-terracotta/25 px-3 py-1.5 rounded-[10px]">
          DEMO_SCRIPTED
        </span>
        <DemoBadge />
      </div>

      {/* Main area */}
      <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6">
        {/* Query input */}
        <div className="space-y-3">
          <button
            onClick={() => !isActive && setKbOpen(true)}
            disabled={isActive}
            className="w-full flex items-center gap-4 bg-panel border-2 border-[rgba(244,237,224,0.15)] rounded-[20px] px-6 py-5 text-left hover:border-gold/30 transition-colors focus-visible:outline-gold disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <span className="font-sans text-[1.4rem] text-ivory flex-1">
              {query || <span className="text-ivory/30">{tr("ask.placeholder")}</span>}
            </span>
            {query && !isActive && (
              <KioskButton size="lg"
                onClick={(e) => { e.stopPropagation(); handleSubmit(query); }}>
                <Send size={20} strokeWidth={1.5} />
              </KioskButton>
            )}
          </button>

          {/* Suggested questions */}
          {!isActive && (
            <div className="flex flex-wrap gap-3">
              {SUGGESTED_QUESTIONS.map((q) => (
                <button key={q}
                  onClick={() => { setQuery(q); handleSubmit(q); }}
                  className="font-sans text-base text-ivory/55 border-2 border-[rgba(244,237,224,0.12)] px-5 py-3 rounded-[14px] hover:border-gold/30 hover:text-ivory/80 transition-all active:scale-[0.97] min-h-[60px] focus-visible:outline-gold">
                  {q}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Processing stages */}
        <AnimatePresence>
          {isActive && (
            <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
              <div className="flex flex-wrap gap-3">
                {STAGE_LABELS.map((s) => {
                  const idx  = STAGE_LABELS.indexOf(s);
                  const curr = STAGE_LABELS.indexOf(stage as Stage);
                  const done = curr > idx;
                  const active = curr === idx;
                  return (
                    <span key={s}
                      className={`font-sans text-base px-5 py-2.5 rounded-[12px] border transition-all ${
                        done   ? "border-azure/40 text-azure/80 bg-azure/8" :
                        active ? "border-gold/40 text-gold bg-gold/8 animate-pulse" :
                                 "border-[rgba(244,237,224,0.08)] text-ivory/25"
                      }`}>
                      {done && "✓ "}{STAGE_DISPLAY[s]}
                    </span>
                  );
                })}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Sources */}
        <AnimatePresence>
          {sources.length > 0 && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-3">
              <p className="eyebrow text-[0.75rem] tracking-[0.2em] text-ivory/40">{tr("ask.sourcesTitle")}</p>
              {sources.map((s, i) => (
                <div key={i} className="flex items-center gap-4 bg-panel rounded-[16px] px-5 py-4 border border-[rgba(244,237,224,0.08)]">
                  <span className="font-sans text-sm text-gold/60 border border-gold/25 px-3 py-1 rounded-[8px] capitalize shrink-0">
                    {s.type}
                  </span>
                  <p className="font-sans text-[1.1rem] text-ivory/70">{s.title}</p>
                </div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Answer */}
        <AnimatePresence>
          {stage === "done" && answer && (
            <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
              className="border-2 border-azure/25 bg-azure/5 rounded-[24px] p-8 space-y-4">
              <div className="flex items-center gap-3">
                <p className="font-sans text-sm text-azure/60 uppercase tracking-widest">
                  {tr("document.aiLabel")}
                </p>
                <DemoBadge />
              </div>
              <GoldRule />
              <p className="font-sans text-[1.35rem] text-ivory/75 leading-relaxed">{answer}</p>
              <p className="font-sans text-sm text-ivory/30 italic">{tr("document.alwaysVerify")}</p>
              <KioskButton variant="secondary" size="lg"
                onClick={() => { setStage("idle"); setQuery(""); setSources([]); setAnswer(""); }}>
                {tr("common.back")}
              </KioskButton>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* On-screen keyboard */}
      <AnimatePresence>
        {kbOpen && (
          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 30, stiffness: 300 }}
            className="fixed bottom-0 left-0 right-0 z-50"
          >
            <div className="bg-night border-t border-[rgba(244,237,224,0.15)] px-4 py-3 flex items-center gap-4">
              <p className="font-sans text-xl text-ivory flex-1 truncate">
                {query || <span className="text-ivory/30">Type your question…</span>}
              </p>
              <KioskButton variant="ghost" size="lg" onClick={() => setKbOpen(false)}>Done</KioskButton>
            </div>
            <OnScreenKeyboard
              value={query}
              onChange={setQuery}
              onSearch={() => handleSubmit(query)}
              language={lang as "en" | "hi" | "gu"}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function KioskAskPage() {
  return (
    <Suspense fallback={
      <div className="fixed inset-0 bg-ink flex items-center justify-center">
        <p className="font-sans text-ivory/30 text-xl">Loading…</p>
      </div>
    }>
      <AskContent />
    </Suspense>
  );
}
