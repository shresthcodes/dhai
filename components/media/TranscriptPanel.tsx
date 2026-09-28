"use client";

import React, { useRef, useEffect, useState } from "react";
import { Copy, Search, Languages, X, AlertCircle } from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { useToast } from "@/components/ui/Toast";
import type { RichMediaItem, TranscriptLine } from "@/data/mediaModels";
import type { Language } from "@/data/models";

const LANG_LABELS: Record<string, string> = { en: "EN", hi: "हिन्दी", mr: "मराठी", gu: "ગુજ" };
const SPEAKER_COLORS = ["text-gold/70", "text-azure/70", "text-parchment/70", "text-terracotta/60"];

interface TranscriptPanelProps {
  item:        RichMediaItem;
  currentSec:  number;
  onSeek:      (sec: number) => void;
  activeTab:   "transcript" | "translation" | "chapters" | "details";
  activeLang:  Language;
  onLangChange:(l: Language) => void;
}

function TranscriptLines({
  lines, currentSec, onSeek, searchQuery, follow,
}: {
  lines:       TranscriptLine[];
  currentSec:  number;
  onSeek:      (sec: number) => void;
  searchQuery: string;
  follow:      boolean;
}) {
  const activeRef = useRef<HTMLDivElement>(null);
  const activeIdx = lines.findLastIndex((l: import("@/data/mediaModels").TranscriptLine) => l.startSec <= currentSec);

  useEffect(() => {
    if (follow && activeRef.current) {
      activeRef.current.scrollIntoView({ behavior: "smooth", block: "nearest" });
    }
  }, [activeIdx, follow]);

  // Unique speakers for colour coding
  const speakers = Array.from(new Set(lines.map((l) => l.speaker).filter(Boolean)));
  const speakerColor = (s?: string) => {
    if (!s) return "text-ivory/65";
    const idx = speakers.indexOf(s);
    return SPEAKER_COLORS[idx % SPEAKER_COLORS.length];
  };

  function highlight(text: string): React.ReactNode {
    if (!searchQuery.trim()) return text;
    const re = new RegExp(`(${searchQuery.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")})`, "gi");
    const parts = text.split(re);
    return parts.map((p, i) => re.test(p) ? <mark key={i} className="bg-gold/25 text-gold rounded-[2px]">{p}</mark> : p);
  }

  return (
    <div className="space-y-1 max-h-[460px] overflow-y-auto pr-1">
      {lines.map((line, i) => {
        const isActive = i === activeIdx;
        return (
          <div
            key={i}
            ref={isActive ? activeRef : null}
            onClick={() => onSeek(line.startSec)}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => e.key === "Enter" && onSeek(line.startSec)}
            className={cn(
              "flex gap-2.5 p-2 rounded-sharp cursor-pointer transition-all duration-200",
              "focus-visible:outline focus-visible:outline-2 focus-visible:outline-gold",
              isActive
                ? "bg-gold/10 border-l-2 border-gold/60"
                : "hover:bg-white/4 border-l-2 border-transparent"
            )}
            aria-current={isActive ? "true" : undefined}
          >
            <span className="font-sans text-[0.6rem] text-ivory/25 shrink-0 tabular-nums w-10 pt-0.5">
              {Math.floor(line.startSec / 60)}:{String(line.startSec % 60).padStart(2, "0")}
            </span>
            <div className="flex-1 min-w-0">
              {line.speaker && (
                <p className={cn("font-sans text-[0.58rem] font-semibold uppercase tracking-wider mb-0.5", speakerColor(line.speaker))}>
                  {line.speaker}
                </p>
              )}
              <p className={cn("font-sans text-[0.8125rem] leading-relaxed", isActive ? "text-ivory/90" : "text-ivory/55")}>
                {highlight(line.text)}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
}

export function TranscriptPanel({
  item, currentSec, onSeek, activeTab, activeLang, onLangChange,
}: TranscriptPanelProps) {
  const [searchQ,   setSearchQ]   = useState("");
  const [follow,    setFollow]    = useState(true);
  const { toast } = useToast();

  const translationLines = item.translations?.[activeLang];
  const hasTranslation   = !!translationLines?.length;
  const availLangs: Language[] = ["en", ...(Object.keys(item.translations ?? {}) as Language[])];

  function handleCopy() {
    const text = item.transcript.map((l) => `[${l.startSec}s] ${l.text}`).join("\n");
    navigator.clipboard.writeText(text);
    toast("Transcript copied", "success");
  }

  if (activeTab === "transcript") return (
    <div className="space-y-3">
      {/* Toolbar */}
      <div className="flex items-center gap-2 flex-wrap">
        <div className="flex-1 flex items-center gap-1.5 bg-panel border border-[rgba(244,237,224,0.1)] rounded-sharp px-2.5 py-1.5">
          <Search size={11} strokeWidth={1.5} className="text-ivory/30 shrink-0" />
          <input
            type="search"
            value={searchQ}
            onChange={(e) => setSearchQ(e.target.value)}
            placeholder="Search transcript…"
            className="flex-1 bg-transparent font-sans text-xs text-ivory/70 outline-none placeholder:text-ivory/20"
            aria-label="Search transcript"
          />
          {searchQ && <button onClick={() => setSearchQ("")} className="text-ivory/30 hover:text-ivory/60 focus-visible:outline-gold"><X size={10} /></button>}
        </div>
        <label className="flex items-center gap-1.5 cursor-pointer select-none">
          <input type="checkbox" checked={follow} onChange={(e) => setFollow(e.target.checked)} className="accent-gold" aria-label="Follow playback" />
          <span className="font-sans text-[0.68rem] text-ivory/40">Follow</span>
        </label>
        <button onClick={handleCopy} className="flex items-center gap-1 font-sans text-[0.68rem] text-ivory/35 hover:text-gold transition-colors focus-visible:outline-gold rounded-sharp" aria-label="Copy transcript">
          <Copy size={10} strokeWidth={1.5} />Copy
        </button>
      </div>
      <TranscriptLines lines={item.transcript} currentSec={currentSec} onSeek={onSeek} searchQuery={searchQ} follow={follow} />
    </div>
  );

  if (activeTab === "translation") return (
    <div className="space-y-3">
      {/* Language selector */}
      <div className="flex items-center gap-2 flex-wrap">
        <Languages size={13} strokeWidth={1.5} className="text-ivory/40 shrink-0" />
        <div className="flex gap-1.5 flex-wrap">
          {availLangs.map((l) => (
            <button key={l} onClick={() => onLangChange(l)}
              className={cn("px-2.5 py-1 rounded-sharp font-sans text-xs border transition-all focus-visible:outline-gold",
                activeLang === l ? "bg-gold/12 text-gold border-gold/30" : "text-ivory/40 border-[rgba(244,237,224,0.1)] hover:text-ivory/70"
              )}
              aria-pressed={activeLang === l}
              lang={l}
            >{LANG_LABELS[l] ?? l}</button>
          ))}
        </div>
      </div>
      {/* Notice */}
      {activeLang !== "en" && (
        <div className="flex items-start gap-2 px-3 py-2 rounded-sharp border border-azure/20 bg-azure/4">
          <AlertCircle size={11} strokeWidth={1.5} className="text-azure/60 shrink-0 mt-0.5" />
          <p className="font-sans text-[0.68rem] text-ivory/50">
            Machine translation — demo — requires human validation for official content.
          </p>
        </div>
      )}
      {hasTranslation ? (
        <TranscriptLines lines={translationLines!} currentSec={currentSec} onSeek={onSeek} searchQuery="" follow={follow} />
      ) : (
        <div className="py-8 text-center space-y-2">
          <Languages size={24} strokeWidth={1} className="text-ivory/15 mx-auto" />
          <p className="font-sans text-sm text-ivory/30">Translation not available in demo.</p>
          <p className="font-sans text-xs text-ivory/20">Verified translations will be added with source content.</p>
        </div>
      )}
    </div>
  );

  if (activeTab === "chapters") return (
    <div className="space-y-2">
      {item.chapters.map((ch, i) => (
        <button key={i} onClick={() => onSeek(ch.startSec)}
          className="w-full flex items-center gap-3 p-3 rounded-sharp hover:bg-white/5 text-left transition-colors focus-visible:outline-gold border border-transparent hover:border-[rgba(244,237,224,0.08)]"
          aria-label={`Chapter: ${ch.title} at ${formatDuration(ch.startSec)}`}
        >
          <div className="w-12 h-8 rounded-[3px] overflow-hidden bg-[#0E0C09] shrink-0 flex items-center justify-center">
            <span className="font-sans text-[0.58rem] text-ivory/30">{i + 1}</span>
          </div>
          <div>
            <p className="font-sans text-[0.8125rem] text-ivory/70">{ch.title}</p>
            <p className="font-sans text-[0.62rem] text-ivory/30">{formatDuration(ch.startSec)}</p>
          </div>
        </button>
      ))}
    </div>
  );

  if (activeTab === "details") return (
    <div className="space-y-0 divide-y divide-[rgba(244,237,224,0.07)]">
      {[
        { label: "ID",         value: item.id },
        { label: "Kind",       value: item.kind },
        { label: "Type",       value: item.mediaType },
        { label: "Date",       value: item.date ?? "Date to be verified" },
        { label: "Language",   value: item.language.toUpperCase() },
        { label: "Collection", value: item.collection },
        { label: "Source",     value: item.source },
        { label: "Duration",   value: formatDuration(item.durationSec) },
        { label: "Rights",     value: item.rights.status },
        { label: "Captions",   value: item.accessibility.captions ? "Available" : "Not available" },
      ].map(({ label, value }) => (
        <div key={label} className="flex justify-between gap-4 py-2.5">
          <span className="font-sans text-[0.72rem] text-ivory/35 shrink-0">{label}</span>
          <span className="font-sans text-[0.78rem] text-ivory/60 text-right">{value}</span>
        </div>
      ))}
      <p className="font-sans text-[0.65rem] text-ivory/20 italic pt-3">{item.rights.note}</p>
    </div>
  );

  return null;
}

function formatDuration(sec: number): string {
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  const h = Math.floor(sec / 3600);
  if (h > 0) return `${h}:${String(m % 60).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  return `${m}:${String(s).padStart(2, "0")}`;
}
