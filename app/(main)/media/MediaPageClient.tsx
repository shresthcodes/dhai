"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import dynamic from "next/dynamic";
import { motion } from "framer-motion";
import { LayoutGrid, List } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { DemoBadge } from "@/components/ui/Badge";
import { GoldRule } from "@/components/ui/GoldRule";
import { ScrollReveal } from "@/components/ui/ScrollReveal";
import { MediaCard } from "@/components/media/MediaCard";
import { SkeletonGrid } from "@/components/ui/SkeletonCard";
import { usePerformanceTier } from "@/lib/performance";
import { useAccessibilityStore } from "@/store/accessibility";
import { getMediaItems } from "@/data/mediaService";
import type { RichMediaItem, MediaKind } from "@/data/mediaModels";
import { cn } from "@/lib/utils";

const MediaWall = dynamic(
  () => import("@/components/three/MediaWall").then((m) => ({ default: m.MediaWall })),
  { ssr: false, loading: () => <div className="h-[420px] bg-night rounded-card border border-[rgba(244,237,224,0.08)] flex items-center justify-center"><span className="eyebrow text-ivory/25 animate-pulse">Loading media wall…</span></div> }
);

const KINDS: { label: string; value: string }[] = [
  { label: "All",            value: "" },
  { label: "Speeches",       value: "speech" },
  { label: "Lectures",       value: "lecture" },
  { label: "Documentaries",  value: "documentary" },
  { label: "Interviews",     value: "interview" },
  { label: "Audio",          value: "audio" },
];

