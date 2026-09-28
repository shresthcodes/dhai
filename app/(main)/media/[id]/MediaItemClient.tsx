"use client";

import React, { useState, useCallback } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import {
  ChevronRight, Bookmark, BookmarkCheck, Share2, ExternalLink,
  FileText, Languages, List, Tag, Headphones,
} from "lucide-react";
import { Container }        from "@/components/ui/Container";
import { DemoBadge }        from "@/components/ui/Badge";
import { GoldRule }         from "@/components/ui/GoldRule";
import { Button }           from "@/components/ui/Button";
import { ArchiveCard }      from "@/components/archive/ArchiveCard";
import { MediaPlayer }      from "@/components/media/MediaPlayer";
import { TranscriptPanel }  from "@/components/media/TranscriptPanel";
import { useCollectionStore }    from "@/store/collection";
import { usePlaybackStore }      from "@/store/playback";
import { useToast }              from "@/components/ui/Toast";
import { useLanguageStore }      from "@/store/language";
import { loadArchive }           from "@/data/archiveService";
import { cn }                    from "@/lib/utils";
import type { RichMediaItem }    from "@/data/mediaModels";
import type { Language }         from "@/data/models";

type PanelTab = "transcript" | "translation" | "chapters" | "related" | "details";

const KIND_COLORS: Record<string, string> = {
  speech:      "text-gold/70 bg-gold/8 border-gold/15",
  lecture:     "text-azure/70 bg-azure/8 border-azure/15",
  documentary: "text-terracotta/70 bg-terracotta/8 border-terracotta/15",
  interview:   "text-ivory/60 bg-ivory/6 border-ivory/15",
  audio:       "text-gold/60 bg-gold/6 border-gold/12",
};

