/* ─── Evaluation Harness ──────────────────────────────────────────────
   npm run eval
   Measures: Hit@1/3/5, MRR, refusal P/R, citation validity, latency
──────────────────────────────────────────────────────────────────── */
import fs   from "fs";
import path from "path";
import { retrieve }       from "./retrieve";
import { validateAnswer } from "./validate";
import { ragAnswer }      from "./answer";

interface EvalQuestion {
  id:                  string;
  question:            string;
  language:            string;
  expectedDocIds:      string[];
  expectedAnswerNotes: string;
  shouldRefuse:        boolean;
}

interface EvalResult {
  id:            string;
  hit1:          boolean;
  hit3:          boolean;
  hit5:          boolean;
  recipRank:     number;
  refused:       boolean;
  shouldRefuse:  boolean;
  citationValid: boolean;
  latencyMs:     number;
  status:        string;
}

function computeMRR(results: EvalResult[]): number {
  const rrs = results.filter((r) => !r.shouldRefuse).map((r) => r.recipRank);
  return rrs.length ? rrs.reduce((a, b) => a + b, 0) / rrs.length : 0;
}

export async function runEval(): Promise<void> {
  const qPath = path.join(process.cwd(), "eval", "questions.json");
  if (!fs.existsSync(qPath)) {
    console.error("[eval] eval/questions.json not found");
    process.exit(1);
  }

  const questions: EvalQuestion[] = JSON.parse(fs.readFileSync(qPath, "utf8"))
    .filter((q: EvalQuestion) => !q.id.startsWith("EXAMPLE"));

  if (questions.length === 0) {
    console.log("[eval] No eval questions found (examples are excluded). Add real questions to eval/questions.json.");
    return;
  }

  console.log(`[eval] Running ${questions.length} questions…\n`);

  const results: EvalResult[] = [];

  for (const q of questions) {
    const start = Date.now();
    const ret   = await retrieve(q.question, { topN: 5, includeDemo: true });
    const retMs = Date.now() - start;

    const retrievedIds = ret.results.map((r) => r.chunk.docId);
    const hit1  = q.expectedDocIds.some((id) => retrievedIds[0] === id);
    const hit3  = q.expectedDocIds.some((id) => retrievedIds.slice(0, 3).includes(id));
    const hit5  = q.expectedDocIds.some((id) => retrievedIds.slice(0, 5).includes(id));
    const rank  = retrievedIds.findIndex((id) => q.expectedDocIds.includes(id)) + 1;
    const recipRank = rank > 0 ? 1 / rank : 0;

    // Run full answer for refusal + citation check
    let refused        = false;
    let citationValid  = true;
    let status         = "ok";
    let answerText     = "";
    const ansStart     = Date.now();

    try {
      const ans = await ragAnswer({ question: q.question, language: q.language });
      refused      = ans.status === "insufficient_evidence";
      answerText   = ans.answer;
      status       = ans.status;
      if (!refused && answerText) {
        const v = validateAnswer(answerText, ans.sources);
        citationValid = v.valid;
      }
    } catch (e) {
      status = "error";
      console.warn(`[eval] ${q.id}: error — ${e instanceof Error ? e.message : e}`);
    }
    const latencyMs = Date.now() - ansStart + retMs;

    results.push({ id: q.id, hit1, hit3, hit5, recipRank, refused, shouldRefuse: q.shouldRefuse, citationValid, latencyMs, status });
    const mark = q.shouldRefuse ? (refused ? "✓ refused" : "✗ not refused") : (hit3 ? "✓ Hit@3" : "✗ miss");
    console.log(`  ${q.id.padEnd(20)} ${mark.padEnd(14)} lat:${latencyMs}ms`);
  }

  const nonRefusal  = results.filter((r) => !r.shouldRefuse);
  const refusalQs   = results.filter((r) => r.shouldRefuse);

  const hit1  = nonRefusal.filter((r) => r.hit1).length / (nonRefusal.length || 1);
  const hit3  = nonRefusal.filter((r) => r.hit3).length / (nonRefusal.length || 1);
  const hit5  = nonRefusal.filter((r) => r.hit5).length / (nonRefusal.length || 1);
  const mrr   = computeMRR(results);
  const refP  = refusalQs.length ? refusalQs.filter((r) => r.refused).length / refusalQs.length : null;
  const citOk = results.filter((r) => r.citationValid).length / (results.length || 1);
  const avgLat = results.reduce((a, r) => a + r.latencyMs, 0) / (results.length || 1);

  console.log("\n─────────────────────────────────────");
  console.log(`Hit@1:            ${pct(hit1)}`);
  console.log(`Hit@3:            ${pct(hit3)}`);
  console.log(`Hit@5:            ${pct(hit5)}`);
  console.log(`MRR:              ${mrr.toFixed(3)}`);
  console.log(`Refusal precision:${refP !== null ? pct(refP) : " N/A (no refusal Qs)"}`);
  console.log(`Citation validity:${pct(citOk)}`);
  console.log(`Avg latency:      ${avgLat.toFixed(0)}ms`);
  console.log(`Questions:        ${questions.length}`);
  console.log(`Corpus docs:      (see ingest stats)`);
  console.log("─────────────────────────────────────\n");

  // Save
  const outDir = path.join(process.cwd(), "eval", "results");
  fs.mkdirSync(outDir, { recursive: true });
  const outFile = path.join(outDir, `${new Date().toISOString().slice(0, 10)}.json`);
  fs.writeFileSync(outFile, JSON.stringify({
    date: new Date().toISOString(),
    questionCount: questions.length,
    metrics: { hit1, hit3, hit5, mrr, refusalPrecision: refP, citationValidity: citOk, avgLatencyMs: avgLat },
    results,
  }, null, 2));
  console.log(`[eval] Results saved to ${outFile}`);
}

function pct(n: number): string { return ` ${(n * 100).toFixed(1)}%`; }
