/* ─── Core Data Models ───────────────────────────────────────────────────
   IMPORTANT: All records marked isDemo:true are placeholder data only.
   No real dates, quotations, statistics or historical claims are included.
   Verified content will be supplied separately.
──────────────────────────────────────────────────────────────────────── */

export type ArchiveItemType =
  | "writing" | "speech" | "manuscript" | "debate"
  | "photograph" | "record" | "audio" | "video";

export type Language = "en" | "hi" | "mr" | "gu";

/* ─── OCR / Document Page ─────────────────────────────────────────────── */
export interface OcrWord {
  text:        string;
  confidence:  number;  // 0-100 from tesseract
  bbox:        { x0: number; y0: number; x1: number; y1: number }; // % of image
}

export interface DocumentPage {
  n:          number;
  imageSrc:   string | null;
  ocrText:    string;
  ocrStatus:  "validated" | "pending" | "none";
  words?:     OcrWord[];
}

export interface OcrMeta {
  engine:        string;
  validatedBy?:  string;
  note?:         string;
}

export interface AiSummary {
  text:           string;
  generatedBy:    "DEMO";
  basedOnPages:   number[];
}

export interface TranslationEntry {
  title?:   string;
  summary?: string;
  note:     string;  // "Machine translation — demo — requires human validation"
}

/* ─── Archive Item (extended, backward-compatible) ───────────────────── */
export interface ArchiveItem {
  id:           string;
  title:        string;
  type:         ArchiveItemType;
  date?:        string | null;
  language:     Language;
  topic:        string[];
  collection:   string;
  source:       string;
  keywords:     string[];
  summary:      string;
  fullText?:    string;
  thumbnail?:   string | null;
  isDemo:       true;
  // Extended for document viewer
  pages?:        DocumentPage[];
  ocrMeta?:      OcrMeta;
  aiSummary?:    AiSummary;
  translations?: Partial<Record<Language, TranslationEntry>>;
  access?:       "open" | "restricted";
  related?:      string[];
}

/* ─── Timeline / Media / Citation (unchanged) ───────────────────────── */
export interface TimelineEvent {
  id:       string;
  year:     number;
  title:    string;
  category: "personal" | "political" | "literary" | "constitutional" | "social";
  summary:  string;
  items?:   string[];
  isDemo:   true;
}

export interface MediaItem {
  id:         string;
  title:      string;
  type:       "photograph" | "audio" | "video";
  src?:       string;
  thumbnail?: string;
  caption:    string;
  date?:      string;
  collection: string;
  isDemo:     true;
}

export interface SourceCitation {
  id:          string;
  type:        "book" | "journal" | "archive" | "government" | "newspaper";
  title:       string;
  author?:     string;
  publisher?:  string;
  year?:       number;
  url?:        string;
  notes:       string;
  isDemo:      true;
}
