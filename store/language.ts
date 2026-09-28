import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type { Language } from "@/data/models";

interface LanguageState {
  language: Language;
  _hasHydrated: boolean;
  setLanguage: (lang: Language) => void;
  setHasHydrated: (v: boolean) => void;
}

export const useLanguageStore = create<LanguageState>()(
  persist(
    (set) => ({
      language: "en",
      _hasHydrated: false,
      setLanguage: (language) => set({ language }),
      setHasHydrated: (v) => set({ _hasHydrated: v }),
    }),
    {
      name: "dhai-language",
      storage: createJSONStorage(() =>
        typeof window !== "undefined" ? localStorage : { getItem: () => null, setItem: () => {}, removeItem: () => {} }
      ),
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
      },
    }
  )
);
