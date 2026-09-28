"use client";

import React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { ScrollText, Mic, FileText, Scale, Camera, Archive, Volume2, Video, Bookmark, BookmarkCheck, ExternalLink } from "lucide-react";
import { cn } from "@/lib/utils";
import { useCollectionStore } from "@/store/collection";
import { useToast }           from "@/components/ui/Toast";
import type { SourceCitation } from "@/lib/ask/types";
import type { ArchiveItemType } from "@/data/models";

const TYPE_ICONS: Record<ArchiveItemType, React.ElementType> = {
  writing: ScrollText, speech: Mic, manuscript: FileText, debate: Scale,
  photograph: Camera, record: Archive, audio: Volume2, video: Video,
};
const TYPE_COLORS: Record<ArchiveItemType, string> = {
  writing:    "text-gold/70 bg-gold/8 border-gold/15",
  speech:     "text-azure/70 bg-azure/8 border-azure/15",
  manuscript: "text-parchment/70 bg-parchment/8 border-parchment/15",
  debate:     "text-terracotta/70 bg-terracotta/8 border-terracotta/15",
  photograph: "text-azure/60 bg-azure/6 border-azure/12",
  record:     "text-gold/60 bg-gold/6 border-gold/12",
  audio:      "text-azure/70 bg-azure/8 border-azure/15",
  video:      "text-terracotta/60 bg-terracotta/8 border-terracotta/12",
};

interface SourceCardProps {
  source:      SourceCitation;
  index:       number;           // 1-based for [1][2][3]
  isHighlighted?: boolean;
  delay?:      number;
}

export function SourceCard({ source, index, isHighlighted = false, delay = 0 }: SourceCardProps) {
  const { isSaved, saveItem, removeItem } = useCollectionStore();
  const { toast } = useToast();
  const saved = isSaved(source.docId);
  const Icon  = TYPE_ICONS[source.type] ?? Archive;
  const color = TYPE_COLORS[source.type] ?? TYPE_COLORS.record;

  function handleSave(e: React.MouseEvent) {
    e.preventDefault();
    if (saved) { removeItem(source.docId); toast("Removed from collection", "info"); }
    else        { saveItem(source.docId);  toast("Source saved to collection", "success"); }
  }

  return (
    <motion.div
      initial={{ opacity: 0, x: 16 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.4, delay, ease: [0.22, 1, 0.36, 1] }}
      className={cn(
        "rounded-card border transition-all duration-300 overflow-hidden",
        isHighlighted
          ? "border-gold/40 shadow-glow bg-gold/4"
          : "border-[rgba(244,237,224,0.1)] bg-[rgba(244,237,224,0.02)] hover:border-gold/20"
      )}
    >
      {/* Ivory paper-like header */}
      <div className="bg-[rgba(244,237,224,0.04)] border-b border-[rgba(244,237,224,0.07)] px-4 py-2.5 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="font-sans text-[0.62rem] font-bold text-ivory/30 border border-[rgba(244,237,224,0.12)] w-5 h-5 rounded-[3px] flex items-center justify-center">
            {index}
          </span>
          <div className={cn("w-6 h-6 rounded-[4px] border flex items-center justify-center", color)}>
            <Icon size={11} strokeWidth={1.5} />
          </div>
          <span className={cn("eyebrow text-[0.52rem] border px-1.5 py-0.5 rounded-sharp", color)}>
            {source.type}
          </span>
        </div>
        <div className="flex items-center gap-1">
          <button onClick={handleSave}
            className={cn("p-1 rounded-sharp transition-colors focus-visible:outline-gold",
              saved ? "text-gold" : "text-ivory/25 hover:text-gold"
            )}
            aria-label={saved ? "Remove from collection" : "Save source"}
            aria-pressed={saved}
          >
            {saved ? <BookmarkCheck size={12} strokeWidth={1.5} /> : <Bookmark size={12} strokeWidth={1.5} />}
          </button>
          <Link href={`/document/${source.docId}`}
            className="p-1 text-ivory/25 hover:text-gold transition-colors rounded-sharp focus-visible:outline-gold"
            aria-label="View source document"
          >
            <ExternalLink size={12} strokeWidth={1.5} />
          </Link>
        </div>
      </div>

      {/* Body */}
      <div className="px-4 py-3 space-y-2.5">
        <Link href={`/document/${source.docId}`}
          className="font-serif text-[0.95rem] text-ivory hover:text-gold transition-colors leading-snug block focus-visible:outline-gold focus-visible:rounded-sharp"
        >
          {source.title}
        </Link>

        {/* Excerpt with highlight */}
        <p className="font-sans text-[0.73rem] text-ivory/50 leading-relaxed line-clamp-3 border-l-2 border-gold/20 pl-2">
          {source.excerpt}
        </p>

        {/* Page ref */}
        <p className="font-sans text-[0.62rem] text-ivory/25 italic">{source.pageRef}</p>

        {/* Retrieval bar */}
        <div className="space-y-1">
          <div className="flex items-center justify-between">
            <span className="eyebrow text-[0.5rem] text-ivory/25">Demo retrieval score</span>
            <span className="font-sans text-[0.6rem] text-ivory/35">{source.retrievalScore}%</span>
          </div>
          <div className="h-0.5 w-full bg-[rgba(244,237,224,0.06)] rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-gold/50 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${source.retrievalScore}%` }}
              transition={{ duration: 0.7, delay: delay + 0.2, ease: [0.22, 1, 0.36, 1] }}
            />
          </div>
        </div>
      </div>
    </motion.div>
  );
}
