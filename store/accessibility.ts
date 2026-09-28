import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

export type TextScale = 1 | 1.125 | 1.25 | 1.5;

interface AccessibilityState {
  textScale:       TextScale;
  highContrast:    boolean;
  reduceMotion:    boolean;
  narration:       boolean;
  readableFont:    boolean;
  underlineLinks:  boolean;
  focusHighlight:  boolean;
  narrationLang:   string;
  narrationSpeed:  number;
  _hasHydrated:    boolean;
  setTextScale:       (s: TextScale) => void;
  setHighContrast:    (v: boolean) => void;
  setReduceMotion:    (v: boolean) => void;
  setNarration:       (v: boolean) => void;
  setReadableFont:    (v: boolean) => void;
  setUnderlineLinks:  (v: boolean) => void;
  setFocusHighlight:  (v: boolean) => void;
  setNarrationLang:   (l: string) => void;
  setNarrationSpeed:  (s: number) => void;
  setHasHydrated:     (v: boolean) => void;
  reset:              () => void;
}

const DEFAULTS = {
  textScale: 1 as TextScale,
  highContrast: false,
  reduceMotion: false,
  narration: false,
  readableFont: false,
  underlineLinks: false,
  focusHighlight: false,
  narrationLang: "en-IN",
  narrationSpeed: 1,
  _hasHydrated: false,
};

export const useAccessibilityStore = create<AccessibilityState>()(
  persist(
    (set) => ({
      ...DEFAULTS,
      setTextScale:      (textScale)      => set({ textScale }),
      setHighContrast:   (highContrast)   => set({ highContrast }),
      setReduceMotion:   (reduceMotion)   => set({ reduceMotion }),
      setNarration:      (narration)      => set({ narration }),
      setReadableFont:   (readableFont)   => set({ readableFont }),
      setUnderlineLinks: (underlineLinks) => set({ underlineLinks }),
      setFocusHighlight: (focusHighlight) => set({ focusHighlight }),
      setNarrationLang:  (narrationLang)  => set({ narrationLang }),
      setNarrationSpeed: (narrationSpeed) => set({ narrationSpeed }),
      setHasHydrated:    (v)              => set({ _hasHydrated: v }),
      reset:             ()               => set({ ...DEFAULTS, _hasHydrated: true }),
    }),
    {
      name: "dhai-accessibility",
      storage: createJSONStorage(() =>
        typeof window !== "undefined"
          ? localStorage
          : { getItem: () => null, setItem: () => {}, removeItem: () => {} }
      ),
      onRehydrateStorage: () => (state) => state?.setHasHydrated(true),
    }
  )
);
