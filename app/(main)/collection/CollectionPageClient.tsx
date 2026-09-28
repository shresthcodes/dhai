"use client";

import React, { useState, Suspense } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus, Trash2, Edit3, Copy, Download, Share2, Upload,
  ChevronUp, ChevronDown, CheckSquare, Square,
  FileText, FileJson, FileType, Search, BookOpen,
} from "lucide-react";
import { Container } from "@/components/ui/Container";
import { DemoBadge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { GoldRule } from "@/components/ui/GoldRule";
import { ScrollReveal } from "@/components/ui/ScrollReveal";
import { useCollectionStore, type Collection, type CollectionItem } from "@/store/collection";
import { useToast } from "@/components/ui/Toast";
import { ArchiveCard } from "@/components/archive/ArchiveCard";
import { loadArchive } from "@/data/archiveService";
import { cn } from "@/lib/utils";
import {
  exportMarkdown, exportJSON, exportCitations,
  downloadFile, encodeShareLink, decodeShareLink,
} from "@/lib/collectionExport";
import Link from "next/link";

const KIND_LABELS: Record<string, string> = {
  document: "Document", media: "Media", clip: "Clip",
  "timeline-event": "Timeline", "story-chapter": "Chapter",
  "ai-answer": "AI Answer", note: "Note",
};

function ItemCard({
  item, collectionId, selected, onSelect, onRemove, onMoveUp, onMoveDown, onNoteChange,
}: {
  item:           CollectionItem;
  collectionId:   string;
  selected:       boolean;
  onSelect:       () => void;
  onRemove:       () => void;
  onMoveUp:       () => void;
  onMoveDown:     () => void;
  onNoteChange:   (note: string) => void;
}) {
  const [editingNote, setEditingNote] = useState(false);
  const [noteVal,     setNoteVal]     = useState(item.note ?? "");
  const allDocs = loadArchive();
  const archiveItem = allDocs.find((d) => d.id === item.refId);

  function saveNote() {
    onNoteChange(noteVal);
    setEditingNote(false);
  }

  return (
    <div className={cn(
      "surface rounded-card p-4 space-y-3 border transition-all",
      selected ? "border-gold/40 bg-gold/4" : "border-[rgba(244,237,224,0.08)] hover:border-gold/15"
    )}>
      <div className="flex items-start gap-3">
        {/* Select checkbox */}
        <button onClick={onSelect} className="mt-0.5 text-ivory/35 hover:text-gold transition-colors focus-visible:outline-gold shrink-0" aria-label={selected ? "Deselect" : "Select"}>
          {selected ? <CheckSquare size={15} strokeWidth={1.5} className="text-gold" /> : <Square size={15} strokeWidth={1.5} />}
        </button>

        <div className="flex-1 min-w-0 space-y-1.5">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="eyebrow text-[0.55rem] text-gold/60 border border-gold/20 px-1.5 py-0.5 rounded-sharp">
              {KIND_LABELS[item.kind] ?? item.kind}
            </span>
            <DemoBadge />
          </div>
          <p className="font-serif text-[0.95rem] text-ivory/80 leading-snug">{item.title}</p>
          <p className="font-sans text-[0.65rem] text-ivory/25">Added {new Date(item.addedAt).toLocaleDateString()}</p>

          {/* Note */}
          {editingNote ? (
            <div className="flex gap-2">
              <textarea
                autoFocus value={noteVal}
                onChange={(e) => setNoteVal(e.target.value)}
                onBlur={saveNote}
                rows={2}
                className="flex-1 bg-panel border border-gold/30 rounded-sharp px-2.5 py-1.5 font-sans text-xs text-ivory/70 outline-none resize-none"
                aria-label="Edit note"
              />
            </div>
          ) : item.note ? (
            <p className="font-sans text-[0.75rem] text-ivory/50 italic border-l-2 border-gold/20 pl-2">{item.note}</p>
          ) : null}
        </div>

        {/* Actions */}
        <div className="flex flex-col gap-1 shrink-0">
          <button onClick={onMoveUp} className="p-1 text-ivory/25 hover:text-ivory/60 transition-colors focus-visible:outline-gold" aria-label="Move up"><ChevronUp size={12} strokeWidth={1.5} /></button>
          <button onClick={onMoveDown} className="p-1 text-ivory/25 hover:text-ivory/60 transition-colors focus-visible:outline-gold" aria-label="Move down"><ChevronDown size={12} strokeWidth={1.5} /></button>
        </div>
      </div>

      <div className="flex gap-2 flex-wrap">
        {item.refId && (
          <Link href={item.kind === "media" ? `/media/${item.refId}` : `/document/${item.refId}`}
            className="font-sans text-xs text-gold/60 hover:text-gold transition-colors focus-visible:outline-gold"
          >Open →</Link>
        )}
        <button onClick={() => setEditingNote((v) => !v)}
          className="font-sans text-xs text-ivory/35 hover:text-ivory/60 transition-colors focus-visible:outline-gold flex items-center gap-1"
        >
          <Edit3 size={10} strokeWidth={1.5} />{item.note ? "Edit note" : "Add note"}
        </button>
        <button onClick={onRemove}
          className="font-sans text-xs text-terracotta/50 hover:text-terracotta/80 transition-colors focus-visible:outline-gold flex items-center gap-1 ml-auto"
          aria-label="Remove from collection"
        >
          <Trash2 size={10} strokeWidth={1.5} />Remove
        </button>
      </div>
    </div>
  );
}

function CollectionView({ col }: { col: Collection }) {
  const [activeKind,   setActiveKind]   = useState<string>("all");
  const [selected,     setSelected]     = useState<Set<string>>(new Set());
  const [searchQ,      setSearchQ]      = useState("");
  const { removeItem, reorderItem, updateNote, bulkRemove } = useCollectionStore();
  const { toast } = useToast();

  const kinds = Array.from(new Set(col.items.map((i) => i.kind)));
  const tabs  = ["all", ...kinds];

  const filtered = col.items
    .filter((i) => activeKind === "all" || i.kind === activeKind)
    .filter((i) => !searchQ || i.title.toLowerCase().includes(searchQ.toLowerCase()))
    .sort((a, b) => a.order - b.order);

  // Counts summary
  const countsByKind = col.items.reduce<Record<string, number>>((acc, i) => {
    acc[i.kind] = (acc[i.kind] ?? 0) + 1;
    return acc;
  }, {});

  const summary = Object.entries(countsByKind)
    .map(([k, n]) => `${n} ${KIND_LABELS[k] ?? k}${n !== 1 ? "s" : ""}`)
    .join(" · ");

  function toggleSelect(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }

  function handleBulkRemove() {
    bulkRemove(col.id, Array.from(selected));
    toast(`Removed ${selected.size} items`, "info");
    setSelected(new Set());
  }

  return (
    <div className="flex-1 min-w-0 space-y-5">
      {/* Summary */}
      <div className="space-y-1">
        <p className="font-sans text-caption text-ivory/40">{summary || "Empty collection"}</p>
      </div>

      {/* Kind tabs + search */}
      <div className="flex items-center gap-3 flex-wrap">
        <div className="flex overflow-x-auto" role="tablist">
          {tabs.map((k) => (
            <button key={k} role="tab" aria-selected={activeKind === k} onClick={() => setActiveKind(k)}
              className={cn("px-3 py-2 font-sans text-xs font-medium capitalize transition-colors focus-visible:outline-gold",
                activeKind === k ? "text-gold border-b-2 border-gold" : "text-ivory/40 hover:text-ivory/70"
              )}>
              {k === "all" ? "All" : KIND_LABELS[k] ?? k}
              <span className="ml-1 text-[0.6rem] text-ivory/25">
                {k === "all" ? col.items.length : (countsByKind[k] ?? 0)}
              </span>
            </button>
          ))}
        </div>
        <div className="flex-1 flex items-center gap-1.5 bg-panel border border-[rgba(244,237,224,0.1)] rounded-sharp px-2.5 py-1.5 min-w-[160px]">
          <Search size={11} strokeWidth={1.5} className="text-ivory/25 shrink-0" />
          <input
            type="search" value={searchQ} onChange={(e) => setSearchQ(e.target.value)}
            placeholder="Search collection…"
            className="flex-1 bg-transparent font-sans text-xs text-ivory/60 outline-none placeholder:text-ivory/20"
            aria-label="Search within collection"
          />
        </div>
      </div>

      {/* Bulk actions */}
      {selected.size > 0 && (
        <div className="flex items-center gap-3 px-3 py-2 glass rounded-card">
          <span className="font-sans text-xs text-ivory/50">{selected.size} selected</span>
          <button onClick={handleBulkRemove}
            className="font-sans text-xs text-terracotta/70 hover:text-terracotta flex items-center gap-1 focus-visible:outline-gold"
          >
            <Trash2 size={11} strokeWidth={1.5} />Remove
          </button>
          <button onClick={() => setSelected(new Set())}
            className="font-sans text-xs text-ivory/35 hover:text-ivory/60 focus-visible:outline-gold ml-auto"
          >Clear</button>
        </div>
      )}

      {/* Items */}
      {filtered.length === 0 ? (
        <div className="py-16 text-center space-y-4">
          <BookOpen size={28} strokeWidth={1} className="text-ivory/15 mx-auto" />
          <p className="font-serif text-h3 text-ivory/30">No items here yet</p>
          <p className="font-sans text-caption text-ivory/20">
            Save items from Archive, Search, Documents, Media, Timeline, or Ask the Archive.
          </p>
          <div className="flex flex-wrap gap-2 justify-center">
            {["/archive", "/search", "/ask"].map((href) => (
              <Button key={href} variant="ghost" size="sm" href={href}>
                {href.replace("/", "").replace("-", " ").replace(/^\w/, c => c.toUpperCase())} →
              </Button>
            ))}
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((item) => (
            <ItemCard
              key={item.id}
              item={item}
              collectionId={col.id}
              selected={selected.has(item.id)}
              onSelect={() => toggleSelect(item.id)}
              onRemove={() => {
                removeItem(col.id, item.id);
                toast("Removed from collection", "info");
              }}
              onMoveUp={() => reorderItem(col.id, item.id, "up")}
              onMoveDown={() => reorderItem(col.id, item.id, "down")}
              onNoteChange={(note) => updateNote(col.id, item.id, note)}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function CollectionPageContent() {
  const {
    collections, addCollection, removeCollection,
    renameCollection, duplicateCollection,
  } = useCollectionStore();
  const { toast } = useToast();

  const [activeColId,  setActiveColId]  = useState(() => collections[0]?.id ?? "");
  const [newColName,   setNewColName]   = useState("");
  const [addingCol,    setAddingCol]    = useState(false);
  const [renamingId,   setRenamingId]   = useState<string | null>(null);
  const [renameVal,    setRenameVal]    = useState("");

  const activeCol = collections.find((c) => c.id === activeColId) ?? collections[0];

  function handleAddCol() {
    if (!newColName.trim()) return;
    const id = addCollection(newColName.trim());
    setActiveColId(id);
    setNewColName("");
    setAddingCol(false);
    toast(`Collection "${newColName.trim()}" created`, "success");
  }

  function handleExport(format: "md" | "json" | "citations") {
    if (!activeCol) return;
    if (format === "md")        downloadFile(exportMarkdown(activeCol),  `${activeCol.name}.md`,   "text/markdown");
    if (format === "json")      downloadFile(exportJSON(activeCol),       `${activeCol.name}.json`, "application/json");
    if (format === "citations") downloadFile(exportCitations(activeCol),  `${activeCol.name}-citations.txt`, "text/plain");
  }

  async function handleShare() {
    if (!activeCol) return;
    const { url, error } = encodeShareLink(activeCol);
    if (error) { toast(error, "error"); return; }
    try { await navigator.share({ title: activeCol.name, url }); }
    catch { await navigator.clipboard.writeText(url); toast("Share link copied — link contains collection data, no server used (prototype)", "success"); }
  }

  function handleImportJSON(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const data = JSON.parse(ev.target?.result as string);
        const id = addCollection(data.name ?? "Imported Collection");
        toast("Collection imported successfully", "success");
        setActiveColId(id);
      } catch { toast("Invalid JSON file", "error"); }
    };
    reader.readAsText(file);
  }

  return (
    <div className="min-h-screen pt-[4.5rem]">
      <div className="bg-night border-b border-[rgba(244,237,224,0.07)]">
        <Container className="py-8">
          <ScrollReveal>
            <div className="flex flex-wrap items-end justify-between gap-4">
              <div className="space-y-2">
                <p className="eyebrow text-gold/70">My Collection</p>
                <h1 className="font-serif text-h1 text-ivory">Research Collections</h1>
                <GoldRule />
                <p className="font-sans text-caption text-ivory/40 mt-1">
                  Stored on this device only (prototype).
                </p>
              </div>
              <div className="flex items-center gap-2 flex-wrap">
                <DemoBadge />
                {/* Export / Share */}
                <Button variant="secondary" size="sm" onClick={() => handleExport("md")}>
                  <FileText size={12} strokeWidth={1.5} className="mr-1" />Markdown
                </Button>
                <Button variant="secondary" size="sm" onClick={() => handleExport("json")}>
                  <FileJson size={12} strokeWidth={1.5} className="mr-1" />JSON
                </Button>
                <Button variant="secondary" size="sm" onClick={() => handleExport("citations")}>
                  <FileType size={12} strokeWidth={1.5} className="mr-1" />Citations
                </Button>
                <Button variant="ghost" size="sm" onClick={handleShare}>
                  <Share2 size={12} strokeWidth={1.5} className="mr-1" />Share link
                </Button>
                <label className="cursor-pointer">
                  <Button variant="ghost" size="sm" onClick={() => {}}>
                    <Upload size={12} strokeWidth={1.5} className="mr-1" />Import JSON
                  </Button>
                  <input type="file" accept=".json" onChange={handleImportJSON} className="sr-only" aria-label="Import JSON collection" />
                </label>
              </div>
            </div>
          </ScrollReveal>
        </Container>
      </div>

      <Container className="py-8 flex gap-7">
        {/* Left rail — collection list */}
        <aside className="w-52 shrink-0 space-y-2" aria-label="Collections">
          <p className="eyebrow text-ivory/35 mb-3">Collections</p>
          {collections.map((col) => (
            <div key={col.id} className="group">
              {renamingId === col.id ? (
                <div className="flex gap-1">
                  <input autoFocus value={renameVal} onChange={(e) => setRenameVal(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") { renameCollection(col.id, renameVal); setRenamingId(null); }
                      if (e.key === "Escape") setRenamingId(null);
                    }}
                    className="flex-1 bg-panel border border-gold/30 rounded-sharp px-2 py-1 font-sans text-xs text-ivory/70 outline-none"
                    aria-label="Rename collection"
                  />
                </div>
              ) : (
                <button onClick={() => setActiveColId(col.id)}
                  className={cn(
                    "w-full text-left px-3 py-2 rounded-card font-sans text-sm transition-all focus-visible:outline-gold",
                    activeColId === col.id ? "bg-gold/10 text-ivory border border-gold/20" : "text-ivory/50 hover:bg-white/5"
                  )}>
                  <span className="block truncate">{col.name}</span>
                  <span className="font-sans text-[0.62rem] text-ivory/25">{col.items.length} items</span>
                </button>
              )}
              {/* Collection actions */}
              <div className="flex gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity mt-0.5 px-1">
                <button onClick={() => { setRenamingId(col.id); setRenameVal(col.name); }}
                  className="p-1 text-ivory/25 hover:text-gold transition-colors focus-visible:outline-gold rounded-sharp" aria-label="Rename">
                  <Edit3 size={10} strokeWidth={1.5} />
                </button>
                <button onClick={() => duplicateCollection(col.id)}
                  className="p-1 text-ivory/25 hover:text-gold transition-colors focus-visible:outline-gold rounded-sharp" aria-label="Duplicate">
                  <Copy size={10} strokeWidth={1.5} />
                </button>
                {collections.length > 1 && (
                  <button onClick={() => {
                    removeCollection(col.id);
                    setActiveColId(collections.find((c) => c.id !== col.id)?.id ?? "");
                    toast("Collection deleted", "info");
                  }}
                    className="p-1 text-ivory/25 hover:text-terracotta/70 transition-colors focus-visible:outline-gold rounded-sharp" aria-label="Delete collection">
                    <Trash2 size={10} strokeWidth={1.5} />
                  </button>
                )}
              </div>
            </div>
          ))}

          {/* New collection */}
          {addingCol ? (
            <div className="flex gap-1.5">
              <input autoFocus value={newColName} onChange={(e) => setNewColName(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter") handleAddCol(); if (e.key === "Escape") setAddingCol(false); }}
                placeholder="Collection name…"
                className="flex-1 bg-panel border border-gold/30 rounded-sharp px-2 py-1.5 font-sans text-xs text-ivory/70 outline-none focus:border-gold/50"
                aria-label="New collection name"
              />
              <button onClick={handleAddCol}
                className="px-2 py-1 bg-gold/80 text-ink rounded-sharp font-sans text-xs hover:bg-gold focus-visible:outline-gold">
                Add
              </button>
            </div>
          ) : (
            <button onClick={() => setAddingCol(true)}
              className="flex items-center gap-1.5 font-sans text-xs text-ivory/35 hover:text-gold transition-colors focus-visible:outline-gold rounded-sharp"
            >
              <Plus size={12} strokeWidth={1.5} />New collection
            </button>
          )}
        </aside>

        {/* Main collection content */}
        {activeCol ? (
          <CollectionView col={activeCol} />
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <p className="font-sans text-sm text-ivory/30">Select or create a collection</p>
          </div>
        )}
      </Container>
    </div>
  );
}

export function CollectionPageClient() {
  return (
    <Suspense fallback={<div className="min-h-screen pt-24 flex items-center justify-center"><span className="eyebrow text-ivory/30">Loading collection…</span></div>}>
      <CollectionPageContent />
    </Suspense>
  );
}
