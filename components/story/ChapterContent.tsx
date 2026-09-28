"use client";

import React, { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  AlertTriangle, CheckCircle, BookOpen, Volume2,
  Bookmark, BookmarkCheck, Share2, ExternalLink,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { DemoBadge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { GoldRule } from "@/components/ui/GoldRule";
import { ArchiveCard } from "@/components/archive/ArchiveCard";
import { MediaCard } from "@/components/media/MediaCard";
import { useCollectionStore } from "@/store/collection";
import { useToast } from "@/components/ui/Toast";
import { loadArchive } from "@/data/archiveService";
import { loadMediaItems } from "@/data/mediaService";
import {
  ACCENT_HEX, getChapterEvents,
  type StoryChapter,
} from "@/data/storyService";
import { CHAPTERS } from "@/data/timelineService";
import { useAccessibilityStore } from "@/store/accessibility";

interface ChapterContentProps {
  chapter:    StoryChapter;
  onNarrate:  (text: string) => void;
  isNarrating: boolean;
}

export function ChapterContent({ chapter, onNarrate, isNarrating }: ChapterContentProps) {
  const { isSaved, saveItem, removeItem } = useCollectionStore();
  const { toast } = useToast();
  const { reduceMotion } = useAccessibilityStore();
  const saved = isSaved(chapter.id);

  const accentHex = ACCENT_HEX[chapter.accent];
  const events    = getChapterEvents(chapter);
  const allDocs   = loadArchive();
  const allMedia  = loadMediaItems();

  const evidenceDocs  = [...chapter.evidence.documents, ...chapter.evidence.speeches]
    .map((id) => allDocs.find((d) => d.id === id)).filter(Boolean) as ReturnType<typeof loadArchive>;
  const evidenceMedia = chapter.evidence.media
    .map((id) => allMedia.find((m) => m.id === id)).filter(Boolean) as ReturnType<typeof loadMediaItems>;

  function handleSave() {
    if (saved) { removeItem(chapter.id); toast("Removed from collection", "info"); }
    else        { saveItem(chapter.id);  toast("Chapter saved to collection", "success"); }
  }

  async function handleShare() {
    const url = `${window.location.origin}/story?chapter=${chapter.id}`;
    try { await navigator.share({ title: chapter.title, url }); }
    catch { await navigator.clipboard.writeText(url); toast("Link copied", "success"); }
  }

  function handleListen() {
    const text = events.map((e) => `${e.dateLabel}. ${e.title}. ${e.oneLine}`).join(" ");
    onNarrate(text);
  }

  return (
    <div className="space-y-8">
      {/* Chapter heading */}
      <div className="space-y-3">
        <p className="eyebrow" style={{ color: accentHex }}>
          Chapter {String(chapter.number).padStart(2, "0")}
        </p>
        <h2 className="font-serif text-h1 text-ivory">{chapter.title}</h2>
        <p className="font-sans text-body text-ivory/50">{chapter.subtitle}</p>
        <GoldRule />
      </div>

      {/* Image slot — compact, only show if image exists */}
      {chapter.visual.imageSrc ? (
        <div className="rounded-[16px] overflow-hidden border border-[rgba(244,237,224,0.08)] aspect-[16/7]">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={chapter.visual.imageSrc} alt={chapter.title} className="w-full h-full object-cover" />
        </div>
      ) : (
        <div className="flex items-center gap-3 px-4 py-3 rounded-[12px] border border-[rgba(244,237,224,0.07)] bg-[rgba(244,237,224,0.02)]">
          <span className="font-sans text-[0.65rem] text-ivory/20 italic">
            📷 Rights-cleared photograph to be added
          </span>
          <DemoBadge />
        </div>
      )}

      {/* Key events from timeline */}
      <div className="space-y-4">
        <p className="eyebrow text-ivory/40">Key events</p>
        <div className="space-y-3">
          {events.map((evt) => (
            <Link
              key={evt.id}
              href={`/timeline?event=${evt.id}`}
              className="block p-4 rounded-card border border-[rgba(244,237,224,0.08)] hover:border-[rgba(244,237,224,0.18)] transition-all group focus-visible:outline-gold"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1">
                  <p className="font-serif text-[1rem] text-ivory/75 group-hover:text-ivory transition-colors">
                    {evt.dateLabel} — {evt.title}
                  </p>
                  <p className="font-sans text-[0.78rem] text-ivory/45 mt-1 leading-relaxed">
                    {evt.oneLine}
                  </p>
                  {evt.place && (
                    <p className="font-sans text-[0.65rem] text-ivory/25 mt-1">{evt.place}</p>
                  )}
                </div>
                {/* Verification chip */}
                <div className={cn(
                  "shrink-0 flex items-center gap-1 px-2 py-1 rounded-sharp border text-[0.55rem] font-sans",
                  evt.verification.status === "verified"
                    ? "text-gold/70 border-gold/25 bg-gold/8"
                    : "text-terracotta/70 border-terracotta/25 bg-terracotta/8"
                )}>
                  {evt.verification.status === "verified"
                    ? <CheckCircle size={9} strokeWidth={2} />
                    : <AlertTriangle size={9} strokeWidth={2} />
                  }
                  {evt.verification.status === "verified" ? "Verified" : "Seed"}
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Narrative block */}
      <div className="space-y-3">
        <p className="eyebrow text-ivory/40">Narrative</p>
        {chapter.narrative.status === "placeholder" ? (
          <div className="flex items-start gap-3 px-4 py-4 rounded-card border border-[rgba(244,237,224,0.08)] bg-[rgba(244,237,224,0.02)]">
            <BookOpen size={14} strokeWidth={1.5} className="text-ivory/25 shrink-0 mt-0.5" />
            <div>
              <p className="font-sans text-[0.8125rem] text-ivory/35 italic">
                Chapter narrative to be written from verified sources.
              </p>
              <p className="font-sans text-[0.68rem] text-ivory/20 mt-1">
                Add verified narrative paragraphs and sourceNote to story.json.
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {chapter.narrative.paragraphs.map((p, i) => (
              <p key={i} className="font-sans text-body text-ivory/65 leading-relaxed">{p}</p>
            ))}
            {chapter.narrative.sourceNote && (
              <p className="font-sans text-[0.7rem] text-ivory/30 italic border-l-2 border-gold/20 pl-3">
                Source: {chapter.narrative.sourceNote}
              </p>
            )}
          </div>
        )}
      </div>

      {/* Archival evidence strip */}
      {(evidenceDocs.length > 0 || evidenceMedia.length > 0) && (
        <div className="space-y-3">
          <p className="eyebrow text-ivory/40">Archival evidence</p>
          <p className="font-sans text-[0.65rem] text-ivory/25 italic">Demo link (placeholder archive item)</p>
          <div className="flex gap-3 overflow-x-auto pb-2">
            {evidenceDocs.slice(0, 3).map((d) => (
              <div key={d.id} className="shrink-0 w-64">
                <ArchiveCard item={d} view="list" />
              </div>
            ))}
            {evidenceMedia.slice(0, 2).map((m) => (
              <div key={m.id} className="shrink-0 w-64">
                <MediaCard item={m} view="list" />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Demo badge */}
      <DemoBadge />

      {/* Actions */}
      <div className="flex flex-wrap gap-2 pt-2 border-t border-[rgba(244,237,224,0.08)]">
        <Button variant="primary" size="sm" onClick={handleListen}>
          <Volume2 size={12} strokeWidth={1.5} className="mr-1" />
          {isNarrating ? "Narrating…" : "Listen"}
        </Button>
        <Button variant="secondary" size="sm" href={`/ask?q=${encodeURIComponent(chapter.title)}`}>
          Ask the Archive
        </Button>
        <button onClick={handleSave}
          className={cn("flex items-center gap-1.5 px-3 py-2 rounded-sharp border font-sans text-xs transition-all focus-visible:outline-gold",
            saved ? "bg-gold/12 text-gold border-gold/30" : "text-ivory/45 border-[rgba(244,237,224,0.12)] hover:text-gold"
          )}
          aria-pressed={saved}
        >
          {saved ? <BookmarkCheck size={11} strokeWidth={1.5} /> : <Bookmark size={11} strokeWidth={1.5} />}
          {saved ? "Saved" : "Save"}
        </button>
        <button onClick={handleShare}
          className="flex items-center gap-1.5 px-3 py-2 rounded-sharp border border-[rgba(244,237,224,0.12)] font-sans text-xs text-ivory/45 hover:text-ivory/70 transition-all focus-visible:outline-gold"
        >
          <Share2 size={11} strokeWidth={1.5} />Share
        </button>
        <Link
          href={`/timeline?chapter=${chapter.id}`}
          className="flex items-center gap-1.5 px-3 py-2 rounded-sharp border border-[rgba(244,237,224,0.12)] font-sans text-xs text-ivory/45 hover:text-gold transition-all focus-visible:outline-gold"
        >
          <ExternalLink size={11} strokeWidth={1.5} />Timeline view
        </Link>
      </div>
    </div>
  );
}