function MediaContent() {
  const router   = useRouter();
  const params   = useSearchParams();
  const tier     = usePerformanceTier();
  const { reduceMotion } = useAccessibilityStore();

  const [items,   setItems]   = useState<RichMediaItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [kind,    setKind]    = useState(params.get("kind") ?? "");
  const [view,    setView]    = useState<"wall" | "grid" | "list">("grid");

  useEffect(() => {
    setLoading(true);
    getMediaItems(kind ? { kind: [kind as MediaKind] } : undefined)
      .then(setItems)
      .finally(() => setLoading(false));
  }, [kind]);

  function handleKind(k: string) {
    setKind(k);
    const url = k ? `/media?kind=${k}` : "/media";
    router.replace(url, { scroll: false });
  }

  const showWall = view === "wall" && !reduceMotion;

  return (
    <div className="min-h-screen pt-[4.5rem]">
      {/* Header */}
      <div className="bg-night border-b border-[rgba(244,237,224,0.07)]">
        <Container className="py-10">
          <ScrollReveal>
            <div className="flex flex-wrap items-end justify-between gap-6">
              <div className="space-y-2">
                <p className="eyebrow text-gold/70 tracking-[0.25em]">Audio-Visual Archive</p>
                <h1 className="font-serif text-h1 text-ivory">Media Collection</h1>
                <GoldRule />
                <p className="font-sans text-caption text-ivory/45 mt-1 max-w-lg">
                  Explore lectures, documentaries, interviews, speeches and audio recordings.
                </p>
              </div>
              {/* Stats */}
              <div className="flex items-end gap-6 flex-wrap">
                {[
                  { value: items.filter(i => i.mediaType === "video").length || "—", label: "Video" },
                  { value: items.filter(i => i.mediaType === "audio").length || "—", label: "Audio" },
                  { value: items.length || "—", label: "Total" },
                ].map(({ value, label }) => (
                  <div key={label} className="text-center">
                    <p className="font-serif text-[2.2rem] text-gold/80 leading-none tabular-nums">{value}</p>
                    <p className="font-sans text-[0.62rem] text-ivory/30 mt-1 tracking-widest uppercase">{label}</p>
                  </div>
                ))}
                <div className="flex flex-col items-end gap-1.5 ml-2">
                  <DemoBadge />
                  <span className="font-sans text-[0.6rem] text-ivory/25">{items.length} demo records</span>
                </div>
              </div>
            </div>
          </ScrollReveal>
        </Container>

        {/* Sticky controls */}
        <div className="sticky top-[4.5rem] z-40 bg-night/95 backdrop-blur-sm border-b border-[rgba(244,237,224,0.07)]">
          <Container>
            <div className="flex items-center justify-between gap-2">
              {/* Kind tabs */}
              <div className="flex overflow-x-auto" role="tablist" aria-label="Media categories">
                {KINDS.map(({ label, value }) => {
                  const active = kind === value;
                  return (
                    <button
                      key={value}
                      role="tab"
                      aria-selected={active}
                      onClick={() => handleKind(value)}
                      className={cn(
                        "relative shrink-0 px-4 py-3 font-sans text-[0.8125rem] font-medium whitespace-nowrap transition-colors focus-visible:outline-gold focus-visible:rounded-sharp",
                        active ? "text-gold" : "text-ivory/50 hover:text-ivory/80"
                      )}
                    >
                      {label}
                      {active && (
                        <motion.span
                          layoutId="media-tab-underline"
                          className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-gold to-transparent"
                        />
                      )}
                    </button>
                  );
                })}
              </div>

              {/* View toggle */}
              <div className="flex items-center border border-[rgba(244,237,224,0.12)] rounded-sharp overflow-hidden shrink-0 ml-2">
                {([
                  { v: "wall",  label: "Wall",  icon: "⬜" },
                  { v: "grid",  label: "Grid",  icon: null },
                  { v: "list",  label: "List",  icon: null },
                ] as const).map(({ v, label }) => (
                  <button
                    key={v}
                    onClick={() => setView(v)}
                    className={cn(
                      "px-3 py-2 font-sans text-xs transition-colors focus-visible:outline-gold border-r border-[rgba(244,237,224,0.08)] last:border-0",
                      view === v ? "bg-gold/12 text-gold" : "text-ivory/35 hover:text-ivory/70"
                    )}
                    aria-pressed={view === v}
                    aria-label={`${label} view`}
                  >
                    {v === "grid" ? <LayoutGrid size={13} strokeWidth={1.5} /> : v === "list" ? <List size={13} strokeWidth={1.5} /> : <span className="text-[0.65rem]">Wall</span>}
                  </button>
                ))}
              </div>
            </div>
          </Container>
        </div>
      </div>

      <Container className="py-8 space-y-8">
        {loading ? (
          <div className={view === "list" ? "space-y-3" : "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"}>
            <SkeletonGrid count={8} view={view === "list" ? "list" : "grid"} />
          </div>
        ) : items.length === 0 ? (
          <div className="py-20 text-center">
            <p className="font-serif text-h3 text-ivory/30">No records found</p>
          </div>
        ) : (
          <>
            {/* Wall view */}
            {showWall && (
              <div className="space-y-3">
                <p className="font-sans text-caption text-ivory/30">
                  Hover a frame to preview · Click to open · Mouse moves camera
                </p>
                <MediaWall items={items} tier={tier} />
              </div>
            )}

            {/* Grid/List view (always shown as fallback below wall) */}
            {(!showWall || view !== "wall") && (
              <div className={view === "list"
                ? "space-y-3"
                : "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
              }>
                {items.map((item, i) => (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: i * 0.04 }}
                    className={view === "list" ? "" : "h-full"}
                  >
                    <MediaCard item={item} view={view === "list" ? "list" : "wall"} />
                  </motion.div>
                ))}
              </div>
            )}

            {/* Audio only rail */}
            {items.some((i) => i.mediaType === "audio") && (
              <div className="pt-4 border-t border-[rgba(244,237,224,0.07)]">
                <p className="eyebrow text-ivory/30 mb-4">Audio recordings</p>
                <div className="flex gap-3 overflow-x-auto pb-2">
                  {items.filter((i) => i.mediaType === "audio").map((item) => (
                    <MediaCard key={item.id} item={item} view="list" />
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </Container>
    </div>
  );
}

export function MediaPageClient() {
  return (
    <Suspense fallback={<div className="min-h-screen pt-24 flex items-center justify-center"><span className="eyebrow text-ivory/30">Loading media archive…</span></div>}>
      <MediaContent />
    </Suspense>
  );
}
