"use client";
import React, { useState, Suspense } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, ArrowRight, Video, Play } from "lucide-react";
import { KioskButton } from "@/components/kiosk/KioskButton";
import { DemoBadge } from "@/components/ui/Badge";
import { useKioskStore } from "@/store/kiosk";
import { loadMediaItems } from "@/data/mediaService";
import type { RichMediaItem } from "@/data/mediaModels";
import { t } from "@/lib/i18n";
import type { Language } from "@/data/models";

const KIND_LABEL: Record<string, string> = {
  speech:      "Speech",
  lecture:     "Lecture",
  documentary: "Documentary",
  interview:   "Interview",
  audio:       "Audio",
};
const KIND_ACCENT: Record<string, string> = {
  speech:      "#C9A24B",
  lecture:     "#4C7FB8",
  documentary: "#B5573A",
  interview:   "#E3C77A",
  audio:       "#C9A24B",
};

const PAGE_SIZE = 6;

function MediaDetail({ item, onClose }: { item: RichMediaItem; onClose: () => void }) {
  const accent = KIND_ACCENT[item.kind] ?? "#C9A24B";
  return (
    <motion.div
      initial={{ x: "100%" }}
      animate={{ x: 0 }}
      exit={{ x: "100%" }}
      transition={{ type: "spring", damping: 32, stiffness: 280 }}
      className="absolute inset-0 bg-ink flex flex-col z-20"
    >
      <div className="flex items-center gap-4 px-6 py-5 border-b border-[rgba(244,237,224,0.1)] shrink-0">
        <KioskButton variant="secondary" size="lg" onClick={onClose}>
          <ArrowLeft size={22} strokeWidth={1.5} />
        </KioskButton>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="font-sans text-sm border px-3 py-1 rounded-[10px] capitalize"
              style={{ color: accent, borderColor: `${accent}40` }}>
              {KIND_LABEL[item.kind] ?? item.kind}
            </span>
            <DemoBadge />
          </div>
          <h2 className="font-serif text-[1.75rem] text-ivory leading-tight truncate">{item.title}</h2>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-8 py-6 space-y-6">
        {/* Thumbnail placeholder */}
        <div className="w-full aspect-video rounded-[20px] bg-panel border-2 border-[rgba(244,237,224,0.08)] flex items-center justify-center">
          <div className="text-center space-y-3">
            <Play size={56} strokeWidth={1} style={{ color: accent }} className="mx-auto" />
            <p className="font-sans text-base text-ivory/30">Media playback not available in kiosk prototype</p>
          </div>
        </div>

        {/* Details */}
        <div className="grid grid-cols-2 gap-4">
          {[
            { label: "Duration",   value: item.durationSec ? `${Math.floor(item.durationSec / 60)}m ${item.durationSec % 60}s` : "—" },
            { label: "Language",   value: item.language?.toUpperCase() ?? "—" },
            { label: "Collection", value: item.collection ?? "—" },
            { label: "Source",     value: item.source ?? "—" },
          ].map(({ label, value }) => (
            <div key={label} className="bg-panel rounded-[16px] p-5 border border-[rgba(244,237,224,0.08)]">
              <p className="font-sans text-sm text-ivory/35 mb-1">{label}</p>
              <p className="font-sans text-[1.1rem] text-ivory/80">{value}</p>
            </div>
          ))}
        </div>

        {/* Summary */}
        <div>
          <p className="eyebrow text-[0.75rem] tracking-[0.2em] text-ivory/40 mb-2">Summary</p>
          <p className="font-sans text-[1.25rem] text-ivory/65 leading-relaxed">{item.summary}</p>
        </div>

        {/* Keywords */}
        {item.keywords?.length > 0 && (
          <div className="flex flex-wrap gap-3">
            {item.keywords.map((kw) => (
              <span key={kw} className="font-sans text-base text-ivory/45 border border-[rgba(244,237,224,0.1)] px-4 py-2 rounded-[12px]">
                {kw}
              </span>
            ))}
          </div>
        )}

        <p className="font-sans text-sm text-ivory/25 italic">
          Demo data. Media playback requires verified source content.
        </p>
      </div>
    </motion.div>
  );
}

