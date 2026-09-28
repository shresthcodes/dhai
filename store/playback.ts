import { create } from "zustand";

export interface PlaybackState {
  activeId:    string | null;
  title:       string;
  isPlaying:   boolean;
  currentSec:  number;
  durationSec: number;
  src:         string | null;     // null = placeholder tone
  mediaType:   "audio" | "video";
  // Actions
  setActive:  (id: string, title: string, mediaType: "audio" | "video", src: string | null, durationSec: number) => void;
  setPlaying: (v: boolean) => void;
  setCurrentSec: (s: number) => void;
  stop:        () => void;
}

export const usePlaybackStore = create<PlaybackState>()((set) => ({
  activeId:    null,
  title:       "",
  isPlaying:   false,
  currentSec:  0,
  durationSec: 0,
  src:         null,
  mediaType:   "audio",

  setActive: (id, title, mediaType, src, durationSec) =>
    set({ activeId: id, title, mediaType, src, durationSec, currentSec: 0, isPlaying: false }),

  setPlaying: (isPlaying) => set({ isPlaying }),

  setCurrentSec: (currentSec) => set({ currentSec }),

  stop: () => set({ activeId: null, isPlaying: false, currentSec: 0 }),
}));
