/* ─── Ask the Archive — Typed Interface ─────────────────────────────────
   This is the ADAPTER BOUNDARY. The UI only imports from here.
   Swap the provider in index.ts to go from DEMO_SCRIPTED → LIVE.
──────────────────────────────────────────────────────────────────────── */

import type { Language, ArchiveItemType } from "@/data/models";

/* ─── Input ──────────────────────────────────────────────────────────── */
export interface AskInput {
  question: string;
  language: Language;
  docId?:   string;        // focused on a specific document
  onStage?: (stage: AskStage) => void;
}

/* ─── Pipeline stages (visible in UI) ───────────────────────────────── */
export type AskStage =
  | "understanding"   // parsing intent + concepts
  | "retrieving"      // searching archive
  | "ranking"         // scoring candidates
  | "composing"       // building answer from evidence
  | "citing";         // attaching source citations

export const ASK_STAGE_LABELS: Record<AskStage, string> = {
  understanding: "Understanding query",
  retrieving:    "Searching archive",
  ranking:       "Ranking sources",
  composing:     "Composing from evidence",
  citing:        "Adding citations",
};

/* ─── Answer blocks (streaming-friendly) ────────────────────────────── */
export interface AnswerBlock {
  type:   "paragraph" | "note" | "disclaimer";
  text:   string;         // may contain [1], [2] citation markers
}

/* ─── Source citation ────────────────────────────────────────────────── */
export interface SourceCitation {
  id:             string;    // maps to ArchiveItem.id
  title:          string;
  type:           ArchiveItemType;
  docId:          string;
  excerpt:        string;    // neutral short excerpt from the record
  retrievalScore: number;    // 0–100, labelled "Demo retrieval score"
  pageRef?:       string;    // "Page to be verified" for demo
}

/* ─── Retrieval metadata (for "How DHAI answered") ───────────────────── */
export interface RetrievalMeta {
  query:                string;
  concepts:             string[];
  candidatesConsidered: number;
  used:                 number;
}

/* ─── Full result ────────────────────────────────────────────────────── */
export interface AskResult {
  status:    "answered" | "insufficient_evidence";
  answer:    { blocks: AnswerBlock[] };
  sources:   SourceCitation[];
  retrieval: RetrievalMeta;
  meta:      { mode: "DEMO_SCRIPTED" | "LIVE"; latencyMs: number };
}

/* ─── Provider interface (implement to swap providers) ──────────────── */
export interface AskProvider {
  ask(input: AskInput): Promise<AskResult>;
}

/* ─── Showcase questions ──────────────────────────────────────────────
   Pre-scripted questions that always produce a polished demo answer.
   Last one is deliberately out-of-scope to demonstrate refusal.
──────────────────────────────────────────────────────────────────────── */
export interface ShowcaseQuestion {
  id:       string;
  question: string;
  icon:     string;   // emoji used as visual, not decorative in aria
  scope:    "archive" | "refusal";
}

export const SHOWCASE_QUESTIONS: ShowcaseQuestion[] = [
  {
    id:       "sq-1",
    question: "What archival material is available on constitutional debates and democracy?",
    icon:     "⚖",
    scope:    "archive",
  },
  {
    id:       "sq-2",
    question: "Find materials related to social equality and rights in the archive.",
    icon:     "📜",
    scope:    "archive",
  },
  {
    id:       "sq-3",
    question: "What manuscripts and written documents are held in the collection?",
    icon:     "✍",
    scope:    "archive",
  },
  {
    id:       "sq-4",
    question: "What is the current weather in Mumbai?",
    icon:     "🌤",
    scope:    "refusal",  // deliberately out-of-scope — triggers insufficient_evidence
  },
];
