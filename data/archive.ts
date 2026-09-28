import type { ArchiveItem } from "./models";

/* ─── Placeholder Archive Records ──────────────────────────────────────
   DEMO DATA ONLY. Titles and summaries are neutral placeholders.
   No historical claims, dates, or quotations are included.
   All records will be replaced with verified content.
──────────────────────────────────────────────────────────────────────── */

export const ARCHIVE_ITEMS: ArchiveItem[] = [
  {
    id:         "doc-001",
    title:      "Demo Archival Document 01",
    type:       "writing",
    language:   "en",
    topic:      ["placeholder", "writing"],
    collection: "Demo Collection A",
    source:     "Demonstration Source — Not Verified",
    keywords:   ["demo", "placeholder", "writing"],
    summary:    "This is a placeholder record for a written document. Verified archival content will replace this entry.",
    isDemo:     true,
  },
  {
    id:         "doc-002",
    title:      "Demo Archival Document 02",
    type:       "speech",
    language:   "en",
    topic:      ["placeholder", "speech"],
    collection: "Demo Collection B",
    source:     "Demonstration Source — Not Verified",
    keywords:   ["demo", "placeholder", "speech"],
    summary:    "This is a placeholder record for a speech transcript. Verified archival content will replace this entry.",
    isDemo:     true,
  },
  {
    id:         "doc-003",
    title:      "Demo Archival Document 03",
    type:       "manuscript",
    language:   "en",
    topic:      ["placeholder", "manuscript"],
    collection: "Demo Collection C",
    source:     "Demonstration Source — Not Verified",
    keywords:   ["demo", "placeholder", "manuscript"],
    summary:    "This is a placeholder record for a manuscript. Verified archival content will replace this entry.",
    isDemo:     true,
  },
];

export async function getArchiveItems(): Promise<ArchiveItem[]> {
  return ARCHIVE_ITEMS;
}

export async function getArchiveItemById(id: string): Promise<ArchiveItem | null> {
  return ARCHIVE_ITEMS.find((item) => item.id === id) ?? null;
}

export async function searchArchive(query: string): Promise<ArchiveItem[]> {
  const q = query.toLowerCase();
  return ARCHIVE_ITEMS.filter(
    (item) =>
      item.title.toLowerCase().includes(q) ||
      item.keywords.some((k) => k.toLowerCase().includes(q))
  );
}
