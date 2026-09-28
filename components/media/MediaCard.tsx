"use client";

import React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Play, Bookmark, BookmarkCheck, FileText, Languages, Clock } from "lucide-react";
import { cn } from "@/lib/utils";
import { DemoBadge } from "@/components/ui/Badge";
import { useCollectionStore } from "@/store/collection";
import { useToast } from "@/components/ui/Toast";
import { PlaceholderPoster } from "./PlaceholderPoster";
import { formatDuration } from "@/data/mediaService";
import type { RichMediaItem } from "@/data/mediaModels";

const KIND_ACCENT: Record<string, string> = {
  speech:      "#C9A24B",
  lecture:     "#4C7FB8",
  documentary: "#B5573A",
  interview:   "#E3C77A",
  audio:       "#C9A24B",
};

const KIND_LABEL: Record<string, string> = {
  speech:      "Speech",
  lecture:     "Lecture",
  documentary: "Documentary",
  interview:   "Interview",
  audio:       "Audio",
};

const LANG_LABELS: Record<string, string> = { en: "EN", hi: "हि", mr: "मर", gu: "ગુ" };

const RIGHTS_LABELS: Record<string, string> = {
  demo:    "Rights: demo content",
  cleared: "Rights: cleared",
  unknown: "Rights: unknown",
};

interface MediaCardProps {
  item:   RichMediaItem;
  view?:  "wall" | "list";
}

