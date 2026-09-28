"use client";
import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { RotateCcw, X } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { useCollectionStore } from "@/store/collection";
import { useAdminStore }      from "@/store/admin/adminStore";
import { useKioskStore }      from "@/store/kiosk";

export function DemoToolbar() {
  const [open,      setOpen]      = useState(false);
  const [forceDemo, setForceDemo] = useState(false);
  const { clearAll }             = useCollectionStore();
  const { reset: resetAdmin }    = useAdminStore();
  const { reset: resetKiosk }    = useKioskStore();

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.shiftKey && e.key === "D") setOpen((v) => !v);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  function handleReset() {
    clearAll();
    resetAdmin();
    resetKiosk();
    if (typeof window !== "undefined") {
      localStorage.removeItem("dhai-collection-v2");
      localStorage.removeItem("dhai-admin-v1");
    }
    window.location.reload();
  }

  if (!open) return null;

  return (
    <motion.div
      initial={{ y: 60, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      exit={{ y: 60, opacity: 0 }}
      className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[300] glass rounded-card px-5 py-3 flex items-center gap-4 shadow-card border border-gold/20"
    >
      <span className="eyebrow text-[0.55rem] text-gold/60">Demo toolbar · Shift+D</span>
      <Button variant="ghost" size="sm" onClick={handleReset}>
        <RotateCcw size={12} strokeWidth={1.5} className="mr-1" />Reset
      </Button>
      <button onClick={() => setForceDemo((v) => !v)}
        className={`font-sans text-xs px-3 py-1.5 rounded-sharp border transition-all ${forceDemo ? "bg-terracotta/15 text-terracotta/80 border-terracotta/30" : "text-ivory/35 border-[rgba(244,237,224,0.1)]"}`}>
        {forceDemo ? "DEMO forced" : "Force demo"}
      </button>
      <button onClick={() => setOpen(false)} className="text-ivory/30 hover:text-ivory/70 p-1 focus-visible:outline-gold"><X size={13} /></button>
    </motion.div>
  );
}
