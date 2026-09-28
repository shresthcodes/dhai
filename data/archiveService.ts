/* ─── Archive Service ────────────────────────────────────────────────────
   Client-side search + filter service backed by static demo JSON.
   No real dates, quotations, statistics or historical claims are used.
   All records are isDemo:true placeholder data.
──────────────────────────────────────────────────────────────────────── */

import type { ArchiveItem } from "./models";
import archiveData from "./archive.json";

// ─── Exported Types ───────────────────────────────────────────────────────────

export interface SearchFilters {
  type?:       string[];
  language?:   string[];
  topic?:      string[];
  collection?: string[];
}

export type SortOption = "relevance" | "title-az" | "type" | "recently-added";

export interface SearchResult {
  item:         ArchiveItem;
  score:        number;        // 0-100, mock relevance
  matchedTerms: string[];
  reason:       string;        // e.g. "Matched topic: rights"
}

export interface SearchResponse {
  results:    SearchResult[];
  total:      number;
  query:      string;
  queryTime:  number;          // simulated ms
  concepts:   string[];        // detected concept chips (top matched terms)
}

// ─── Synonym Map ──────────────────────────────────────────────────────────────

const SYNONYM_MAP: Record<string, string[]> = {
  equality:     ["rights", "justice", "social justice", "equal", "inequality"],
  constitution: ["constitutional", "democracy", "assembly", "drafting", "fundamental"],
  education:    ["learning", "scholarship", "academic", "school", "literacy"],
  speech:       ["address", "lecture", "oration", "public address"],
  manuscript:   ["handwritten", "draft", "original", "typescript"],
  photograph:   ["image", "photo", "portrait", "picture", "visual"],
  law:          ["legal", "legislation", "act", "statute", "rights"],
  social:       ["community", "society", "public", "people"],
};

// ─── loadArchive ──────────────────────────────────────────────────────────────

/**
 * Loads archive items from JSON and validates that every record
 * carries isDemo:true. Throws if any record fails validation.
 */
export function loadArchive(): ArchiveItem[] {
  const items = archiveData as ArchiveItem[];
  for (const item of items) {
    if (item.isDemo !== true) {
      throw new Error(
        `Archive integrity error: record "${item.id}" is missing isDemo:true`
      );
    }
  }
  return items;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

/**
 * Lowercases text, splits on non-word characters, and filters out
 * tokens shorter than 3 characters.
 */
export function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .split(/\W+/)
    .filter((token) => token.length > 2);
}

/**
 * For each token, appends any synonyms found in SYNONYM_MAP.
 * Returns the deduplicated union of original tokens + expansions.
 */
export function getExpandedTerms(tokens: string[]): string[] {
  const expanded = new Set<string>(tokens);
  for (const token of tokens) {
    const synonyms = SYNONYM_MAP[token];
    if (synonyms) {
      for (const syn of synonyms) {
        // Synonyms may be multi-word; add each component token as well
        for (const part of tokenize(syn)) {
          expanded.add(part);
        }
        expanded.add(syn);
      }
    }
  }
  return Array.from(expanded);
}

// ─── scoreItem ────────────────────────────────────────────────────────────────

interface ScoreResult {
  score:        number;
  matchedTerms: string[];
  reason:       string;
}

/**
 * Scores a single ArchiveItem against the query tokens and their expansions.
 *
 * Scoring weights:
 *   Title match    +25 per token
 *   Keyword match  +20 per keyword
 *   Topic match    +15 per topic
 *   Summary match  +10 per token
 *   Synonym match  +8  per expanded term (not in original tokens)
 *
 * Final score is capped at 100.
 */
export function scoreItem(
  item:     ArchiveItem,
  tokens:   string[],
  expanded: string[]
): ScoreResult {
  let score = 0;
  const matched = new Set<string>();
  let primaryReason = "";

  const titleTokens   = tokenize(item.title);
  const summaryTokens = tokenize(item.summary);
  const keywordTokens = item.keywords.map((k) => k.toLowerCase());
  const topicTokens   = item.topic.map((t) => t.toLowerCase());

  // Title matches (+25 each)
  for (const token of tokens) {
    if (titleTokens.includes(token)) {
      score += 25;
      matched.add(token);
      if (!primaryReason) primaryReason = `Matched title: ${token}`;
    }
  }

  // Keyword matches (+20 each)
  for (const token of tokens) {
    for (const kw of keywordTokens) {
      if (kw === token || kw.includes(token)) {
        score += 20;
        matched.add(kw);
        if (!primaryReason) primaryReason = `Matched keyword: ${kw}`;
      }
    }
  }

  // Topic matches (+15 each)
  for (const token of tokens) {
    for (const topic of topicTokens) {
      if (topic === token || topic.includes(token)) {
        score += 15;
        matched.add(topic);
        if (!primaryReason) primaryReason = `Matched topic: ${topic}`;
      }
    }
  }

  // Summary matches (+10 each)
  for (const token of tokens) {
    if (summaryTokens.includes(token)) {
      score += 10;
      matched.add(token);
      if (!primaryReason) primaryReason = "Matched in summary";
    }
  }

  // Synonym / expanded term matches (+8 each) — only for terms not already in original tokens
  const originalSet = new Set(tokens);
  for (const term of expanded) {
    if (originalSet.has(term)) continue; // already counted above
    const termTokens = tokenize(term);
    const hitTitle    = termTokens.some((t) => titleTokens.includes(t));
    const hitKeyword  = keywordTokens.some((k) => termTokens.some((t) => k.includes(t)));
    const hitTopic    = topicTokens.some((tp) => termTokens.some((t) => tp.includes(t)));
    const hitSummary  = termTokens.some((t) => summaryTokens.includes(t));

    if (hitTitle || hitKeyword || hitTopic || hitSummary) {
      score += 8;
      matched.add(term);
      if (!primaryReason) primaryReason = `Matched synonym: ${term}`;
    }
  }

  const finalScore = Math.min(100, score);

  const reason =
    primaryReason ||
    (finalScore > 0 ? "Matched in record" : "No match");

  return {
    score:        finalScore,
    matchedTerms: Array.from(matched),
    reason,
  };
}