export function MediaItemClient({ item }: { item: RichMediaItem }) {
  const [panelTab,   setPanelTab]   = useState<PanelTab>("transcript");
  const [currentSec, setCurrentSec] = useState(0);
  const [isPlaying,  setIsPlaying]  = useState(false);
  const [activeLang, setActiveLang] = useState<Language>(item.language as Language);

  const { isSaved, saveItem, removeItem } = useCollectionStore();
  const { setActive, stop: stopMini }     = usePlaybackStore();
  const { toast } = useToast();
  const { language } = useLanguageStore();
  const saved = isSaved(item.id);

  const allArchive = loadArchive();
  const relatedDocs = [...item.related.documents, ...item.related.writings]
    .map((id) => allArchive.find((i) => i.id === id))
    .filter(Boolean)
    .slice(0, 3) as ReturnType<typeof loadArchive>;

  function handleSave() {
    if (saved) { removeItem(item.id); toast("Removed from collection", "info"); }
    else        { saveItem(item.id);  toast("Saved to collection", "success"); }
  }

  async function handleShare() {
    try { await navigator.share({ title: item.title, url: window.location.href }); }
    catch { await navigator.clipboard.writeText(window.location.href); toast("Link copied", "success"); }
  }

  function handleListenOnly() {
    // Stop any doc narration, start mini player
    stopMini();
    setActive(item.id, item.title, "audio", item.src ?? null, item.durationSec);
    setIsPlaying(true);
    toast("Now playing in mini player", "info");
  }

  const handlePlayPause = useCallback(() => setIsPlaying((v) => !v), []);

  const TABS: { id: PanelTab; icon: React.ElementType; label: string }[] = [
    { id: "transcript",  icon: FileText,  label: "Transcript" },
    { id: "translation", icon: Languages, label: "Translation" },
    { id: "chapters",    icon: List,      label: "Chapters" },
    { id: "related",     icon: ExternalLink, label: "Related" },
    { id: "details",     icon: Tag,       label: "Details" },
  ];

  return (
    <div className="min-h-screen pt-[4.5rem]">
      {/* Breadcrumb */}
      <div className="bg-night border-b border-[rgba(244,237,224,0.07)]">
        <Container className="py-3">
          <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 font-sans text-xs text-ivory/35 flex-wrap">
            <Link href="/" className="hover:text-gold transition-colors">Home</Link>
            <ChevronRight size={10} strokeWidth={1.5} />
            <Link href="/media" className="hover:text-gold transition-colors">Media</Link>
            <ChevronRight size={10} strokeWidth={1.5} />
            <span className="text-ivory/60 capitalize">{item.kind}</span>
            <ChevronRight size={10} strokeWidth={1.5} />
            <span className="text-ivory/50 line-clamp-1 max-w-[200px]">{item.title}</span>
          </nav>
        </Container>
      </div>

      <Container className="py-8">
        {/* Title row */}
        <div className="mb-6 space-y-3">
          <div className="flex flex-wrap items-center gap-2">
            <span className={cn("eyebrow text-[0.6rem] px-2 py-0.5 rounded-sharp border", KIND_COLORS[item.kind] ?? "text-ivory/50")}>
              {item.kind}
            </span>
            <DemoBadge />
            <span className="font-sans text-[0.6rem] text-ivory/30 border border-[rgba(244,237,224,0.1)] px-1.5 py-0.5 rounded-sharp">
              Rights: {item.rights.status}
            </span>
          </div>
          <h1 className="font-serif text-h1 text-ivory">{item.title}</h1>
          <GoldRule />
        </div>

        {/* Main 2-column layout */}
        <div className="grid grid-cols-1 lg:grid-cols-[62fr_38fr] gap-8">
          {/* LEFT: Player + actions */}
          <div className="space-y-5">
            <MediaPlayer
              item={item}
              onTimeUpdate={setCurrentSec}
              onListenOnly={handleListenOnly}
              currentSec={currentSec}
              isPlaying={isPlaying}
              onPlayPause={handlePlayPause}
            />

            {/* Actions */}
            <div className="flex flex-wrap gap-2">
              <Button variant="primary" size="sm" onClick={handleListenOnly}>
                <Headphones size={13} strokeWidth={1.5} className="mr-1" />Listen only
              </Button>
              <button onClick={handleSave}
                className={cn("flex items-center gap-1.5 px-3 py-2 rounded-sharp border font-sans text-xs transition-all focus-visible:outline-gold",
                  saved ? "bg-gold/12 text-gold border-gold/30" : "text-ivory/50 border-[rgba(244,237,224,0.12)] hover:text-gold hover:border-gold/30"
                )}
                aria-pressed={saved}
              >
                {saved ? <BookmarkCheck size={13} strokeWidth={1.5} /> : <Bookmark size={13} strokeWidth={1.5} />}
                {saved ? "Saved" : "Save"}
              </button>
              <button onClick={handleShare}
                className="flex items-center gap-1.5 px-3 py-2 rounded-sharp border border-[rgba(244,237,224,0.12)] font-sans text-xs text-ivory/50 hover:text-ivory/80 transition-all focus-visible:outline-gold"
              >
                <Share2 size={13} strokeWidth={1.5} />Share
              </button>
              <Button variant="ghost" size="sm" href={`/ask?doc=${item.id}`}>
                Ask the Archive about this
              </Button>
            </div>

            {/* Summary */}
            <div className="surface rounded-card p-5">
              <p className="eyebrow text-ivory/35 mb-2">About this recording</p>
              <p className="font-sans text-[0.875rem] text-ivory/55 leading-relaxed">{item.summary}</p>
              <p className="font-sans text-[0.65rem] text-ivory/25 italic mt-2">{item.rights.note}</p>
            </div>
          </div>

          {/* RIGHT: Synced panel */}
          <div className="space-y-0">
            {/* Tab bar */}
            <div className="flex border-b border-[rgba(244,237,224,0.08)] overflow-x-auto" role="tablist" aria-label="Media information panels">
              {TABS.map(({ id, icon: Icon, label }) => (
                <button key={id}
                  role="tab"
                  aria-selected={panelTab === id}
                  onClick={() => setPanelTab(id)}
                  className={cn(
                    "flex items-center gap-1.5 px-3 py-3 font-sans text-[0.75rem] font-medium border-b-2 transition-all whitespace-nowrap focus-visible:outline-gold shrink-0",
                    panelTab === id ? "border-gold text-gold" : "border-transparent text-ivory/45 hover:text-ivory/70"
                  )}
                >
                  <Icon size={11} strokeWidth={1.5} />{label}
                </button>
              ))}
            </div>

            <div className="pt-4 min-h-[400px]" role="tabpanel">
              {(() => {
                if (panelTab === "related") {
                  return (
                    <div className="space-y-4">
                      <p className="font-sans text-caption text-ivory/40">Archive documents linked to this recording.</p>
                      {relatedDocs.length > 0 ? (
                        <div className="space-y-3">
                          {relatedDocs.map((doc) => (
                            <ArchiveCard key={doc.id} item={doc} view="list" />
                          ))}
                        </div>
                      ) : (
                        <p className="font-sans text-caption text-ivory/25 italic">No related documents in demo archive.</p>
                      )}
                      <Button variant="ghost" size="sm" href="/ask?scope=media">
                        Find more in Ask the Archive →
                      </Button>
                    </div>
                  );
                }
                const transcriptTab = panelTab satisfies "transcript" | "translation" | "chapters" | "details";
                return (
                  <TranscriptPanel
                    item={item}
                    currentSec={currentSec}
                    onSeek={(sec) => setCurrentSec(sec)}
                    activeTab={transcriptTab}
                    activeLang={activeLang}
                    onLangChange={setActiveLang}
                  />
                );
              })()}
            </div>
          </div>
        </div>

        {/* Related media navigation */}
        <div className="mt-12 pt-6 border-t border-[rgba(244,237,224,0.07)] flex items-center justify-between flex-wrap gap-4">
          <Button variant="ghost" size="sm" href="/media">← Back to Media Archive</Button>
        </div>
      </Container>
    </div>
  );
}
