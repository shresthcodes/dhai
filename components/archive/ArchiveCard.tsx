"use client";

import React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  ScrollText, Mic, FileText, Scale, Camera, Archive, Volume2, Video,
  BookOpen, Bookmark, BookmarkCheck, ExternalLink
} from "lucide-react";
import { cn } from "@/lib/utils";
import { DemoBadge } from "@/components/ui/Badge";
import { TiltCard } from "@/components/ui/TiltCard";
import { useToast } from "@/components/ui/Toast";
import { useCollectionStore } from "@/store/collection";
import type { ArchiveItem, ArchiveItemType } from "@/data/models";

/* ─── Type glyphs ────────────────────────────────────────────────── */
const TYPE_ICONS: Record<ArchiveItemType, React.ElementType> = {
  writing:    ScrollText,
  speech:     Mic,
  manuscript: FileText,
  debate:     Scale,
  photograph: Camera,
  record:     Archive,
  audio:      Volume2,
  video:      Video,
};

const TYPE_COLORS: Record<ArchiveItemType, string> = {
  writing:    "text-gold/70 bg-gold/8 border-gold/15",
  speech:     "text-azure/70 bg-azure/8 border-azure/15",
  manuscript: "text-parchment/70 bg-parchment/8 border-parchment/15",
  debate:     "text-terracotta/70 bg-terracotta/8 border-terracotta/15",
  photograph: "text-azure/60 bg-azure/8 border-azure/12",
  record:     "text-gold/60 bg-gold/6 border-gold/12",
  audio:      "text-azure/70 bg-azure/8 border-azure/15",
  video:      "text-terracotta/60 bg-terracotta/8 border-terracotta/12",
};

const TYPE_LABELS: Record<ArchiveItemType, string> = {
  writing:    "Writing",
  speech:     "Speech",
  manuscript: "Manuscript",
  debate:     "Debate",
  photograph: "Photograph",
  record:     "Record",
  audio:      "Audio",
  video:      "Video",
};

const LANG_LABELS: Record<string, string> = {
  en: "EN", hi: "हि", mr: "मर", gu: "ગુ",
};

/* ─── Save button ────────────────────────────────────────────────── */
function SaveButton({ id, title }: { id: string; title: string }) {
  const { isSaved, saveItem, removeItem } = useCollectionStore();
  const { toast } = useToast();
  const saved = isSaved(id);

  function handleSave(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    if (saved) {
      removeItem(id);
      toast("Removed from collection", "info");
    } else {
      saveItem(id);
      toast(`"${title.slice(0, 32)}…" saved to collection`, "success");
    }
  }

  return (
    <button
      onClick={handleSave}
      className={cn(
        "p-1.5 rounded-sharp transition-all duration-200",
        "focus-visible:outline focus-visible:outline-2 focus-visible:outline-gold",
        saved
          ? "text-gold bg-gold/12 hover:bg-gold/18"
          : "text-ivory/30 hover:text-gold hover:bg-gold/8"
      )}
      aria-label={saved ? "Remove from collection" : "Save to collection"}
      aria-pressed={saved}
    >
      {saved
        ? <BookmarkCheck size={14} strokeWidth={1.5} />
        : <Bookmark      size={14} strokeWidth={1.5} />
      }
    </button>
  );
}

/* ─── Archive Card ───────────────────────────────────────────────── */
interface ArchiveCardProps {
  item:      ArchiveItem;
  view?:     "grid" | "list";
  featured?: boolean;
  matchedTerms?: string[];
}