// ─── Filter helper ────────────────────────────────────────────────────────────

function applyFilters(items: ArchiveItem[], filters: SearchFilters): ArchiveItem[] {
  return items.filter((item) => {
    if (filters.type && filters.type.length > 0) {
      if (!filters.type.includes(item.type)) return false;
    }
    if (filters.language && filters.language.length > 0) {
      if (!filters.language.includes(item.language)) return false;
    }
    if (filters.topic && filters.topic.length > 0) {
      const hasMatch = filters.topic.some((ft) =>
        item.topic.map((t) => t.toLowerCase()).includes(ft.toLowerCase())
      );
      if (!hasMatch) return false;
    }
    if (filters.collection && filters.collection.length > 0) {
      if (!filters.collection.includes(item.collection)) return false;
    }
    return true;
  });
}

// ─── Sort helper ──────────────────────────────────────────────────────────────

function sortResults(results: SearchResult[], sort: SortOption): SearchResult[] {
  const copy = [...results];
  switch (sort) {
    case "relevance":
      return copy.sort((a, b) => b.score - a.score);
    case "title-az":
      return copy.sort((a, b) => a.item.title.localeCompare(b.item.title));
    case "type":
      return copy.sort((a, b) => a.item.type.localeCompare(b.item.type));
    case "recently-added":
      // Demo data has no real dates; preserve insertion order as a proxy.
      return copy;
    default:
      return copy;
  }
}

// ─── searchArchive ────────────────────────────────────────────────────────────

/**
 * Full-text search across all archive items with optional filtering and sorting.
 * Simulates a 400-700 ms network delay.
 */
export async function searchArchive(
  query:   string,
  filters?: SearchFilters,
  sort:     SortOption = "relevance"
): Promise<SearchResponse> {
  const start = Date.now();

  // Simulated async delay
  await new Promise<void>((r) => setTimeout(r, 400 + Math.random() * 300));

  const archive = loadArchive();
  const tokens  = tokenize(query);
  const expanded = getExpandedTerms(tokens);

  let results: SearchResult[];

  if (tokens.length === 0) {
    // Empty query — return all items with score 0
    results = archive.map((item) => ({
      item,
      score:        0,
      matchedTerms: [],
      reason:       "All records",
    }));
  } else {
    results = archive
      .map((item) => {
        const { score, matchedTerms, reason } = scoreItem(item, tokens, expanded);
        return { item, score, matchedTerms, reason };
      })
      .filter((r) => r.score >= 5);
  }

  // Apply facet filters
  if (filters) {
    const filteredItems = applyFilters(
      results.map((r) => r.item),
      filters
    );
    const filteredIds = new Set(filteredItems.map((i) => i.id));
    results = results.filter((r) => filteredIds.has(r.item.id));
  }

  // Sort
  results = sortResults(results, sort);

  // Extract concept chips: top matched terms across all results, capped at 5
  const termCounts = new Map<string, number>();
  for (const r of results) {
    for (const term of r.matchedTerms) {
      termCounts.set(term, (termCounts.get(term) ?? 0) + 1);
    }
  }
  const concepts = Array.from(termCounts.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([term]) => term);

  const queryTime = Date.now() - start;

  return {
    results,
    total:     results.length,
    query,
    queryTime,
    concepts,
  };
}

// ─── getArchiveItem ───────────────────────────────────────────────────────────

/**
 * Fetches a single archive item by ID.
 * Returns null if not found.
 */
export async function getArchiveItem(id: string): Promise<ArchiveItem | null> {
  const archive = loadArchive();
  return archive.find((item) => item.id === id) ?? null;
}

// ─── getArchiveItems ──────────────────────────────────────────────────────────

/**
 * Returns all archive items, optionally filtered by type/language/topic/collection.
 */
export async function getArchiveItems(
  filters?: SearchFilters
): Promise<ArchiveItem[]> {
  const archive = loadArchive();
  if (!filters) return archive;
  return applyFilters(archive, filters);
}
