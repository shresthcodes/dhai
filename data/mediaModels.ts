/* ─── Media Archive Models ───────────────────────────────────────────────
   IMPORTANT: All records marked isDemo:true are placeholder data only.
   No real dates, speaker attributions, quotations or historical claims.
──────────────────────────────────────────────────────────────────────── */

import type { Language } from "./models";

export type MediaKind = "speech" | "lecture" | "documentary" | "interview" | "audio";
export type MediaType = "video" | "audio";

export interface TranscriptLine {
  startSec:  number;
  endSec:    number;
  speaker?:  string;
  text:      string;
}

export interface Chapter {
  startSec: number;
  title:    string;
}

export interface MediaRights {
  status: "demo" | "cleared" | "unknown";
  note:   string;
}

export interface MediaAccessibility {
  captions:          boolean;
  audioDescription:  boolean;
}

export interface MediaRelated {
  documents:    string[];   // ArchiveItem ids
  photographs:  string[];
  writings:     string[];
}

export interface RichMediaItem {
  id:           string;
  title:        string;
  kind:         MediaKind;
  mediaType:    MediaType;
  src?:         string;                 // /public/media/...  null = placeholder
  poster?:      string;                 // /public/media/...
  durationSec:  number;
  language:     Language;
  collection:   string;
  source:       string;
  rights:       MediaRights;
  summary:      string;
  keywords:     string[];
  date?:        null;                   // always null for demo
  isDemo:       true;

  transcript:   TranscriptLine[];
  translations?: Partial<Record<Language, TranscriptLine[]>>;
  chapters:     Chapter[];
  related:      MediaRelated;
  accessibility: MediaAccessibility;
}
