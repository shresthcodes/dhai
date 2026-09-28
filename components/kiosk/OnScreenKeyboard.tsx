"use client";
import React, { useState, useCallback } from "react";
import { Delete, CornerDownLeft, ChevronUp } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Language } from "@/data/models";

/* ─── Layouts ───────────────────────────────────────────────────── */
const EN_ROWS = [
  ["q","w","e","r","t","y","u","i","o","p"],
  ["a","s","d","f","g","h","j","k","l"],
  ["SHIFT","z","x","c","v","b","n","m","BACKSPACE"],
  ["NUMBERS","SPACE","SEARCH"],
];
const EN_ROWS_SHIFT = [
  ["Q","W","E","R","T","Y","U","I","O","P"],
  ["A","S","D","F","G","H","J","K","L"],
  ["SHIFT","Z","X","C","V","B","N","M","BACKSPACE"],
  ["NUMBERS","SPACE","SEARCH"],
];
const NUM_ROWS = [
  ["1","2","3","4","5","6","7","8","9","0"],
  ["!","@","#","$","%","^","&","*","(",")"],
  ["ALPHA","?",".",",","!","-","_","BACKSPACE"],
  ["SPACE","SEARCH"],
];
// Hindi InScript-inspired (simplified, key Unicode codepoints)
const HI_ROWS = [
  ["ौ","ै","ा","ी","ू","ब","ह","ग","द","ज"],
  ["ो","े","्","ि","ु","प","र","क","त","च"],
  ["SHIFT","ं","म","न","व","ल","स",",","BACKSPACE"],
  ["SPACE","।","SEARCH"],
];
const HI_ROWS_SHIFT = [
  ["औ","ऐ","आ","ई","ऊ","भ","ङ","घ","ध","झ"],
  ["ओ","ए","अ","इ","उ","फ","ड़","ख","थ","छ"],
  ["SHIFT","अं","ण","ञ","ळ","श","ष","।","BACKSPACE"],
  ["SPACE","।","SEARCH"],
];
const GU_ROWS = [
  ["ૌ","ૈ","ા","ી","ૂ","બ","હ","ગ","દ","જ"],
  ["ો","ે","્","િ","ુ","પ","ર","ક","ત","ચ"],
  ["SHIFT","ં","મ","ન","વ","લ","સ",",","BACKSPACE"],
  ["SPACE","।","SEARCH"],
];
const GU_ROWS_SHIFT = [
  ["ઔ","ઐ","આ","ઈ","ઊ","ભ","ઙ","ઘ","ધ","ઝ"],
  ["ઓ","એ","અ","ઇ","ઉ","ફ","ડ","ખ","થ","છ"],
  ["SHIFT","ઁ","ણ","ઞ","ળ","શ","ષ","।","BACKSPACE"],
  ["SPACE","।","SEARCH"],
];

type Layout = "en" | "hi" | "gu" | "num";

interface OnScreenKeyboardProps {
  value:     string;
  onChange:  (v: string) => void;
  onSearch:  () => void;
  language:  Language;
  className?: string;
}

