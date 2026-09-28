import type { RichMediaItem, MediaKind } from "./mediaModels";
import mediaData from "./mediaItems.json";

export function loadMediaItems(): RichMediaItem[] {
  return mediaData as unknown as RichMediaItem[];
}

export async function getMediaItems(filters?: { kind?: MediaKind[]; language?: string[] }): Promise<RichMediaItem[]> {
  let items = loadMediaItems();
  if (filters?.kind?.length)     items = items.filter((i) => filters.kind!.includes(i.kind));
  if (filters?.language?.length) items = items.filter((i) => filters.language!.includes(i.language));
  return items;
}

export async function getMediaItem(id: string): Promise<RichMediaItem | null> {
  return loadMediaItems().find((i) => i.id === id) ?? null;
}

export function getMediaByTimelineTag(tag: string): RichMediaItem[] {
  return loadMediaItems().filter((i) =>
    i.keywords.some((k) => k.toLowerCase().includes(tag.toLowerCase()))
  );
}

export function formatDuration(sec: number): string {
  const h = Math.floor(sec / 3600);
  const m = Math.floor((sec % 3600) / 60);
  const s = sec % 60;
  if (h > 0) return `${h}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  return `${m}:${String(s).padStart(2, "0")}`;
}