function WatchContent() {
  const router = useRouter();
  const { language, addItem } = useKioskStore();
  const lang = (language as Language) ?? "en";
  const tr   = (k: string) => t(k, lang);

  const allItems  = loadMediaItems();
  const [filter,   setFilter]   = useState("all");
  const [page,     setPage]     = useState(0);
  const [selected, setSelected] = useState<RichMediaItem | null>(null);

  const kinds = Array.from(new Set(allItems.map((i) => i.kind)));

  const filtered   = filter === "all" ? allItems : allItems.filter((i) => i.kind === filter);
  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const pageItems  = filtered.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);

  function open(item: RichMediaItem) {
    setSelected(item);
    addItem({ id: item.id, title: item.title, kind: item.kind, path: `/kiosk/watch?id=${item.id}` });
  }

  return (
    <div className="fixed inset-0 bg-ink flex flex-col">
      {/* Header */}
      <div className="flex items-center gap-4 px-6 py-4 bg-night border-b border-[rgba(244,237,224,0.1)] shrink-0">
        <KioskButton variant="secondary" size="lg" onClick={() => router.push("/kiosk")}>
          <ArrowLeft size={22} strokeWidth={1.5} />
        </KioskButton>
        <Video size={26} strokeWidth={1.5} className="text-gold/60" />
        <h1 className="font-serif text-[1.75rem] text-ivory flex-1">{tr("kiosk.watch")}</h1>
        <span className="font-sans text-sm text-ivory/30">{filtered.length} records</span>
        <DemoBadge />
      </div>

      {/* Kind filter */}
      <div className="flex gap-3 px-6 py-4 overflow-x-auto scrollbar-none shrink-0 border-b border-[rgba(244,237,224,0.06)]">
        <button onClick={() => { setFilter("all"); setPage(0); }}
          className={`shrink-0 font-sans text-lg px-6 py-3 rounded-[14px] border-2 transition-all min-h-[60px] focus-visible:outline-gold ${
            filter === "all" ? "bg-gold/15 border-gold/40 text-gold" : "border-[rgba(244,237,224,0.12)] text-ivory/50 hover:border-gold/25"
          }`}>
          All ({allItems.length})
        </button>
        {kinds.map((k) => {
          const count = allItems.filter((i) => i.kind === k).length;
          return (
            <button key={k} onClick={() => { setFilter(k); setPage(0); }}
              className={`shrink-0 font-sans text-lg px-6 py-3 rounded-[14px] border-2 transition-all min-h-[60px] focus-visible:outline-gold capitalize ${
                filter === k ? "bg-gold/15 border-gold/40 text-gold" : "border-[rgba(244,237,224,0.12)] text-ivory/50 hover:border-gold/25"
              }`}>
              {KIND_LABEL[k] ?? k} ({count})
            </button>
          );
        })}
      </div>

      {/* Grid */}
      <div className="flex-1 overflow-y-auto px-6 py-4">
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          {pageItems.map((item) => {
            const accent = KIND_ACCENT[item.kind] ?? "#C9A24B";
            return (
              <motion.button key={item.id} whileTap={{ scale: 0.97 }}
                onClick={() => open(item)}
                className="flex flex-col text-left p-5 rounded-[20px] border-2 border-[rgba(244,237,224,0.1)] bg-panel hover:border-gold/25 transition-all min-h-[180px] gap-3 focus-visible:outline focus-visible:outline-4 focus-visible:outline-gold">
                {/* Thumbnail placeholder */}
                <div className="w-full h-24 rounded-[12px] bg-black/30 flex items-center justify-center shrink-0">
                  <Play size={28} strokeWidth={1.5} style={{ color: accent }} />
                </div>
                <div className="flex-1 space-y-1">
                  <span className="font-sans text-sm capitalize" style={{ color: accent }}>
                    {KIND_LABEL[item.kind] ?? item.kind}
                  </span>
                  <p className="font-serif text-[1.15rem] text-ivory leading-snug">{item.title}</p>
                  <p className="font-sans text-sm text-ivory/40 line-clamp-2">{item.summary}</p>
                </div>
              </motion.button>
            );
          })}
        </div>
        {pageItems.length === 0 && (
          <p className="font-sans text-lg text-ivory/30 text-center py-16">{tr("common.noResults")}</p>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-6 py-4 border-t border-[rgba(244,237,224,0.08)] shrink-0">
          <KioskButton variant="secondary" size="xl"
            onClick={() => setPage((p) => Math.max(0, p - 1))} disabled={page === 0}>
            <ArrowLeft size={24} strokeWidth={1.5} />{tr("kiosk.prevPage")}
          </KioskButton>
          <span className="font-sans text-lg text-ivory/50">{page + 1} / {totalPages}</span>
          <KioskButton variant="secondary" size="xl"
            onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))} disabled={page >= totalPages - 1}>
            {tr("kiosk.nextPage")}<ArrowRight size={24} strokeWidth={1.5} />
          </KioskButton>
        </div>
      )}

      {/* Detail panel */}
      <AnimatePresence>
        {selected && (
          <MediaDetail key={selected.id} item={selected} onClose={() => setSelected(null)} />
        )}
      </AnimatePresence>
    </div>
  );
}

export default function KioskWatchPage() {
  return (
    <Suspense fallback={
      <div className="fixed inset-0 bg-ink flex items-center justify-center">
        <p className="font-sans text-ivory/30 text-xl">Loading…</p>
      </div>
    }>
      <WatchContent />
    </Suspense>
  );
}