export function OnScreenKeyboard({
  value, onChange, onSearch, language, className,
}: OnScreenKeyboardProps) {
  const [layout, setLayout]     = useState<Layout>(language === "hi" ? "hi" : language === "gu" ? "gu" : "en");
  const [shifted, setShifted]   = useState(false);
  const [holding, setHolding]   = useState<ReturnType<typeof setInterval> | null>(null);

  const rows = layout === "num" ? NUM_ROWS
    : layout === "hi"  ? (shifted ? HI_ROWS_SHIFT  : HI_ROWS)
    : layout === "gu"  ? (shifted ? GU_ROWS_SHIFT  : GU_ROWS)
    : shifted ? EN_ROWS_SHIFT : EN_ROWS;

  const press = useCallback((key: string) => {
    if (key === "BACKSPACE")  { onChange(value.slice(0, -1)); return; }
    if (key === "SPACE")      { onChange(value + " "); return; }
    if (key === "SEARCH")     { onSearch(); return; }
    if (key === "SHIFT")      { setShifted((v) => !v); return; }
    if (key === "NUMBERS")    { setLayout("num"); return; }
    if (key === "ALPHA")      { setLayout(language === "hi" ? "hi" : language === "gu" ? "gu" : "en"); return; }
    if (key === "।")          { onChange(value + "।"); return; }
    onChange(value + key);
    if (shifted && layout !== "hi" && layout !== "gu") setShifted(false);
  }, [value, onChange, onSearch, shifted, layout, language]);

  function startHold(key: string) {
    if (key !== "BACKSPACE") return;
    const id = setInterval(() => onChange(value.slice(0, -1)), 100);
    setHolding(id);
  }
  function endHold() {
    if (holding) { clearInterval(holding); setHolding(null); }
  }

  const SPECIAL_LABELS: Record<string, React.ReactNode> = {
    BACKSPACE: <Delete size={22} strokeWidth={1.5} />,
    SHIFT:     <ChevronUp size={22} strokeWidth={1.5} />,
    SPACE:     <span className="font-sans text-[0.875rem] tracking-widest">SPACE</span>,
    SEARCH:    <CornerDownLeft size={22} strokeWidth={1.5} />,
    NUMBERS:   <span className="font-sans text-sm">123</span>,
    ALPHA:     <span className="font-sans text-sm">ABC</span>,
    "।":       <span>।</span>,
  };

  const SPECIAL_WIDTH: Record<string, string> = {
    BACKSPACE: "flex-[1.5]",
    SHIFT:     "flex-[1.5]",
    SPACE:     "flex-[4]",
    SEARCH:    "flex-[2]",
    NUMBERS:   "flex-[1.5]",
    ALPHA:     "flex-[1.5]",
  };

  return (
    <div className={cn(
      "bg-[rgba(11,13,18,0.96)] border-t border-[rgba(244,237,224,0.12)] p-3 pb-5 space-y-2",
      className
    )}>
      {/* Layout switcher */}
      <div className="flex gap-2 mb-2">
        {(["en","hi","gu"] as const).map((l) => (
          <button key={l}
            onClick={() => { setLayout(l); setShifted(false); }}
            className={cn("px-4 py-2 rounded-[10px] font-sans text-sm font-medium transition-all focus-visible:outline-gold",
              layout === l || (layout === "num" && l === "en")
                ? "bg-gold/20 text-gold border border-gold/40"
                : "bg-panel text-ivory/50 border border-[rgba(244,237,224,0.1)] hover:border-gold/20"
            )}
            lang={l}
          >{l === "en" ? "EN" : l === "hi" ? "हि" : "ગુ"}</button>
        ))}
        <p className="ml-auto font-sans text-[0.65rem] text-ivory/25 self-center italic">
          Keyboard layouts pending native speaker review
        </p>
      </div>

      {rows.map((row, ri) => (
        <div key={ri} className="flex gap-1.5 justify-center">
          {row.map((key) => {
            const isSpecial = key in SPECIAL_LABELS;
            const isSearch  = key === "SEARCH";
            return (
              <button
                key={key}
                onPointerDown={(e) => { e.preventDefault(); press(key); startHold(key); }}
                onPointerUp={endHold}
                onPointerLeave={endHold}
                className={cn(
                  "flex items-center justify-center rounded-[12px] min-h-[56px] flex-1",
                  "font-sans font-medium select-none touch-manipulation",
                  "transition-all duration-75 active:scale-[0.93]",
                  "focus-visible:outline focus-visible:outline-2 focus-visible:outline-gold",
                  isSearch
                    ? "bg-gold text-ink text-lg hover:bg-gold-soft"
                    : key === "SHIFT" && shifted
                      ? "bg-azure/20 border border-azure/40 text-azure"
                      : "bg-[rgba(244,237,224,0.08)] border border-[rgba(244,237,224,0.1)] text-ivory/80 hover:bg-[rgba(244,237,224,0.14)]",
                  SPECIAL_WIDTH[key] ?? "flex-1",
                )}
                lang={layout === "hi" ? "hi" : layout === "gu" ? "gu" : "en"}
                aria-label={isSpecial ? key.toLowerCase() : key}
              >
                {isSpecial ? SPECIAL_LABELS[key] : (
                  <span className={cn(
                    layout === "hi" || layout === "gu" ? "text-[1.4rem]" : "text-[1.25rem]"
                  )}>{key}</span>
                )}
              </button>
            );
          })}
        </div>
      ))}
    </div>
  );
}