export function MediaCard({ item, view = "wall" }: MediaCardProps) {
  const { isSaved, saveItem, removeItem } = useCollectionStore();
  const { toast } = useToast();
  const saved    = isSaved(item.id);
  const accent   = KIND_ACCENT[item.kind] ?? "#C9A24B";
  const kindLabel = KIND_LABEL[item.kind] ?? item.kind;

  function handleSave(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    if (saved) { removeItem(item.id); toast("Removed from collection", "info"); }
    else        { saveItem(item.id);  toast("Saved to collection", "success"); }
  }

  if (view === "list") {
    return (
      <Link href={`/media/${item.id}`}
        className="group flex gap-4 rounded-[16px] p-4 hover:border-gold/20 transition-all border border-[rgba(244,237,224,0.08)] bg-[rgba(14,16,22,0.7)]"
      >
        {/* Thumb */}
        <div className="w-28 h-16 shrink-0 rounded-[10px] overflow-hidden relative"
          style={{ background: `radial-gradient(ellipse 120% 100% at 30% 50%, ${accent}20 0%, #0E0C09 70%)` }}>
          <PlaceholderPoster title={item.title} kind={item.kind} animate={false} />
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-7 h-7 rounded-full flex items-center justify-center"
              style={{ background: `${accent}cc` }}>
              <Play size={11} strokeWidth={2} className="text-ink ml-0.5" />
            </div>
          </div>
          <div className="absolute bottom-1 right-1 bg-black/70 rounded px-1 font-sans text-[0.55rem] text-white">
            {formatDuration(item.durationSec)}
          </div>
        </div>
        {/* Body */}
        <div className="flex-1 min-w-0 space-y-1.5">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="font-sans text-[0.58rem] px-2 py-0.5 rounded-[6px] border capitalize"
              style={{ color: accent, borderColor: `${accent}40`, background: `${accent}10` }}>
              {kindLabel}
            </span>
            <span className="font-sans text-[0.6rem] text-ivory/30 border border-[rgba(244,237,224,0.1)] px-1.5 py-0.5 rounded-sharp">
              {LANG_LABELS[item.language] ?? item.language.toUpperCase()}
            </span>
            {item.accessibility.captions && (
              <span className="font-sans text-[0.58rem] text-azure/50 flex items-center gap-0.5">
                <FileText size={9} strokeWidth={1.5} />CC
              </span>
            )}
          </div>
          <p className="font-serif text-[0.95rem] text-ivory group-hover:text-gold transition-colors leading-snug line-clamp-1">
            {item.title}
          </p>
          <p className="font-sans text-[0.73rem] text-ivory/40 line-clamp-1">{item.summary}</p>
        </div>
        <div className="flex flex-col items-end gap-2 shrink-0">
          <button onClick={handleSave} className={cn("p-1.5 rounded-sharp transition-colors focus-visible:outline-gold",
            saved ? "text-gold bg-gold/10" : "text-ivory/25 hover:text-gold"
          )} aria-label={saved ? "Remove" : "Save"} aria-pressed={saved}>
            {saved ? <BookmarkCheck size={13} strokeWidth={1.5} /> : <Bookmark size={13} strokeWidth={1.5} />}
          </button>
          <DemoBadge />
        </div>
      </Link>
    );
  }

  // Grid card — archive style
  return (
    <motion.div whileHover={{ y: -3 }} transition={{ duration: 0.2, ease: "easeOut" }} className="h-full">
      <Link href={`/media/${item.id}`}
        className="group flex flex-col h-full rounded-[18px] overflow-hidden transition-all border border-[rgba(244,237,224,0.08)] hover:border-[rgba(244,237,224,0.18)]"
        style={{ background: "rgba(14,16,22,0.9)" }}
      >
        {/* Poster with accent glow */}
        <div className="relative aspect-video overflow-hidden"
          style={{ background: `radial-gradient(ellipse 80% 80% at 30% 50%, ${accent}18 0%, #0B0D12 70%)` }}>

          {/* Top accent line — archive style */}
          <div className="absolute top-0 left-0 right-0 h-[3px] z-10"
            style={{ background: `linear-gradient(to right, ${accent}, ${accent}50, transparent)` }} />

          <PlaceholderPoster title={item.title} kind={item.kind} animate={false} />

          {/* Play overlay on hover */}
          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200 bg-black/20">
            <div className="w-14 h-14 rounded-full flex items-center justify-center shadow-lg"
              style={{ background: `${accent}dd` }}>
              <Play size={20} strokeWidth={2} className="text-ink ml-1" />
            </div>
          </div>

          {/* Duration badge */}
          <div className="absolute bottom-2 right-2 bg-black/75 rounded-[6px] px-2 py-0.5 font-sans text-[0.6rem] text-white flex items-center gap-1 z-10">
            <Clock size={8} strokeWidth={2} />{formatDuration(item.durationSec)}
          </div>

          {/* Kind badge — bottom left */}
          <div className="absolute bottom-2 left-2 z-10">
            <span className="font-sans text-[0.58rem] px-2 py-1 rounded-[6px] border backdrop-blur-sm capitalize"
              style={{ color: accent, borderColor: `${accent}50`, background: "rgba(10,12,17,0.85)" }}>
              {kindLabel}
            </span>
          </div>

          {/* Save button */}
          <button onClick={handleSave}
            className={cn("absolute top-2.5 right-2.5 z-10 p-1.5 rounded-[8px] transition-colors focus-visible:outline-gold backdrop-blur-sm",
              saved ? "text-gold bg-gold/20" : "text-white/50 bg-black/30 hover:text-gold"
            )}
            aria-label={saved ? "Remove from collection" : "Save"}
            aria-pressed={saved}
          >
            {saved ? <BookmarkCheck size={12} strokeWidth={1.5} /> : <Bookmark size={12} strokeWidth={1.5} />}
          </button>
        </div>

        {/* Body */}
        <div className="p-4 flex-1 flex flex-col gap-2">
          <div className="flex items-center gap-1.5">
            <span className="font-sans text-[0.6rem] text-ivory/30 border border-[rgba(244,237,224,0.1)] px-1.5 py-0.5 rounded-sharp">
              {LANG_LABELS[item.language] ?? item.language.toUpperCase()}
            </span>
            {item.accessibility.captions && (
              <span className="font-sans text-[0.58rem] text-azure/50 flex items-center gap-0.5">
                <FileText size={9} strokeWidth={1.5} />CC
              </span>
            )}
            {item.translations && Object.keys(item.translations).length > 0 && (
              <span className="font-sans text-[0.58rem] text-gold/50 flex items-center gap-0.5">
                <Languages size={9} strokeWidth={1.5} />Trans
              </span>
            )}
            <DemoBadge />
          </div>

          <p className="font-serif text-[1rem] text-ivory/90 group-hover:text-gold transition-colors leading-snug flex-1 line-clamp-2">
            {item.title}
          </p>

          <p className="font-sans text-[0.72rem] text-ivory/38 line-clamp-2">{item.summary}</p>

          {/* Footer */}
          <div className="flex items-center justify-between mt-auto pt-2 border-t border-[rgba(244,237,224,0.05)]">
            <span className="font-sans text-[0.6rem] text-ivory/20">{item.collection}</span>
            <span className="font-sans text-[0.62rem] flex items-center gap-1" style={{ color: `${accent}80` }}>
              <Play size={9} strokeWidth={2} />Watch
            </span>
          </div>
        </div>

        {/* Left accent bar on hover */}
        <div className="absolute inset-y-0 left-0 w-[3px] rounded-l-[18px] opacity-0 group-hover:opacity-100 transition-opacity duration-300"
          style={{ background: `linear-gradient(to bottom, ${accent}, ${accent}40)` }} />
      </Link>
    </motion.div>
  );
}
