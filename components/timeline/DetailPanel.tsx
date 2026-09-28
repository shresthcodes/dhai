"use client";

import React, { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  X, MapPin, AlertTriangle, CheckCircle, ChevronLeft, ChevronRight,
  Bookmark, BookmarkCheck, Share2, Volume2, ExternalLink, Clock,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { DemoBadge } from "@/components/ui/Badge";
import { useCollectionStore } from "@/store/collection";
import { useToast } from "@/components/ui/Toast";
import { loadArchive } from "@/data/archiveService";
import { CHAPTERS, type TimelineEvent } from "@/data/timelineService";

interface DetailPanelProps {
  event:     TimelineEvent;
  onClose:   () => void;
  onPrev?:   () => void;
  onNext?:   () => void;
  hasPrev:   boolean;
  hasNext:   boolean;
  onNarrate?: () => void;
}

export function DetailPanel({
  event, onClose, onPrev, onNext, hasPrev, hasNext, onNarrate,
}: DetailPanelProps) {
  const { isSaved, saveItem, removeItem } = useCollectionStore();
  const { toast } = useToast();
  const saved = isSaved(event.id);
  const meta  = CHAPTERS[event.chapter];
  const accent = meta.accentHex;

  const allDocs = loadArchive();
  const relDocs = [...event.related.documents, ...event.related.speeches]
    .map((id) => allDocs.find((d) => d.id === id)).filter(Boolean) as ReturnType<typeof loadArchive>;

  function handleSave() {
    if (saved) { removeItem(event.id); toast("Removed from collection", "info"); }
    else        { saveItem(event.id);  toast("Event saved", "success"); }
  }

  async function handleShare() {
    const url = `${window.location.origin}/timeline?event=${event.id}`;
    try { await navigator.share({ title: event.title, url }); }
    catch { await navigator.clipboard.writeText(url); toast("Link copied", "success"); }
  }

  return (
    <motion.div
      initial={{ opacity: 0, x: 28 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 28 }}
      transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
      className="w-full lg:w-[23rem] shrink-0 rounded-[22px] overflow-hidden flex flex-col"
      style={{
        background: "rgba(13,15,22,0.97)",
        border: `1px solid ${accent}30`,
        boxShadow: `0 0 0 1px ${accent}15, 0 16px 64px rgba(0,0,0,0.7), 0 0 40px ${accent}08`,
      }}
      role="complementary"
      aria-label={`Event detail: ${event.title}`}
    >
      {/* Top accent line */}
      <div className="h-[3px] w-full shrink-0"
        style={{ background: `linear-gradient(to right, ${accent}, ${accent}50, transparent)` }} />

      {/* Header */}
      <div className="flex items-center justify-between px-5 py-3 border-b border-[rgba(244,237,224,0.07)] shrink-0">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full" style={{ background: accent }} />
          <span className="font-sans text-[0.62rem] uppercase tracking-[0.18em]" style={{ color: `${accent}cc` }}>
            {meta.label}
          </span>
        </div>
        <div className="flex items-center gap-0.5">
          <button onClick={onPrev} disabled={!hasPrev}
            className="p-1.5 text-ivory/30 hover:text-ivory/70 disabled:opacity-20 transition-colors focus-visible:outline-gold rounded-[8px]"
            aria-label="Previous event"
          ><ChevronLeft size={14} strokeWidth={1.5} /></button>
          <button onClick={onNext} disabled={!hasNext}
            className="p-1.5 text-ivory/30 hover:text-ivory/70 disabled:opacity-20 transition-colors focus-visible:outline-gold rounded-[8px]"
            aria-label="Next event"
          ><ChevronRight size={14} strokeWidth={1.5} /></button>
          <button onClick={onClose}
            className="p-1.5 text-ivory/30 hover:text-ivory/70 transition-colors focus-visible:outline-gold rounded-[8px] ml-1"
            aria-label="Close"
          ><X size={14} strokeWidth={1.5} /></button>
        </div>
      </div>

      {/* Scrollable body */}
      <div className="flex-1 overflow-y-auto p-5 space-y-5"
        style={{ scrollbarWidth: "thin", scrollbarColor: `${accent}30 transparent` }}>

        {/* Year + Title */}
        <div className="space-y-1.5">
          <p className="font-serif leading-none tabular-nums"
            style={{ fontSize: "3rem", color: accent, lineHeight: 1 }}>
            {event.year}
          </p>
          <p className="font-sans text-[0.7rem] uppercase tracking-[0.15em]"
            style={{ color: `${accent}80` }}>
            {event.dateLabel}
          </p>
          <h2 className="font-serif text-[1.2rem] text-ivory leading-snug mt-2">
            {event.title}
          </h2>
          {/* Accent rule */}
          <div className="h-px w-12 mt-2"
            style={{ background: `linear-gradient(to right, ${accent}, transparent)` }} />
        </div>

        {/* One-line summary */}
        <p className="font-sans text-[0.85rem] text-ivory/60 leading-[1.75]">
          {event.oneLine}
        </p>

        {/* Place + themes */}
        <div className="space-y-2">
          {event.place && (
            <div className="flex items-center gap-2 text-ivory/35">
              <MapPin size={11} strokeWidth={1.5} style={{ color: accent }} />
              <span className="font-sans text-[0.72rem]">{event.place}</span>
            </div>
          )}
          <div className="flex flex-wrap gap-1.5 mt-1">
            {event.themes.map((th) => (
              <span key={th}
                className="font-sans text-[0.6rem] text-ivory/40 border border-[rgba(244,237,224,0.1)] px-2.5 py-1 rounded-[8px]">
                {th}
              </span>
            ))}
          </div>
        </div>

        {/* Verification */}
        <div
          className="flex items-start gap-3 px-4 py-3 rounded-[12px] border"
          style={{
            background: event.verification.status === "verified" ? `${accent}08` : "rgba(181,87,58,0.06)",
            borderColor: event.verification.status === "verified" ? `${accent}30` : "rgba(181,87,58,0.25)",
          }}
        >
          {event.verification.status === "verified"
            ? <CheckCircle size={13} strokeWidth={1.5} className="shrink-0 mt-0.5" style={{ color: accent }} />
            : <AlertTriangle size={13} strokeWidth={1.5} className="text-terracotta/70 shrink-0 mt-0.5" />
          }
          <div className="space-y-0.5">
            <p className="font-sans text-[0.65rem] font-semibold"
              style={{ color: event.verification.status === "verified" ? accent : "#B5573A" }}>
              {event.verification.status === "verified" ? "Verified" : "Seed date — verify with source"}
            </p>
            {event.verification.sourceNote && (
              <p className="font-sans text-[0.62rem] text-ivory/35">{event.verification.sourceNote}</p>
            )}
            {event.verification.sourceUrl && (
              <a href={event.verification.sourceUrl} target="_blank" rel="noopener noreferrer"
                className="font-sans text-[0.6rem] text-azure/60 hover:text-azure transition-colors flex items-center gap-1 focus-visible:outline-gold">
                Source <ExternalLink size={9} />
              </a>
            )}
          </div>
        </div>

        {/* Related documents */}
        {relDocs.length > 0 && (
          <div className="space-y-2">
            <p className="font-sans text-[0.6rem] uppercase tracking-[0.15em] text-ivory/30">
              Related in archive
            </p>
            {relDocs.slice(0, 3).map((doc) => (
              <Link key={doc.id} href={`/document/${doc.id}`}
                className="flex items-center gap-3 p-3 rounded-[12px] border border-[rgba(244,237,224,0.08)] hover:border-gold/25 transition-all group bg-[rgba(18,21,30,0.6)]">
                <div className="w-8 h-8 rounded-[8px] flex items-center justify-center shrink-0"
                  style={{ background: `${accent}15`, border: `1px solid ${accent}25` }}>
                  <span className="font-sans text-[0.5rem] uppercase" style={{ color: accent }}>
                    {doc.type.slice(0, 3)}
                  </span>
                </div>
                <p className="font-sans text-[0.75rem] text-ivory/60 group-hover:text-ivory/90 transition-colors line-clamp-2 flex-1">
                  {doc.title}
                </p>
                <ExternalLink size={10} strokeWidth={1.5} className="text-ivory/20 group-hover:text-gold shrink-0" />
              </Link>
            ))}
          </div>
        )}

        <DemoBadge />

        {/* Actions */}
        <div className="space-y-2 pt-1 border-t border-[rgba(244,237,224,0.07)]">
          <Link href={`/ask?q=${encodeURIComponent(event.title)}`}
            className="flex items-center justify-center gap-2 w-full py-3 rounded-[12px] font-sans text-[0.8rem] font-semibold transition-all focus-visible:outline-gold"
            style={{ background: accent, color: "#0B0D12" }}>
            Ask the Archive about this
          </Link>

          <div className="grid grid-cols-3 gap-2">
            <button onClick={handleSave}
              className={cn(
                "flex flex-col items-center gap-1 py-2.5 rounded-[12px] border font-sans text-[0.62rem] transition-all focus-visible:outline-gold",
                saved ? "bg-gold/12 text-gold border-gold/30" : "text-ivory/40 border-[rgba(244,237,224,0.1)] hover:text-gold hover:border-gold/25"
              )}
              aria-pressed={saved}
            >
              {saved ? <BookmarkCheck size={13} strokeWidth={1.5} /> : <Bookmark size={13} strokeWidth={1.5} />}
              {saved ? "Saved" : "Save"}
            </button>

            <button onClick={handleShare}
              className="flex flex-col items-center gap-1 py-2.5 rounded-[12px] border border-[rgba(244,237,224,0.1)] font-sans text-[0.62rem] text-ivory/40 hover:text-ivory/70 transition-all focus-visible:outline-gold">
              <Share2 size={13} strokeWidth={1.5} />Share
            </button>

            {onNarrate && (
              <button onClick={onNarrate}
                className="flex flex-col items-center gap-1 py-2.5 rounded-[12px] border border-[rgba(244,237,224,0.1)] font-sans text-[0.62rem] text-ivory/40 hover:text-gold transition-all focus-visible:outline-gold">
                <Volume2 size={13} strokeWidth={1.5} />Listen
              </button>
            )}
          </div>

          <Link href={`/story?event=${event.id}`}
            className="flex items-center justify-center gap-2 w-full py-2.5 rounded-[12px] border border-[rgba(244,237,224,0.1)] font-sans text-[0.75rem] text-ivory/40 hover:text-ivory/70 transition-all focus-visible:outline-gold">
            Open in Story Mode →
          </Link>
        </div>
      </div>
    </motion.div>
  );
}
