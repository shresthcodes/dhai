import type { MediaItem, SourceCitation } from "./models";

/* ─── Placeholder Media Items ───────────────────────────────────────────
   DEMO DATA ONLY. No real photographs, audio or video are referenced.
──────────────────────────────────────────────────────────────────────── */

export const MEDIA_ITEMS: MediaItem[] = [
  {
    id:         "media-001",
    title:      "Demo Photograph 01",
    type:       "photograph",
    caption:    "Placeholder photograph record. Verified image and caption will replace this.",
    collection: "Demo Visual Collection",
    isDemo:     true,
  },
  {
    id:         "media-002",
    title:      "Demo Audio Record 01",
    type:       "audio",
    caption:    "Placeholder audio record. Verified audio and metadata will replace this.",
    collection: "Demo Audio Collection",
    isDemo:     true,
  },
  {
    id:         "media-003",
    title:      "Demo Video Record 01",
    type:       "video",
    caption:    "Placeholder video record. Verified video and metadata will replace this.",
    collection: "Demo Video Collection",
    isDemo:     true,
  },
];

export const SOURCE_CITATIONS: SourceCitation[] = [
  {
    id:        "src-001",
    type:      "archive",
    title:     "Demo Archival Source 01",
    notes:     "Placeholder citation. Will be replaced with a verified archival reference.",
    isDemo:    true,
  },
  {
    id:        "src-002",
    type:      "government",
    title:     "Demo Government Record 01",
    notes:     "Placeholder citation. Will be replaced with a verified government document reference.",
    isDemo:    true,
  },
];

export async function getMediaItems(): Promise<MediaItem[]> {
  return MEDIA_ITEMS;
}

export async function getMediaItemById(id: string): Promise<MediaItem | null> {
  return MEDIA_ITEMS.find((m) => m.id === id) ?? null;
}

export async function getSourceCitations(): Promise<SourceCitation[]> {
  return SOURCE_CITATIONS;
}
