"use client";

import React, { useState, useRef } from "react";
import { Upload, Search, ChevronUp, ChevronDown, X, Eye, Shield } from "lucide-react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { CapabilityChip } from "@/components/admin/CapabilityChip";
import { useAdminStore } from "@/store/admin/adminStore";
import { can, type AssetLifecycle } from "@/store/admin/types";
import { sha256File } from "@/lib/admin/checksum";
import { GoldRule } from "@/components/ui/GoldRule";
import { useToast } from "@/components/ui/Toast";
import { cn } from "@/lib/utils";
import Link from "next/link";

const LIFECYCLE_COLORS: Record<string, string> = {
  uploaded:   "text-ivory/50 border-ivory/15",
  "ocr-queued":"text-azure/70 border-azure/30",
  "ocr-done": "text-azure/60 border-azure/25",
  "in-review":"text-gold/70 border-gold/30",
  approved:   "text-gold/80 border-gold/40",
  published:  "text-gold border-gold/60 bg-gold/8",
  rejected:   "text-terracotta/70 border-terracotta/30",
};

function UploadDialog({ onClose, role }: { onClose: () => void; role: string }) {
  const [file,     setFile]     = useState<File | null>(null);
  const [progress, setProgress] = useState(0);
  const [checksum, setChecksum] = useState("");
  const [done,     setDone]     = useState(false);
  const { addAsset, log } = useAdminStore();
  const { toast } = useToast();
  const dropRef = useRef<HTMLDivElement>(null);

  async function handleFile(f: File) {
    setFile(f);
    setProgress(20);
    const hex = await sha256File(f);
    setProgress(80);
    setChecksum(hex);
    setProgress(100);
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    const f = e.dataTransfer.files[0];
    if (f) handleFile(f);
  }

  async function handleUpload() {
    if (!file || !checksum) return;
    const kind = file.type.startsWith("audio") ? "audio"
      : file.type.startsWith("video") ? "video"
      : file.type.startsWith("image") ? "scan"
      : "document";

    addAsset({
      kind, fileName: file.name, mime: file.type, sizeBytes: file.size,
      uploadedAt: new Date().toISOString(), uploadedBy: role as import("@/store/admin/types").AdminRole,
      blobKey: null,
      checksum: { algo: "SHA-256", hex: checksum, computedAt: new Date().toISOString() },
      lifecycle: "uploaded",
      metadata: {
        documentId: `adm-${Date.now()}`, title: file.name.replace(/\.[^.]+$/, ""),
        date: null, language: "en", type: kind, topic: [], collection: "Demo Collection A",
        source: "Demo source — not verified", keywords: [],
        accessRights: "open", rightsNote: "", provenanceNote: "", completeness: 20,
      },
      history: [{ at: new Date().toISOString(), role: role as import("@/store/admin/types").AdminRole, action: "uploaded", detail: file.name }],
      isDemo: false,
    });
    log(role as import("@/store/admin/types").AdminRole, "upload", "new", `Uploaded ${file.name}`);
    toast(`Uploaded ${file.name} · SHA-256 computed`, "success");
    setDone(true);
    setTimeout(onClose, 1200);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
      <div className="glass rounded-card p-6 w-full max-w-md space-y-4" role="dialog" aria-label="Upload asset">
        <div className="flex items-center justify-between">
          <p className="font-serif text-h3 text-ivory">Upload Asset</p>
          <button onClick={onClose} className="text-ivory/40 hover:text-ivory/70 focus-visible:outline-gold p-1"><X size={16} strokeWidth={1.5} /></button>
        </div>
        <GoldRule width="full" />

        {/* Drop zone */}
        <div ref={dropRef} onDragOver={(e) => e.preventDefault()} onDrop={handleDrop}
          className="border-2 border-dashed border-[rgba(244,237,224,0.15)] rounded-card p-8 text-center hover:border-gold/30 transition-colors cursor-pointer"
          onClick={() => document.getElementById("file-input")?.click()}
        >
          <Upload size={24} strokeWidth={1} className="text-ivory/20 mx-auto mb-3" />
          <p className="font-sans text-sm text-ivory/50">{file ? file.name : "Drag & drop or click to select"}</p>
          <p className="font-sans text-[0.65rem] text-ivory/25 mt-1">Images, PDFs, Audio, Video · Max 50MB</p>
          <input id="file-input" type="file" className="sr-only" onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f); }} />
        </div>

        {/* Progress */}
        {file && (
          <div className="space-y-2">
            <div className="h-1 bg-panel rounded-full overflow-hidden">
              <div className="h-full bg-gold/60 transition-all" style={{ width: `${progress}%` }} />
            </div>
            {checksum && (
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <Shield size={11} strokeWidth={1.5} className="text-gold/60 shrink-0" />
                  <p className="font-sans text-[0.68rem] text-ivory/50">SHA-256 computed</p>
                  <CapabilityChip status="IMPLEMENTED" />
                </div>
                <p className="font-mono text-[0.6rem] text-ivory/35 break-all">{checksum}</p>
              </div>
            )}
          </div>
        )}

        <button
          onClick={handleUpload}
          disabled={!file || !checksum || done}
          className="w-full py-2.5 bg-gold text-ink font-sans font-semibold text-sm rounded-card disabled:opacity-40 hover:bg-gold-soft transition-colors focus-visible:outline-gold"
        >
          {done ? "Uploaded ✓" : "Upload & record checksum"}
        </button>
      </div>
    </div>
  );
}

