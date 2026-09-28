import rawData from "./story.json";
import {
  loadTimelineEvents,
  getEventsByChapter,
  type TimelineChapter,
  type TimelineEvent,
} from "./timelineService";

/* ─── Types ───────────────────────────────────────────────────────── */
export type StoryMood = "dawn" | "study" | "assembly" | "light" | "stillness";
export type StoryAccent = "gold" | "azure" | "terracotta" | "ivory";

export interface StoryNarrative {
  status:      "placeholder" | "verified";
  paragraphs:  string[];
  sourceNote?: string;
}

export interface StoryVisual {
  imageSrc?:    string | null;
  imageCredit?: string | null;
  mood:         StoryMood;
}

export interface StoryChapter {
  id:       TimelineChapter;
  number:   number;
  title:    string;
  subtitle: string;
  eventIds: string[];
  narrative: StoryNarrative;
  visual:    StoryVisual;
  audio?:    { src?: string | null };
  evidence: {
    documents:   string[];
    speeches:    string[];
    photographs: string[];
    media:       string[];
  };
  accent: StoryAccent;
}

/* ─── Accent colour hex ───────────────────────────────────────────── */
export const ACCENT_HEX: Record<StoryAccent, string> = {
  gold:       "#C9A24B",
  azure:      "#4C7FB8",
  terracotta: "#B5573A",
  ivory:      "#F4EDE0",
};

/* ─── Mood gradient ───────────────────────────────────────────────── */
export const MOOD_GRADIENT: Record<StoryMood, string> = {
  dawn:      "radial-gradient(ellipse 80% 60% at 40% 70%, rgba(201,162,75,0.12) 0%, rgba(11,13,18,0.85) 70%)",
  study:     "radial-gradient(ellipse 60% 50% at 30% 40%, rgba(76,127,184,0.10) 0%, rgba(11,13,18,0.88) 70%)",
  assembly:  "radial-gradient(ellipse 90% 60% at 50% 60%, rgba(181,87,58,0.08) 0%, rgba(11,13,18,0.86) 70%)",
  light:     "radial-gradient(ellipse 70% 55% at 50% 30%, rgba(201,162,75,0.14) 0%, rgba(11,13,18,0.84) 70%)",
  stillness: "radial-gradient(ellipse 50% 60% at 50% 50%, rgba(227,199,122,0.07) 0%, rgba(11,13,18,0.92) 75%)",
};

/* ─── Service ─────────────────────────────────────────────────────── */
export function loadStoryChapters(): StoryChapter[] {
  return rawData as StoryChapter[];
}

export function getChapterById(id: string): StoryChapter | null {
  return loadStoryChapters().find((c) => c.id === id) ?? null;
}

export function getChapterForEvent(eventId: string): StoryChapter | null {
  const chapters = loadStoryChapters();
  return chapters.find((c) => c.eventIds.includes(eventId)) ?? null;
}

export function getChapterEvents(chapter: StoryChapter): TimelineEvent[] {
  const all = loadTimelineEvents();
  return chapter.eventIds.map((id) => all.find((e) => e.id === id)).filter(Boolean) as TimelineEvent[];
}
