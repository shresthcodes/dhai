import type { Language } from "./models";
import rawData from "./timeline.json";

/* ─── Types ───────────────────────────────────────────────────────── */
export type TimelineChapter =
  | "early-life"
  | "education"
  | "social-public-work"
  | "constitutional-journey"
  | "legacy";

export interface TimelineVerification {
  status:      "seed-to-verify" | "verified";
  sourceNote?: string;
  sourceUrl?:  string;
}

export interface TimelineEvent {
  id:        string;
  year:      number;
  dateLabel: string;
  dateISO:   string | null;
  title:     string;
  oneLine:   string;
  chapter:   TimelineChapter;
  themes:    string[];
  place?:    string;
  verification: TimelineVerification;
  media?:    { imageSrc?: string; imageCredit?: string };
  related:   {
    documents:   string[];
    speeches:    string[];
    photographs: string[];
    media:       string[];
  };
}

/* ─── Chapter metadata ────────────────────────────────────────────── */
export const CHAPTERS: Record<TimelineChapter, {
  label:     string;
  labelHi:   string;
  labelGu:   string;
  color:     string;   // tailwind class token
  accentHex: string;
}> = {
  "early-life": {
    label: "Early Life", labelHi: "प्रारंभिक जीवन", labelGu: "પ્રારંભિક જીવન",
    color: "text-ivory", accentHex: "#F4EDE0",
  },
  education: {
    label: "Education", labelHi: "शिक्षा", labelGu: "શિક્ષણ",
    color: "text-azure", accentHex: "#4C7FB8",
  },
  "social-public-work": {
    label: "Social & Public Work", labelHi: "सामाजिक एवं सार्वजनिक कार्य", labelGu: "સામાજિક અને જાહેર કાર્ય",
    color: "text-terracotta", accentHex: "#B5573A",
  },
  "constitutional-journey": {
    label: "Constitutional Journey", labelHi: "संवैधानिक यात्रा", labelGu: "બંધારણીય યાત્રા",
    color: "text-gold", accentHex: "#C9A24B",
  },
  legacy: {
    label: "Legacy", labelHi: "विरासत", labelGu: "વારસો",
    color: "text-gold-soft", accentHex: "#E3C77A",
  },
};

/* ─── Service ─────────────────────────────────────────────────────── */
export function loadTimelineEvents(): TimelineEvent[] {
  return rawData as TimelineEvent[];
}

export function getEventsByChapter(chapter: TimelineChapter): TimelineEvent[] {
  return loadTimelineEvents().filter((e) => e.chapter === chapter);
}

export function getEventById(id: string): TimelineEvent | null {
  return loadTimelineEvents().find((e) => e.id === id) ?? null;
}

export function getChapterLabel(chapter: TimelineChapter, lang: Language): string {
  const meta = CHAPTERS[chapter];
  if (lang === "hi") return meta.labelHi;
  if (lang === "gu") return meta.labelGu;
  return meta.label;
}

export function getChapterDateRange(chapter: TimelineChapter): { from: number; to: number } {
  const events = getEventsByChapter(chapter);
  return {
    from: Math.min(...events.map((e) => e.year)),
    to:   Math.max(...events.map((e) => e.year)),
  };
}

// Hook for Story/Media cross-linking
export function getMediaByTimelineTag(tag: string): TimelineEvent[] {
  return loadTimelineEvents().filter((e) =>
    e.themes.some((t) => t.toLowerCase().includes(tag.toLowerCase())) ||
    e.title.toLowerCase().includes(tag.toLowerCase())
  );
}