export default function AssetsPage() {
  const { assets, currentRole, setLifecycle, log } = useAdminStore();
  const [uploadOpen,   setUploadOpen]   = useState(false);
  const [search,       setSearch]       = useState("");
  const [filterLC,     setFilterLC]     = useState("");
  const [selected,     setSelected]     = useState<Set<string>>(new Set());
  const [sortCol,      setSortCol]      = useState<string>("uploadedAt");
  const [sortDir,      setSortDir]      = useState<"asc" | "desc">("desc");
  const { toast } = useToast();

  const filtered = assets
    .filter((a) => !search || a.metadata.title.toLowerCase().includes(search.toLowerCase()) || a.fileName.toLowerCase().includes(search.toLowerCase()))
    .filter((a) => !filterLC || a.lifecycle === filterLC)
    .sort((a, b) => {
      const va = sortCol === "title" ? a.metadata.title : a.uploadedAt;
      const vb = sortCol === "title" ? b.metadata.title : b.uploadedAt;
      return sortDir === "asc" ? va.localeCompare(vb) : vb.localeCompare(va);
    });

  function toggleSort(col: string) {
    if (sortCol === col) setSortDir((d) => d === "asc" ? "desc" : "asc");
    else { setSortCol(col); setSortDir("asc"); }
  }

  function SortIcon({ col }: { col: string }) {
    if (sortCol !== col) return null;
    return sortDir === "asc" ? <ChevronUp size={10} strokeWidth={2} /> : <ChevronDown size={10} strokeWidth={2} />;
  }

  function handleBulkLifecycle(lc: AssetLifecycle) {
    selected.forEach((id) => {
      setLifecycle(id, lc, currentRole!, `Bulk action: ${lc}`);
      log(currentRole!, `bulk-${lc}`, id, "Bulk lifecycle change");
    });
    toast(`${selected.size} assets → ${lc}`, "success");
    setSelected(new Set());
  }

  return (
    <AdminLayout>
      <div className="p-6 space-y-5">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <p className="eyebrow text-gold/60">Archive Management</p>
            <h1 className="font-serif text-h2 text-ivory">Assets</h1>
          </div>
          {can(currentRole, "upload") && (
            <button onClick={() => setUploadOpen(true)}
              className="flex items-center gap-2 px-4 py-2.5 bg-gold text-ink rounded-card font-sans text-sm font-semibold hover:bg-gold-soft transition-colors focus-visible:outline-gold"
            >
              <Upload size={14} strokeWidth={1.5} />Upload
            </button>
          )}
        </div>

        {/* Filters */}
        <div className="flex gap-3 flex-wrap">
          <div className="flex items-center gap-1.5 bg-panel border border-[rgba(244,237,224,0.1)] rounded-sharp px-3 py-2 flex-1 min-w-[200px]">
            <Search size={12} strokeWidth={1.5} className="text-ivory/30 shrink-0" />
            <input type="search" value={search} onChange={(e) => setSearch(e.target.value)}
              placeholder="Search assets…" className="flex-1 bg-transparent font-sans text-sm text-ivory/70 outline-none placeholder:text-ivory/20"
              aria-label="Search assets" />
          </div>
          <select value={filterLC} onChange={(e) => setFilterLC(e.target.value)}
            className="bg-panel border border-[rgba(244,237,224,0.1)] rounded-sharp px-3 py-2 font-sans text-sm text-ivory/60 outline-none focus:border-gold/30"
            aria-label="Filter by lifecycle"
          >
            <option value="">All stages</option>
            {["uploaded","ocr-queued","ocr-done","in-review","approved","published","rejected"].map((lc) => (
              <option key={lc} value={lc}>{lc}</option>
            ))}
          </select>
        </div>

        {/* Bulk actions */}
        {selected.size > 0 && (
          <div className="flex items-center gap-3 px-4 py-2 glass rounded-card">
            <span className="font-sans text-xs text-ivory/50">{selected.size} selected</span>
            {can(currentRole, "approve") && (
              <button onClick={() => handleBulkLifecycle("approved")} className="font-sans text-xs text-gold/70 hover:text-gold focus-visible:outline-gold">→ Approve</button>
            )}
            {can(currentRole, "approve") && (
              <button onClick={() => handleBulkLifecycle("rejected")} className="font-sans text-xs text-terracotta/60 hover:text-terracotta focus-visible:outline-gold">→ Reject</button>
            )}
            <button onClick={() => setSelected(new Set())} className="font-sans text-xs text-ivory/30 hover:text-ivory/60 ml-auto focus-visible:outline-gold">Clear</button>
          </div>
        )}

        {/* Table */}
        <div className="surface rounded-card overflow-hidden border border-[rgba(244,237,224,0.08)]">
          <div className="overflow-x-auto">
            <table className="w-full" role="table" aria-label="Archive assets">
              <thead>
                <tr className="border-b border-[rgba(244,237,224,0.08)] bg-[rgba(244,237,224,0.02)]">
                  <th className="px-3 py-2.5 w-10 text-left">
                    <input type="checkbox"
                      checked={selected.size === filtered.length && filtered.length > 0}
                      onChange={(e) => setSelected(e.target.checked ? new Set(filtered.map((a) => a.id)) : new Set())}
                      className="accent-gold" aria-label="Select all" />
                  </th>
                  {[
                    { col: "title", label: "Title" },
                    { col: "kind",  label: "Kind" },
                    { col: "lifecycle", label: "Status" },
                    { col: "completeness", label: "Metadata %" },
                    { col: "checksum", label: "Checksum" },
                    { col: "uploadedAt", label: "Uploaded" },
                  ].map(({ col, label }) => (
                    <th key={col}
                      className="px-3 py-2.5 text-left font-sans text-[0.68rem] text-ivory/40 uppercase tracking-wider cursor-pointer hover:text-ivory/70 select-none focus-visible:outline-gold"
                      onClick={() => toggleSort(col)}
                      scope="col"
                      aria-sort={sortCol === col ? (sortDir === "asc" ? "ascending" : "descending") : "none"}
                    >
                      <span className="flex items-center gap-1">{label}<SortIcon col={col} /></span>
                    </th>
                  ))}
                  <th className="px-3 py-2.5 text-left font-sans text-[0.68rem] text-ivory/40 uppercase tracking-wider" scope="col">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[rgba(244,237,224,0.05)]">
                {filtered.map((asset) => (
                  <tr key={asset.id} className="hover:bg-white/3 transition-colors">
                    <td className="px-3 py-2.5">
                      <input type="checkbox" checked={selected.has(asset.id)}
                        onChange={(e) => {
                          const next = new Set(selected);
                          e.target.checked ? next.add(asset.id) : next.delete(asset.id);
                          setSelected(next);
                        }}
                        className="accent-gold" aria-label={`Select ${asset.metadata.title}`} />
                    </td>
                    <td className="px-3 py-2.5">
                      <p className="font-sans text-sm text-ivory/75 truncate max-w-[200px]">{asset.metadata.title}</p>
                      <p className="font-sans text-[0.62rem] text-ivory/30">{asset.fileName}</p>
                    </td>
                    <td className="px-3 py-2.5">
                      <span className="font-sans text-[0.65rem] text-ivory/50 capitalize">{asset.kind}</span>
                    </td>
                    <td className="px-3 py-2.5">
                      <span className={cn("eyebrow text-[0.55rem] px-1.5 py-0.5 rounded-sharp border", LIFECYCLE_COLORS[asset.lifecycle] ?? "text-ivory/40 border-ivory/15")}>
                        {asset.lifecycle}
                      </span>
                    </td>
                    <td className="px-3 py-2.5">
                      <div className="flex items-center gap-1.5">
                        <div className="w-16 h-1 bg-panel rounded-full overflow-hidden">
                          <div className="h-full bg-gold/50 rounded-full" style={{ width: `${asset.metadata.completeness}%` }} />
                        </div>
                        <span className="font-sans text-[0.62rem] text-ivory/35">{asset.metadata.completeness}%</span>
                      </div>
                    </td>
                    <td className="px-3 py-2.5">
                      {asset.checksum
                        ? <span className="font-sans text-[0.62rem] text-gold/60">✓ SHA-256</span>
                        : <span className="font-sans text-[0.62rem] text-terracotta/50">None</span>
                      }
                    </td>
                    <td className="px-3 py-2.5 font-sans text-[0.65rem] text-ivory/35 tabular-nums">
                      {new Date(asset.uploadedAt).toLocaleDateString()}
                    </td>
                    <td className="px-3 py-2.5">
                      <Link href={`/admin/metadata?id=${asset.id}`}
                        className="p-1 text-ivory/30 hover:text-gold transition-colors focus-visible:outline-gold rounded-sharp"
                        aria-label={`Edit metadata for ${asset.metadata.title}`}
                      >
                        <Eye size={13} strokeWidth={1.5} />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {filtered.length === 0 && (
            <div className="py-12 text-center">
              <p className="font-sans text-sm text-ivory/25">No assets match your filters.</p>
            </div>
          )}
        </div>
        <p className="font-sans text-[0.65rem] text-ivory/20">Showing {filtered.length} of {assets.length} assets</p>
      </div>
      {uploadOpen && currentRole && <UploadDialog onClose={() => setUploadOpen(false)} role={currentRole} />}
    </AdminLayout>
  );
}
