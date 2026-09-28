/* ─── DEMO_SCRIPTED Provider ────────────────────────────────────────────
   Uses archive.json records + searchArchive() to retrieve sources,
   then composes a NEUTRAL template-based answer from them.

   STRICT RULES:
   - No invented historical facts, quotations, dates, statistics.
   - All answer text is generic placeholder content labelled DEMO.
   - Retrieval scores are mock — never presented as real AI accuracy.
──────────────────────────────────────────────────────────────────────── */

import { searchArchive } from "@/data/archiveService";
import type {
  AskInput, AskResult, AskProvider,
  AskStage, AnswerBlock, SourceCitation, RetrievalMeta,
} from "./types";
import type { Language } from "@/data/models";

/* ─── Stage timing helper ─────────────────────────────────────────── */
async function fireStage(
  stage:   AskStage,
  onStage: AskInput["onStage"],
  ms:      number
): Promise<void> {
  onStage?.(stage);
  await new Promise<void>((r) => setTimeout(r, ms));
}

/* ─── Neutral answer template ────────────────────────────────────────
   Builds an answer composed only from the retrieved records.
   Uses record summaries — no invented content.
──────────────────────────────────────────────────────────────────────── */
function buildAnswerBlocks(
  question:  string,
  sources:   SourceCitation[],
  lang:      Language
): AnswerBlock[] {
  if (!sources.length) return [];

  // Template varies by language but stays neutral
  const templates: Record<Language, (q: string, s: SourceCitation[]) => AnswerBlock[]> = {
    en: (q, s) => [
      {
        type: "paragraph",
        text: `Based on the retrieved archive records, the following materials are relevant to your query: "${q}". The archive contains ${s.length} source${s.length !== 1 ? "s" : ""} that address this topic.`,
      },
      {
        type: "paragraph",
        text: `The first retrieved source [1] is described as: "${s[0].excerpt}" This record is held in the archive collection and awaits verified content.`,
      },
      ...(s[1] ? [{
        type: "paragraph" as const,
        text: `A second relevant record [2] states: "${s[1].excerpt}" This forms part of the broader collection on this subject.`,
      }] : []),
      ...(s[2] ? [{
        type: "paragraph" as const,
        text: `Additionally, the archive holds [3]: "${s[2].excerpt}"`,
      }] : []),
      {
        type: "note",
        text: "This response is composed only from the archive records retrieved above. No information has been added beyond what the sources contain.",
      },
    ],
    hi: (q, s) => [
      {
        type: "paragraph",
        text: `पुनः प्राप्त अभिलेखीय अभिलेखों के आधार पर, आपके प्रश्न से संबंधित निम्नलिखित सामग्री उपलब्ध है: "${q}"। अभिलेखागार में ${s.length} स्रोत हैं जो इस विषय को संबोधित करते हैं।`,
      },
      {
        type: "paragraph",
        text: `पहला पुनः प्राप्त स्रोत [1]: "${s[0].excerpt}" यह अभिलेखागार संग्रह में है और सत्यापित सामग्री की प्रतीक्षा में है।`,
      },
      {
        type: "note",
        text: "यह उत्तर केवल ऊपर पुनः प्राप्त अभिलेखीय अभिलेखों से बना है। कोई अतिरिक्त जानकारी नहीं जोड़ी गई है।",
      },
    ],
    gu: (q, s) => [
      {
        type: "paragraph",
        text: `પ્રાપ્ત આર્કાઇવ રેકોર્ડ્સ પર આધારિત, તમારી ક્વેરી સાથે સંબંધિત નીચેની સામગ્રી ઉપલબ્ધ છે: "${q}"। આર્કાઇવમાં ${s.length} સ્ત્રોત છે.`,
      },
      {
        type: "paragraph",
        text: `પ્રથમ પ્રાપ્ત સ્ત્રોત [1]: "${s[0].excerpt}" આ આર્કાઇવ સંગ્રહમાં રાખવામાં આવ્યો છે.`,
      },
      {
        type: "note",
        text: "આ જવાબ ફક્ત ઉપર પ્રાપ્ત આર્કાઇવ રેકોર્ડ્સમાંથી બનાવવામાં આવ્યો છે.",
      },
    ],
    mr: (q, s) => [
      {
        type: "paragraph",
        text: `पुनर्प्राप्त अभिलेखीय नोंदींवर आधारित, तुमच्या प्रश्नाशी संबंधित खालील साहित्य उपलब्ध आहे: "${q}"। अभिलेखागारात ${s.length} स्रोत आहेत.`,
      },
      {
        type: "note",
        text: "हे उत्तर केवळ वरील पुनर्प्राप्त अभिलेखीय नोंदींमधून तयार केले आहे.",
      },
    ],
  };

  const blocks = templates[lang]?.(question, sources) ?? templates.en(question, sources);
  blocks.push({
    type: "disclaimer",
    text: "DEMO RESPONSE — Generated from placeholder archive records. Always verify against original verified sources.",
  });
  return blocks;
}

