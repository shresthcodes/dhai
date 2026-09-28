"use client";
import { create } from "zustand";
import type { Language } from "@/data/models";

export interface KioskSessionItem {
  id:    string;
  title: string;
  kind:  string;
  path:  string;
}

interface KioskState {
  phase:        "attract" | "language" | "home" | "active";
  language:     Language;
  items:        KioskSessionItem[];
  reachMode:    boolean;
  textScale:    1 | 1.25 | 1.5;
  highContrast: boolean;
  reduceMotion: boolean;
  // Actions
  setPhase:       (p: KioskState["phase"]) => void;
  setLanguage:    (l: Language) => void;
  addItem:        (item: KioskSessionItem) => void;
  removeItem:     (id: string) => void;
  setReachMode:   (v: boolean) => void;
  setTextScale:   (s: 1 | 1.25 | 1.5) => void;
  setHighContrast:(v: boolean) => void;
  setReduceMotion:(v: boolean) => void;
  reset:          () => void;
}

const DEFAULTS = {
  phase: "attract" as const,
  language: "en" as Language,
  items: [],
  reachMode: false,
  textScale: 1 as const,
  highContrast: false,
  reduceMotion: false,
};

export const useKioskStore = create<KioskState>()((set) => ({
  ...DEFAULTS,
  setPhase:        (phase)        => set({ phase }),
  setLanguage:     (language)     => set({ language, phase: "home" }),
  addItem:         (item)         => set((s) => ({ items: s.items.some((i) => i.id === item.id) ? s.items : [...s.items, item] })),
  removeItem:      (id)           => set((s) => ({ items: s.items.filter((i) => i.id !== id) })),
  setReachMode:    (reachMode)    => set({ reachMode }),
  setTextScale:    (textScale)    => set({ textScale }),
  setHighContrast: (highContrast) => set({ highContrast }),
  setReduceMotion: (reduceMotion) => set({ reduceMotion }),
  reset: () => set(DEFAULTS),
}));
