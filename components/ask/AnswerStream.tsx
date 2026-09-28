"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { Copy, Bookmark, RotateCcw, Share2, FileDown, ChevronDown, ChevronRight, Brain } from "lucide-react";
import { cn } from "@/lib/utils";
import { DemoBadge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { GoldRule } from "@/components/ui/GoldRule";
import { useCollectionStore } from "@/store/collection";
import { useToast }           from "@/components/ui/Toast";
import { useAccessibilityStore } from "@/store/accessibility";
import type { AskResult } from "@/lib/ask/types";
import dynamic from "next/dynamic";
import { usePerformanceTier } from "@/lib/performance";

const RetrievalSpace = dynamic(
  () => import("@/components/three/RetrievalSpace").then((m) => ({ default: m.RetrievalSpace })),
  { ssr: false, loading: () => <div className="h-[260px] bg-night rounded-card border border-[rgba(244,237,224,0.08)] flex items-center justify-center"><span className="eyebrow text-ivory/20 animate-pulse">Loading visualisation…</span></div> }
);

/* ─── Inline citation chip ────────────────────────────────────────── */
function CitationChip({
  num, onHover, onClick,
}: { num: number; onHover: (n: number | null) => void; onClick: (n: number) => void }) {
  return (
    <button
      onMouseEnter={() => onHover(num)}
      onMouseLeave={() => onHover(null)}
      onClick={() => onClick(num)}
      className="inline-flex items-center justify-center w-5 h-5 rounded-[3px] bg-gold/15 border border-gold/30 text-gold font-sans text-[0.6rem] font-bold mx-0.5 hover:bg-gold/25 transition-colors focus-visible:outline-gold align-text-top"
      aria-label={`View source ${num}`}
    >
      {num}
    </button>
  );
}

/* ─── Parse paragraph to inject citation chips ───────────────────── */
function ParsedText({
  text, onHover, onClick,
}: { text: string; onHover: (n: number | null) => void; onClick: (n: number) => void }) {
  const parts = text.split(/(\[\d+\])/g);
  return (
    <>
      {parts.map((part, i) => {
        const match = part.match(/^\[(\d+)\]$/);
        if (match) {
          return <CitationChip key={i} num={parseInt(match[1])} onHover={onHover} onClick={onClick} />;
        }
        return <span key={i}>{part}</span>;
      })}
    </>
  );
}

/* ─── Streaming text ──────────────────────────────────────────────── */
function StreamText({ text, speed = 18 }: { text: string; speed?: number }) {
  const [displayed, setDisplayed] = useState("");
  const { reduceMotion } = useAccessibilityStore();

  useEffect(() => {
    if (reduceMotion) { setDisplayed(text); return; }
    setDisplayed("");
    let i = 0;
    const id = setInterval(() => {
      i++;
      setDisplayed(text.slice(0, i));
      if (i >= text.length) clearInterval(id);
    }, speed);
    return () => clearInterval(id);
  }, [text, speed, reduceMotion]);

  return <>{displayed}</>;
}

/* ─── How DHAI answered diagram ──────────────────────────────────── */
function HowAnswered({ result }: { result: AskResult }) {
  const [open, setOpen] = useState(true);
  const tier = usePerformanceTier();
  const { reduceMotion } = useAccessibilityStore();

  const steps = [
    { label: "Your question",    value: null },
    { label: "Semantic search",  value: `${result.retrieval.concepts.length} concepts` },
    { label: "Archive scan",     value: `${result.retrieval.candidatesConsidered} records` },
    { label: "Source retrieval", value: `Top ${result.retrieval.used} selected` },
    { label: "RAG context",      value: "Evidence assembled" },
    { label: "Grounded answer",  value: `${result.meta.latencyMs}ms` },
    { label: "Citations",        value: `${result.sources.length} cited` },
  ];

  return (
    <div className="mt-4 border border-[rgba(244,237,224,0.08)] rounded-card overflow-hidden">
      <button
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between px-4 py-3 bg-[rgba(244,237,224,0.02)] hover:bg-[rgba(244,237,224,0.04)] transition-colors focus-visible:outline-gold"
        aria-expanded={open}
      >
        <div className="flex items-center gap-2">
          <Brain size={13} strokeWidth={1.5} className="text-azure/60" />
          <span className="font-sans text-xs font-medium text-ivory/50">How DHAI answered</span>
          <span className="eyebrow text-[0.5rem] text-ivory/20 border border-[rgba(244,237,224,0.1)] px-1.5 py-0.5 rounded-sharp">
            {result.meta.mode}
          </span>
        </div>
        {open ? <ChevronDown size={12} strokeWidth={1.5} className="text-ivory/25" /> : <ChevronRight size={12} strokeWidth={1.5} className="text-ivory/25" />}
      </button>

      {open && (
        <div className="p-4 space-y-4 border-t border-[rgba(244,237,224,0.07)]">
          {/* Pipeline diagram */}
          <div className="flex items-center flex-wrap gap-1">
            {steps.map((s, i) => (
              <React.Fragment key={s.label}>
                <div className="flex flex-col items-center">
                  <span className="font-sans text-[0.62rem] text-ivory/55 whitespace-nowrap">{s.label}</span>
                  {s.value && <span className="font-sans text-[0.55rem] text-gold/60 mt-0.5">{s.value}</span>}
                </div>
                {i < steps.length - 1 && (
                  <ChevronRight size={10} strokeWidth={1.5} className="text-ivory/20 shrink-0" />
                )}
              </React.Fragment>
            ))}
          </div>

          <p className="font-sans text-[0.7rem] text-ivory/35 italic border-l-2 border-azure/30 pl-2">
            "The AI does not just generate. It retrieves evidence first."
          </p>

          {/* Retrieval Space 3D */}
          {result.sources.length > 0 && (
            <div className="space-y-2">
              <p className="eyebrow text-[0.52rem] text-ivory/25">Retrieval Space · Prototype visualisation — demo data</p>
              <RetrievalSpace
                sources={result.sources}
                query={result.retrieval.query}
                tier={reduceMotion ? "none" : tier}
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
}

/* ─── Main answer component ───────────────────────────────────────── */
interface AnswerStreamProps {
  result:       AskResult;
  onHighlight:  (n: number | null) => void;
  onRegenerate: () => void;
  followUps:    string[];
  onFollowUp:   (q: string) => void;
}

export function AnswerStream({
  result, onHighlight, onRegenerate, followUps, onFollowUp,
}: AnswerStreamProps) {
  const { saveItem } = useCollectionStore();
  const { toast }    = useToast();
  const { reduceMotion } = useAccessibilityStore();

  const answerText = result.answer.blocks
    .filter((b) => b.type === "paragraph")
    .map((b) => b.text)
    .join("\n\n");

  function handleSaveAnswer() {
    result.sources.forEach((s) => saveItem(s.docId));
    toast(`${result.sources.length} source${result.sources.length !== 1 ? "s" : ""} added to collection`, "success");
  }

  async function handleShare() {
    await navigator.clipboard.writeText(window.location.href);
    toast("Link copied", "success");
  }

  async function handleCopy() {
    await navigator.clipboard.writeText(answerText);
    toast("Answer copied", "success");
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="space-y-4"
      role="article"
      aria-label="Archive assistant response"
    >
      {/* Azure-bordered AI panel */}
      <div className="rounded-card border border-azure/25 bg-[rgba(76,127,184,0.03)] overflow-hidden">
        {/* Header bar */}
        <div className="flex items-center gap-2 px-4 py-2.5 border-b border-azure/15 bg-azure/4">
          <Brain size={13} strokeWidth={1.5} className="text-azure/60" />
          <span className="eyebrow text-[0.55rem] text-azure/60">AI-Generated — Not Archival Text</span>
          <div className="ml-auto flex items-center gap-1.5">
            <span className="eyebrow text-[0.5rem] text-ivory/20 border border-[rgba(244,237,224,0.1)] px-1.5 py-0.5 rounded-sharp">
              {result.meta.mode}
            </span>
            <DemoBadge />
          </div>
        </div>

        {/* Answer blocks */}
        <div className="px-4 py-4 space-y-3" aria-live="polite" aria-label="Answer text">
          {result.answer.blocks.map((block, i) => {
            if (block.type === "disclaimer") {
              return (
                <p key={i} className="font-sans text-[0.68rem] text-ivory/30 italic border-l-2 border-azure/20 pl-2">
                  {block.text}
                </p>
              );
            }
            if (block.type === "note") {
              return (
                <p key={i} className="font-sans text-[0.72rem] text-azure/50 italic">
                  {block.text}
                </p>
              );
            }
            return (
              <p key={i} className="font-sans text-[0.875rem] text-ivory/70 leading-relaxed">
                {reduceMotion
                  ? <ParsedText text={block.text} onHover={onHighlight} onClick={onHighlight} />
                  : <StreamText text={block.text} speed={12} />
                }
              </p>
            );
          })}
        </div>

        {/* Footer */}
        <div className="px-4 py-3 border-t border-azure/10 bg-azure/2">
          <p className="font-sans text-[0.65rem] text-ivory/30 mb-2.5">
            Generated only from the sources above · Always verify with original documents
          </p>
          <div className="flex flex-wrap gap-2">
            <button onClick={handleCopy} className="flex items-center gap-1.5 font-sans text-xs text-ivory/40 hover:text-ivory/70 transition-colors focus-visible:outline-gold rounded-sharp" aria-label="Copy answer">
              <Copy size={12} strokeWidth={1.5} />Copy
            </button>
            <button onClick={handleSaveAnswer} className="flex items-center gap-1.5 font-sans text-xs text-ivory/40 hover:text-gold transition-colors focus-visible:outline-gold rounded-sharp" aria-label="Add sources to collection">
              <Bookmark size={12} strokeWidth={1.5} />Add sources to collection
            </button>
            <button onClick={handleShare} className="flex items-center gap-1.5 font-sans text-xs text-ivory/40 hover:text-ivory/70 transition-colors focus-visible:outline-gold rounded-sharp" aria-label="Share link">
              <Share2 size={12} strokeWidth={1.5} />Share
            </button>
            <button onClick={onRegenerate} className="flex items-center gap-1.5 font-sans text-xs text-ivory/40 hover:text-gold transition-colors focus-visible:outline-gold rounded-sharp ml-auto" aria-label="Regenerate answer">
              <RotateCcw size={12} strokeWidth={1.5} />Regenerate
            </button>
          </div>
        </div>
      </div>

      {/* Follow-up suggestions */}
      {followUps.length > 0 && (
        <div className="space-y-2">
          <p className="eyebrow text-[0.55rem] text-ivory/30">Follow-up questions</p>
          <div className="flex flex-wrap gap-2">
            {followUps.map((fq) => (
              <button
                key={fq}
                onClick={() => onFollowUp(fq)}
                className="font-sans text-xs text-ivory/50 hover:text-gold border border-[rgba(244,237,224,0.1)] hover:border-gold/30 px-3 py-1.5 rounded-sharp transition-all focus-visible:outline-gold"
              >
                {fq}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* How DHAI answered */}
      <HowAnswered result={result} />
    </motion.div>
  );
}
