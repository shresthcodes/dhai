import type { TimelineEvent } from "./models";

/* ─── Placeholder Timeline Events ──────────────────────────────────────
   DEMO DATA ONLY. Years and categories are illustrative placeholders only.
   No verified historical claims are made here.
──────────────────────────────────────────────────────────────────────── */

export const TIMELINE_EVENTS: TimelineEvent[] = [
  {
    id:       "evt-001",
    year:     1900,
    title:    "Demo Timeline Event 01",
    category: "personal",
    summary:  "Placeholder entry for a personal milestone. Verified details will be added.",
    items:    [],
    isDemo:   true,
  },
  {
    id:       "evt-002",
    year:     1920,
    title:    "Demo Timeline Event 02",
    category: "literary",
    summary:  "Placeholder entry for a literary event. Verified details will be added.",
    items:    ["doc-001"],
    isDemo:   true,
  },
  {
    id:       "evt-003",
    year:     1940,
    title:    "Demo Timeline Event 03",
    category: "constitutional",
    summary:  "Placeholder entry for a constitutional milestone. Verified details will be added.",
    items:    ["doc-002"],
    isDemo:   true,
  },
];

export async function getTimelineEvents(): Promise<TimelineEvent[]> {
  return TIMELINE_EVENTS.sort((a, b) => a.year - b.year);
}