function highlight(text: string, terms: string[]): React.ReactNode {
  if (!terms.length) return text;
  const escaped = terms.map((t) => t.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"));
  const regex = new RegExp(`(${escaped.join("|")})`, "gi");
  const parts = text.split(regex);
  return parts.map((part, i) =>
    regex.test(part)
      ? <mark key={i} className="bg-gold/20 text-gold rounded-[2px] px-0.5">{part}</mark>
      : part
  );
}

export function ArchiveCard({ item, view = "grid", featured = false, matchedTerms = [] }: ArchiveCardProps) {
  const Icon = TYPE_ICONS[item.type];
  const colorClass = TYPE_COLORS[item.type];

  // Accent hex for glow effects
  const ACCENT_MAP: Record<ArchiveItemType, string> = {
    writing:    "#C9A24B",
    speech:     "#4C7FB8",
    manuscript: "#E3C77A",
    debate:     "#B5573A",
    photograph: "#4C7FB8",
    record:     "#C9A24B",
    audio:      "#4C7FB8",
    video:      "#B5573A",
  };
  const accentHex = ACCENT_MAP[item.type];

  if (view === "list") {
    return (
      <div className="group flex gap-4 surface rounded-card p-4 hover:border-gold/20 transition-all duration-300 border border-[rgba(244,237,224,0.08)]"
        style={{ "--accent": accentHex } as React.CSSProperties}>
        {/* Icon column */}
        <div className={cn("w-14 h-14 shrink-0 rounded-sharp border flex items-center justify-center", colorClass)}>
          <Icon size={20} strokeWidth={1.5} />
        </div>
        {/* Content */}
        <div className="flex-1 min-w-0 space-y-1.5">
          <div className="flex items-start justify-between gap-2">
            <Link
              href={`/document/${item.id}`}
              className="font-serif text-[1.05rem] text-ivory group-hover:text-gold transition-colors leading-snug focus-visible:outline-gold focus-visible:rounded-sharp line-clamp-1"
            >
              {highlight(item.title, matchedTerms)}
            </Link>
            <div className="flex items-center gap-1.5 shrink-0">
              <SaveButton id={item.id} title={item.title} />
              <Link href={`/document/${item.id}`} className="p-1.5 text-ivory/30 hover:text-gold transition-colors focus-visible:outline-gold rounded-sharp" aria-label="Open document">
                <ExternalLink size={13} strokeWidth={1.5} />
              </Link>
            </div>
          </div>
          <p className="font-sans text-[0.78rem] text-ivory/45 leading-relaxed line-clamp-2">
            {highlight(item.summary, matchedTerms)}
          </p>
          <div className="flex items-center gap-2 flex-wrap">
            <span className={cn("eyebrow text-[0.55rem] px-2 py-0.5 rounded-sharp border", colorClass)}>
              {TYPE_LABELS[item.type]}
            </span>
            <span className="font-sans text-[0.65rem] text-ivory/30 border border-[rgba(244,237,224,0.1)] px-1.5 py-0.5 rounded-sharp">
              {LANG_LABELS[item.language] ?? item.language.toUpperCase()}
            </span>
            <span className="font-sans text-[0.65rem] text-ivory/25">{item.collection}</span>
            <DemoBadge />
          </div>
        </div>
      </div>
    );
  }

  const card = (
    <div
      className={cn(
        "group h-full rounded-[18px] overflow-hidden flex flex-col",
        "border transition-all duration-300",
        "border-[rgba(244,237,224,0.08)] hover:border-[rgba(244,237,224,0.18)]",
        !featured && "hover:-translate-y-0.5"
      )}
      style={{
        background: "rgba(18,21,30,0.9)",
        boxShadow: "0 2px 16px rgba(0,0,0,0.4)",
      }}
    >
      {/* ── Thumbnail ── */}
      <div
        className={cn("relative overflow-hidden shrink-0", featured ? "h-40" : "h-32")}
        style={{
          background: `radial-gradient(ellipse 80% 80% at 30% 50%, ${accentHex}18 0%, rgba(11,13,18,0.95) 70%)`,
        }}
      >
        {/* Large faint icon as background */}
        <div
          className="absolute inset-0 flex items-center justify-end pr-6 overflow-hidden"
          aria-hidden="true"
        >
          <Icon
            size={featured ? 88 : 72}
            strokeWidth={0.6}
            style={{ color: accentHex, opacity: 0.12 }}
          />
        </div>

        {/* Top accent line */}
        <div
          className="absolute top-0 left-0 right-0 h-[3px]"
          style={{ background: `linear-gradient(to right, ${accentHex}, ${accentHex}40, transparent)` }}
        />

        {/* Type badge — bottom left of thumbnail */}
        <div className="absolute bottom-3 left-3 flex items-center gap-1.5">
          <span className={cn(
            "eyebrow text-[0.52rem] px-2 py-1 rounded-[6px] border backdrop-blur-sm",
            colorClass
          )}>
            {TYPE_LABELS[item.type]}
          </span>
          <span className="font-sans text-[0.58rem] text-ivory/35 border border-[rgba(244,237,224,0.1)] px-1.5 py-1 rounded-[6px] backdrop-blur-sm bg-black/20">
            {LANG_LABELS[item.language] ?? item.language.toUpperCase()}
          </span>
        </div>

        {/* Save button — top right */}
        <div className="absolute top-2.5 right-2.5 z-10">
          <SaveButton id={item.id} title={item.title} />
        </div>
      </div>

      {/* ── Body ── */}
      <div className="flex flex-col flex-1 p-4 gap-2.5">
        <Link
          href={`/document/${item.id}`}
          className="font-serif text-[1rem] text-ivory/90 group-hover:text-gold transition-colors leading-snug focus-visible:outline-gold focus-visible:rounded-sharp line-clamp-2"
        >
          {highlight(item.title, matchedTerms)}
        </Link>

        <p className="font-sans text-[0.76rem] text-ivory/40 leading-relaxed line-clamp-2 flex-1">
          {highlight(item.summary, matchedTerms)}
        </p>

        {/* Footer */}
        <div className="flex items-center justify-between pt-2 mt-auto border-t border-[rgba(244,237,224,0.05)]">
          <div className="flex items-center gap-2 min-w-0">
            <span className="font-sans text-[0.6rem] text-ivory/22 truncate max-w-[120px]">{item.collection}</span>
            <DemoBadge />
          </div>
          <Link
            href={`/document/${item.id}`}
            className="flex items-center gap-1 font-sans text-[0.7rem] text-ivory/35 hover:text-gold transition-colors focus-visible:outline-gold focus-visible:rounded-sharp shrink-0"
            aria-label={`Open ${item.title}`}
          >
            Open <ExternalLink size={10} strokeWidth={2} />
          </Link>
        </div>
      </div>

      {/* ── Left accent glow on hover ── */}
      <div
        className="absolute inset-y-0 left-0 w-[3px] rounded-l-[18px] opacity-0 group-hover:opacity-100 transition-opacity duration-300"
        style={{ background: `linear-gradient(to bottom, ${accentHex}, ${accentHex}40)` }}
      />
    </div>
  );

  if (featured) {
    return <TiltCard maxTilt={4} className="h-full relative">{card}</TiltCard>;
  }

  return (
    <motion.div
      whileHover={{ y: -3 }}
      transition={{ duration: 0.2, ease: "easeOut" }}
      className="h-full relative"
    >
      {card}
    </motion.div>
  );
}
