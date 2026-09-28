"use client";

import React, { useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";
import { GoldRule } from "./GoldRule";
import { Kbd } from "./Tooltip";

const SHORTCUTS = [
  { section: "Navigation" },
  { key: "/",          desc: "Focus search bar" },
  { key: "Alt+A",      desc: "Toggle accessibility panel" },
  { key: "?",          desc: "Show/hide this cheat-sheet" },
  { section: "Archive / Search" },
  { key: "Enter",      desc: "Open focused item" },
  { key: "Esc",        desc: "Close panel or cancel" },
  { section: "Media Player" },
  { key: "Space",      desc: "Play / Pause" },
  { key: "J / ←",     desc: "Back 10 seconds" },
  { key: "L / →",     desc: "Forward 10 seconds" },
  { key: "F",          desc: "Fullscreen" },
  { key: "M",          desc: "Mute" },
  { section: "Timeline" },
  { key: "← / →",     desc: "Previous / next event" },
  { key: "1 – 5",      desc: "Jump to chapter" },
  { key: "Esc",        desc: "Stop auto-play" },
  { section: "Story Mode" },
  { key: "↓ / ↑",     desc: "Next / previous chapter" },
  { key: "1 – 5",      desc: "Jump to chapter" },
  { key: "Esc",        desc: "Stop guided narration" },
  { section: "Ask the Archive" },
  { key: "Enter",      desc: "Send question" },
  { key: "Shift+Enter",desc: "New line in input" },
  { key: "Esc",        desc: "Cancel processing" },
] as const;

interface ShortcutsSheetProps {
  open:    boolean;
  onClose: () => void;
}

export function ShortcutsSheet({ open, onClose }: ShortcutsSheetProps) {
  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[200] bg-black/50"
            onClick={onClose}
            aria-hidden="true"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-[201]
                       glass rounded-card p-6 w-[480px] max-w-[92vw] max-h-[80vh] overflow-y-auto shadow-card"
            role="dialog"
            aria-label="Keyboard shortcuts"
            aria-modal="true"
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-sans text-sm font-semibold text-ivory">Keyboard Shortcuts</h2>
              <button onClick={onClose}
                className="text-ivory/40 hover:text-ivory p-1 rounded transition-colors focus-visible:outline-gold"
                aria-label="Close"
              >
                <X size={15} strokeWidth={1.5} />
              </button>
            </div>
            <GoldRule width="full" />
            <div className="mt-4 space-y-1">
              {SHORTCUTS.map((item, i) => {
                if ("section" in item) {
                  return (
                    <p key={i} className="eyebrow text-[0.55rem] text-ivory/30 pt-3 pb-1 first:pt-0">
                      {item.section}
                    </p>
                  );
                }
                return (
                  <div key={i} className="flex items-center justify-between py-1">
                    <Kbd>{item.key}</Kbd>
                    <span className="font-sans text-xs text-ivory/55">{item.desc}</span>
                  </div>
                );
              })}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
