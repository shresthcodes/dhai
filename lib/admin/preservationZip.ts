/* ─── Preservation Package Export (BagIt-inspired prototype) ─────────
   IMPLEMENTED in this prototype: creates a ZIP with originals,
   metadata JSON and a SHA-256 manifest.
   PLANNED: real BagIt compliance, geo-redundant backup, encryption.
────────────────────────────────────────────────────────────────── */

import type { AdminAsset } from "@/store/admin/types";

const DEMO_NOTE =
  "Prototype export — BagIt-inspired structure.\n" +
  "Not a certified preservation package.\n" +
  "Production implementation planned (Phase 4).\n";

export async function buildPreservationZip(assets: AdminAsset[]): Promise<Blob> {
  const { zip } = await import("fflate");

  const files: Record<string, Uint8Array> = {};
  const enc = new TextEncoder();

  // bagit.txt style notice
  files["bagit-notice.txt"] = enc.encode(DEMO_NOTE);

  // Metadata for each asset
  const allMeta: Record<string, object> = {};
  let manifest = "# SHA-256 Manifest (prototype)\n# Format: <hash>  <path>\n";

  for (const asset of assets) {
    const metaJson = JSON.stringify({ ...asset.metadata, id: asset.id, kind: asset.kind }, null, 2);
    const metaPath = `metadata/${asset.id}.json`;
    files[metaPath] = enc.encode(metaJson);

    if (asset.checksum) {
      manifest += `${asset.checksum.hex}  ${asset.fileName}\n`;
    }
    allMeta[asset.id] = asset.metadata;
  }

  // Combined metadata
  files["metadata/all-metadata.json"] = enc.encode(JSON.stringify(allMeta, null, 2));

  // Manifest
  files["manifest-sha256.txt"] = enc.encode(manifest);

  // Readme
  files["README.txt"] = enc.encode(
    "DHAI Preservation Package (Prototype)\n" +
    "=====================================\n" +
    `Generated: ${new Date().toISOString()}\n` +
    `Assets: ${assets.length}\n\n` +
    DEMO_NOTE +
    "\nFiles:\n" +
    "  manifest-sha256.txt  — SHA-256 checksums of original files\n" +
    "  metadata/            — JSON metadata per asset\n" +
    "  bagit-notice.txt     — package notice\n"
  );

  return new Promise<Blob>((resolve, reject) => {
    zip(files, (err, data) => {
      if (err) reject(err);
      else resolve(new Blob([data], { type: "application/zip" }));
    });
  });
}

export function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 2000);
}
