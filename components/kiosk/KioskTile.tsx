"use client";
import React from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface KioskTileProps {
  icon:     React.ReactNode;
  label:    string;
  sublabel?: string;
  accent?:  string;
  onClick:  () => void;
  className?: string;
}

export function KioskTile({ icon, label, sublabel, accent = "#C9A24B", onClick, className }: KioskTileProps) {
  return (
    <motion.button
      whileTap={{ scale: 0.96 }}
      transition={{ duration: 0.08 }}
      onClick={onClick}
      className={cn(
        "flex flex-col items-center justify-center gap-4 p-8",
        "rounded-[24px] border-2 border-[rgba(244,237,224,0.12)]",
        "bg-[rgba(22,27,38,0.85)] hover:border-[rgba(244,237,224,0.25)]",
        "active:bg-[rgba(22,27,38,0.95)] transition-all duration-100",
        "min-h-[180px] select-none touch-manipulation",
        "focus-visible:outline focus-visible:outline-4 focus-visible:outline-gold focus-visible:outline-offset-2",
        className
      )}
      style={{ boxShadow: `0 4px 32px rgba(0,0,0,0.5), 0 1px 0 ${accent}22 inset` }}
      aria-label={label}
    >
      <div className="text-[2.5rem]" style={{ color: accent }} aria-hidden="true">{icon}</div>
      <p className="font-serif text-[1.5rem] text-ivory leading-tight text-center">{label}</p>
      {sublabel && <p className="font-sans text-[0.875rem] text-ivory/40 text-center">{sublabel}</p>}
    </motion.button>
  );
}
