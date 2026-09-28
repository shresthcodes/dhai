"use client";

import React, { useState, useRef, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Bookmark, BookmarkCheck, Plus, Check, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { useCollectionStore, type CollectionItemKind } from "@/store/collection";
import { useToast } from "@/components/ui/Toast";

interface AddToCollectionProps {
  refId:    string;
  title:    string;
  kind?:    CollectionItemKind;
  className?: string;
  size?:    "sm" | "md";
}

export function AddToCollection({
  refId, title, kind = "document", className, size = "sm",
}: AddToCollectionProps) {
  const [open,         setOpen]         = useState(false);
  const [newColName,   setNewColName]   = useState("");
  const [showNewInput, setShowNewInput] = useState(false);
  const { collections, isSaved, addItem, addCollection } = useCollectionStore();
  const { toast } = useToast();
  const panelRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const saved = isSaved(refId);

  // Close on outside click
  useEffect(() => {
    if (!open) return;
    function onDown(e: MouseEvent) {
      if (!panelRef.current?.contains(e.target as Node) &&
          !triggerRef.current?.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, [open]);

  // Close on Esc
  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") { setOpen(false); triggerRef.current?.focus(); }
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open]);

  function handleAdd(colId: string, colName: string) {
    addItem(colId, { kind, refId, title });
    toast(`Added to "${colName}"`, "success");
    setOpen(false);
  }

  function handleCreateAndAdd() {
    if (!newColName.trim()) return;
    const colId = addCollection(newColName.trim());
    handleAdd(colId, newColName.trim());
    setNewColName("");
    setShowNewInput(false);
  }

  const iconSize = size === "sm" ? 13 : 16;

  return (
    <div className="relative inline-flex">
      <button
        ref={triggerRef}
        onClick={() => setOpen((v) => !v)}
        className={cn(
          "flex items-center gap-1 rounded-sharp transition-all duration-200",
          "focus-visible:outline focus-visible:outline-2 focus-visible:outline-gold",
          saved
            ? "text-gold"
            : "text-ivory/40 hover:text-gold",
          size === "sm" ? "p-1.5" : "px-3 py-2 border border-[rgba(244,237,224,0.12)] hover:border-gold/30",
          className
        )}
        aria-label={saved ? "Saved — manage collections" : "Save to collection"}
        aria-expanded={open}
        aria-haspopup="dialog"
      >
        {saved
          ? <BookmarkCheck size={iconSize} strokeWidth={1.5} />
          : <Bookmark      size={iconSize} strokeWidth={1.5} />
        }
        {size === "md" && (
          <span className="font-sans text-xs">{saved ? "Saved" : "Save"}</span>
        )}
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            ref={panelRef}
            role="dialog"
            aria-label="Add to collection"
            aria-modal="true"
            initial={{ opacity: 0, y: -6, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.96 }}
            transition={{ duration: 0.18 }}
            className="absolute right-0 top-full mt-1.5 z-[200] glass rounded-card p-3 w-56 shadow-card"
          >
            <p className="eyebrow text-[0.55rem] text-ivory/40 mb-2">Add to collection</p>
            <div className="space-y-1 max-h-40 overflow-y-auto">
              {collections.map((col) => {
                const already = col.items.some((i) => i.refId === refId);
                return (
                  <button
                    key={col.id}
                    onClick={() => !already && handleAdd(col.id, col.name)}
                    disabled={already}
                    className={cn(
                      "w-full text-left flex items-center justify-between px-2.5 py-1.5 rounded-sharp font-sans text-xs transition-all focus-visible:outline-gold",
                      already
                        ? "text-gold/60 bg-gold/8 cursor-default"
                        : "text-ivory/60 hover:bg-white/5 hover:text-ivory/90"
                    )}
                    aria-label={already ? `Already in ${col.name}` : `Add to ${col.name}`}
                  >
                    <span className="truncate">{col.name}</span>
                    {already && <Check size={10} strokeWidth={2} className="text-gold/60 shrink-0" />}
                  </button>
                );
              })}
            </div>

            <div className="border-t border-[rgba(244,237,224,0.08)] mt-2 pt-2">
              {showNewInput ? (
                <div className="flex gap-1.5">
                  <input
                    autoFocus
                    value={newColName}
                    onChange={(e) => setNewColName(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleCreateAndAdd()}
                    placeholder="Collection name…"
                    className="flex-1 bg-panel border border-[rgba(244,237,224,0.12)] rounded-sharp px-2 py-1 font-sans text-xs text-ivory/70 outline-none focus:border-gold/40"
                    aria-label="New collection name"
                  />
                  <button
                    onClick={handleCreateAndAdd}
                    disabled={!newColName.trim()}
                    className="px-2 py-1 bg-gold/80 text-ink rounded-sharp font-sans text-xs disabled:opacity-40 hover:bg-gold transition-colors focus-visible:outline-gold"
                  >
                    Add
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setShowNewInput(true)}
                  className="flex items-center gap-1.5 w-full text-left px-2 py-1.5 font-sans text-xs text-ivory/40 hover:text-gold transition-colors focus-visible:outline-gold rounded-sharp"
                >
                  <Plus size={11} strokeWidth={1.5} />New collection
                </button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
