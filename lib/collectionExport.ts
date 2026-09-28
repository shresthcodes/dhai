import type { Collection, CollectionItem } from "@/store/collection";

const DEMO_NOTE = "Prototype export — demo data. Verify all details against original sources.";

/* ─── Markdown ────────────────────────────────────────────────────── */
export function exportMarkdown(col: Collection): string {
  const lines: string[] = [
    `# ${col.name}`,
    col.description ? `\n> ${col.description}\n` : "",
    `*Created: ${new Date(col.createdAt).toLocaleDateString()}*`,
    `*Items: ${col.items.length}*`,
    `\n---\n`,
    `> ${DEMO_NOTE}`,
    "\n",
  ];

  const sorted = [...col.items].sort((a, b) => a.order - b.order);
  sorted.forEach((item, i) => {
    lines.push(`## ${i + 1}. ${item.title}`);
    lines.push(`- **Kind:** ${item.kind}`);
    lines.push(`- **ID:** ${item.refId}`);
    lines.push(`- **Added:** ${new Date(item.addedAt).toLocaleDateString()}`);
    if (item.clip) {
      lines.push(`- **Clip:** ${item.clip.startSec}s – ${item.clip.endSec}s`);
    }
    if (item.note) lines.push(`\n**Note:** ${item.note}`);
    lines.push("");
  });

  return lines.join("\n");
}

/* ─── JSON ────────────────────────────────────────────────────────── */
export function exportJSON(col: Collection): string {
  return JSON.stringify({ ...col, _exportNote: DEMO_NOTE }, null, 2);
}

/* ─── Citations ───────────────────────────────────────────────────── */
export function exportCitations(col: Collection): string {
  const lines: string[] = [
    `CITATIONS — ${col.name}`,
    `Exported: ${new Date().toLocaleDateString()}`,
    DEMO_NOTE,
    "─".repeat(60),
    "",
  ];

  [...col.items].sort((a, b) => a.order - b.order).forEach((item, i) => {
    lines.push(`[${i + 1}] ${item.title}`);
    lines.push(`    Type: ${item.kind}`);
    lines.push(`    Reference ID: ${item.refId}`);
    lines.push(`    Date to be verified (demo data)`);
    if (item.note) lines.push(`    Note: ${item.note}`);
    lines.push("");
  });

  return lines.join("\n");
}

/* ─── Download helper ─────────────────────────────────────────────── */
export function downloadFile(content: string, filename: string, mime: string) {
  const blob = new Blob([content], { type: mime });
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement("a");
  a.href = url; a.download = filename; a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

/* ─── Share link ──────────────────────────────────────────────────── */
const MAX_URL_LENGTH = 1800;

export function encodeShareLink(col: Collection): { url: string; error?: string } {
  const payload = JSON.stringify({
    name:  col.name,
    desc:  col.description,
    items: col.items.map((i) => ({ t: i.title, r: i.refId, k: i.kind, n: i.note })),
  });
  const encoded = btoa(encodeURIComponent(payload));
  const url = `${typeof window !== "undefined" ? window.location.origin : ""}/collection/shared#${encoded}`;
  if (url.length > MAX_URL_LENGTH) {
    return { url: "", error: `Collection too large to share as a URL (${col.items.length} items). Try exporting as JSON instead.` };
  }
  return { url };
}

export function decodeShareLink(hash: string): Collection | null {
  try {
    const payload = JSON.parse(decodeURIComponent(atob(hash)));
    const now = new Date().toISOString();
    return {
      id:          "shared-import",
      name:        payload.name ?? "Shared Collection",
      description: payload.desc ?? "",
      createdAt:   now,
      updatedAt:   now,
      items: (payload.items ?? []).map((i: { t?: string; r?: string; k?: string; n?: string }, idx: number) => ({
        id: `si-${idx}`,
        kind: i.k ?? "document",
        refId: i.r ?? "",
        title: i.t ?? "Untitled",
        addedAt: now,
        order: idx,
        note: i.n,
      })),
    };
  } catch {
    return null;
  }
}