/* ─── Delay util ──────────────────────────────────────────────────── */
const delay = (ms: number) => new Promise<void>((r) => setTimeout(r, ms));
const randMs = (lo: number, hi: number) => lo + Math.random() * (hi - lo);

/* ─── Provider ────────────────────────────────────────────────────── */
export const demoProvider: AskProvider = {
  async ask({ question, language, docId, onStage }: AskInput): Promise<AskResult> {
    const t0 = Date.now();

    // Stage: understanding
    await fireStage("understanding", onStage, randMs(400, 600));

    // Stage: retrieving
    await fireStage("retrieving", onStage, randMs(400, 650));
    const searchResp = await searchArchive(question, docId ? undefined : undefined, "relevance");
    // If focused on a doc, filter to that doc's related items
    let results = searchResp.results;
    if (docId) {
      const focused = results.filter((r) => r.item.id === docId || (r.item.related ?? []).includes(docId));
      if (focused.length > 0) results = focused;
    }

    // Stage: ranking
    await fireStage("ranking", onStage, randMs(350, 550));
    const top3 = results.slice(0, 3);

    // Insufficient evidence check
    if (top3.length === 0 || top3[0].score < 5) {
      // Still fire remaining stages quickly
      await fireStage("composing", onStage, 200);
      await fireStage("citing",    onStage, 200);
      const retrieval: RetrievalMeta = {
        query:                question,
        concepts:             searchResp.concepts,
        candidatesConsidered: searchResp.total,
        used:                 0,
      };
      return {
        status:    "insufficient_evidence",
        answer:    { blocks: [] },
        sources:   [],
        retrieval,
        meta:      { mode: "DEMO_SCRIPTED", latencyMs: Date.now() - t0 },
      };
    }

    // Build source citations from top matches
    const sources: SourceCitation[] = top3.map((r, i) => ({
      id:             `cite-${i + 1}`,
      title:          r.item.title,
      type:           r.item.type,
      docId:          r.item.id,
      excerpt:        r.item.summary,
      retrievalScore: r.score,
      pageRef:        "Page reference: to be verified",
    }));

    // Stage: composing
    await fireStage("composing", onStage, randMs(450, 700));
    const blocks = buildAnswerBlocks(question, sources, language);

    // Stage: citing
    await fireStage("citing", onStage, randMs(300, 450));

    const retrieval: RetrievalMeta = {
      query:                question,
      concepts:             searchResp.concepts.slice(0, 5),
      candidatesConsidered: searchResp.total,
      used:                 sources.length,
    };

    return {
      status:    "answered",
      answer:    { blocks },
      sources,
      retrieval,
      meta:      { mode: "DEMO_SCRIPTED", latencyMs: Date.now() - t0 },
    };
  },
};
