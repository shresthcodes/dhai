/* ─── Ask the Archive — Public API ──────────────────────────────────────
   ADAPTER BOUNDARY. UI only imports from here.

   Provider selection:
   - NEXT_PUBLIC_ASK_MODE=live  → uses liveProvider (calls /api/ask)
   - anything else / missing   → uses demoProvider (DEMO_SCRIPTED)
   - /api/health reports index not ready → falls back to demo with a notice
──────────────────────────────────────────────────────────────────────── */

import { demoProvider }      from "./demoProvider";
import type { AskInput, AskResult, AskProvider } from "./types";

let _liveChecked = false;
let _liveReady   = false;

async function checkLive(): Promise<boolean> {
  if (_liveChecked) return _liveReady;
  _liveChecked = true;
  if (process.env.NEXT_PUBLIC_ASK_MODE !== "live") return false;
  try {
    const res  = await fetch("/api/health", { cache: "no-store" });
    const data = await res.json() as { indexReady: boolean };
    _liveReady = data.indexReady;
    return _liveReady;
  } catch {
    return false;
  }
}

export async function askArchive(input: AskInput): Promise<AskResult> {
  const live = await checkLive();
  if (live) {
    const { liveProvider } = await import("./liveProvider");
    return liveProvider.ask(input);
  }
  return demoProvider.ask(input);
}

export type {
  AskInput, AskResult, AskProvider,
  AskStage, AnswerBlock, SourceCitation, RetrievalMeta,
} from "./types";

export { ASK_STAGE_LABELS, SHOWCASE_QUESTIONS } from "./types";
