"use client";

import React, { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { CapabilityChip } from "@/components/admin/CapabilityChip";
import { useAdminStore } from "@/store/admin/adminStore";
import { GoldRule } from "@/components/ui/GoldRule";
import { useToast } from "@/components/ui/Toast";
import { can } from "@/store/admin/types";
import { Suspense } from "react";

const TYPES     = ["writing","speech","manuscript","debate","photograph","record","audio","video"];
const LANGS     = ["en","hi","mr","gu"];
const COLLS     = ["Demo Collection A","Demo Collection B","Demo Collection C"];
const TOPICS    = ["social rights","education","constitutional assembly","equality","legal framework","public address"];
const ACCESS    = ["open","restricted","staff-only"] as const;

function MetadataContent() {
  const params = useSearchParams();
  const { assets, updateMetadata, setLifecycle, currentRole, log } = useAdminStore();
  const { toast } = useToast();

  const targetId = params.get("id");
  const [selectedId, setSelectedId] = useState(targetId ?? assets[0]?.id ?? "");
  const asset = assets.find((a) => a.id === selectedId);
  const [form, setForm] = useState(asset?.metadata ?? {
    documentId: "", title: "", date: null as null | string, language: "en",
    type: "writing", topic: [] as string[], collection: "", source: "", keywords: [] as string[],
    accessRights: "open" as const, rightsNote: "", provenanceNote: "", completeness: 0,
  });

  useEffect(() => {
    if (asset) setForm(asset.metadata);
  }, [selectedId, asset?.id]);

  function handleChange<K extends keyof typeof form>(key: K, val: (typeof form)[K]) {
    setForm((f) => ({ ...f, [key]: val }));
  }

  function handleSave() {
    updateMetadata(selectedId, form);
    log(currentRole!, "edit-metadata", selectedId, "Metadata updated");
    toast("Metadata saved", "success");
  }

  function handleSendReview() {
    updateMetadata(selectedId, form);
    setLifecycle(selectedId, "in-review", currentRole!, "Sent to review after metadata edit");
    toast("Sent to review queue", "success");
  }

  const completeness = form.completeness;

  return (
    <div className="p-6 space-y-5">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <p className="eyebrow text-gold/60">Metadata Management</p>
          <h1 className="font-serif text-h2 text-ivory">Edit Metadata</h1>
        </div>
        <CapabilityChip status="IMPLEMENTED" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[220px_1fr_240px] gap-5">
        {/* Asset list */}
        <div className="surface rounded-card p-3 space-y-1 max-h-[70vh] overflow-y-auto">
          <p className="eyebrow text-[0.55rem] text-ivory/30 px-1 mb-2">Assets</p>
          {assets.map((a) => (
            <button key={a.id} onClick={() => setSelectedId(a.id)}
              className={`w-full text-left px-2.5 py-2 rounded-sharp font-sans text-xs transition-all focus-visible:outline-gold ${
                selectedId === a.id ? "bg-gold/10 text-gold" : "text-ivory/50 hover:bg-white/5"
              }`}
            >
              <p className="truncate">{a.metadata.title}</p>
              <p className="text-[0.6rem] text-ivory/25 mt-0.5">{a.metadata.completeness}% complete</p>
            </button>
          ))}
        </div>

        {/* Form */}
        {asset && (
          <div className="surface rounded-card p-5 space-y-4">
            <GoldRule width="full" />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Document ID */}
              <div>
                <label className="eyebrow text-[0.55rem] text-ivory/35 block mb-1">Document ID</label>
                <input value={form.documentId} readOnly
                  className="w-full bg-panel border border-[rgba(244,237,224,0.1)] rounded-sharp px-3 py-2 font-sans text-sm text-ivory/50 outline-none cursor-not-allowed"
                  aria-label="Document ID (auto-generated)" />
              </div>
              {/* Title */}
              <div>
                <label className="eyebrow text-[0.55rem] text-ivory/35 block mb-1">Title *</label>
                <input value={form.title} onChange={(e) => handleChange("title", e.target.value)}
                  className="w-full bg-panel border border-[rgba(244,237,224,0.1)] rounded-sharp px-3 py-2 font-sans text-sm text-ivory/70 outline-none focus:border-gold/30"
                  aria-label="Title" aria-required="true" />
              </div>
              {/* Date */}
              <div>
                <label className="eyebrow text-[0.55rem] text-ivory/35 block mb-1">Date</label>
                <input
                  value={form.date ?? ""}
                  onChange={(e) => handleChange("date", e.target.value || null)}
                  placeholder="Date to be verified"
                  className="w-full bg-panel border border-[rgba(244,237,224,0.1)] rounded-sharp px-3 py-2 font-sans text-sm text-ivory/70 outline-none focus:border-gold/30 placeholder:text-ivory/20"
                  aria-label="Date (leave blank if unknown)" />
              </div>
              {/* Language */}
              <div>
                <label className="eyebrow text-[0.55rem] text-ivory/35 block mb-1">Language *</label>
                <select value={form.language} onChange={(e) => handleChange("language", e.target.value)}
                  className="w-full bg-panel border border-[rgba(244,237,224,0.1)] rounded-sharp px-3 py-2 font-sans text-sm text-ivory/70 outline-none focus:border-gold/30"
                  aria-label="Language" aria-required="true">
                  {LANGS.map((l) => <option key={l} value={l}>{l.toUpperCase()}</option>)}
                </select>
              </div>
              {/* Type */}
              <div>
                <label className="eyebrow text-[0.55rem] text-ivory/35 block mb-1">Type *</label>
                <select value={form.type} onChange={(e) => handleChange("type", e.target.value)}
                  className="w-full bg-panel border border-[rgba(244,237,224,0.1)] rounded-sharp px-3 py-2 font-sans text-sm text-ivory/70 outline-none focus:border-gold/30"
                  aria-label="Document type" aria-required="true">
                  {TYPES.map((t) => <option key={t} value={t} className="capitalize">{t}</option>)}
                </select>
              </div>
              {/* Collection */}
              <div>
                <label className="eyebrow text-[0.55rem] text-ivory/35 block mb-1">Collection *</label>
                <select value={form.collection} onChange={(e) => handleChange("collection", e.target.value)}
                  className="w-full bg-panel border border-[rgba(244,237,224,0.1)] rounded-sharp px-3 py-2 font-sans text-sm text-ivory/70 outline-none focus:border-gold/30"
                  aria-label="Collection" aria-required="true">
                  {COLLS.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              {/* Access rights */}
              <div>
                <label className="eyebrow text-[0.55rem] text-ivory/35 block mb-1">Access Rights *</label>
                <select value={form.accessRights} onChange={(e) => handleChange("accessRights", e.target.value as typeof form.accessRights)}
                  className="w-full bg-panel border border-[rgba(244,237,224,0.1)] rounded-sharp px-3 py-2 font-sans text-sm text-ivory/70 outline-none focus:border-gold/30"
                  aria-label="Access rights" aria-required="true">
                  {ACCESS.map((a) => <option key={a} value={a}>{a}</option>)}
                </select>
              </div>
              {/* Source */}
              <div>
                <label className="eyebrow text-[0.55rem] text-ivory/35 block mb-1">Source</label>
                <input value={form.source} onChange={(e) => handleChange("source", e.target.value)}
                  className="w-full bg-panel border border-[rgba(244,237,224,0.1)] rounded-sharp px-3 py-2 font-sans text-sm text-ivory/70 outline-none focus:border-gold/30"
                  aria-label="Source" />
              </div>
            </div>
            {/* Notes */}
            {(["rightsNote","provenanceNote"] as const).map((field) => (
              <div key={field}>
                <label className="eyebrow text-[0.55rem] text-ivory/35 block mb-1">{field === "rightsNote" ? "Rights Note" : "Provenance Note"}</label>
                <textarea value={form[field]} onChange={(e) => handleChange(field, e.target.value)} rows={2}
                  className="w-full bg-panel border border-[rgba(244,237,224,0.1)] rounded-sharp px-3 py-2 font-sans text-sm text-ivory/70 outline-none resize-none focus:border-gold/30"
                  aria-label={field === "rightsNote" ? "Rights note" : "Provenance note"} />
              </div>
            ))}

            <div className="flex gap-2 flex-wrap">
              {can(currentRole, "edit_metadata") && (
                <button onClick={handleSave}
                  className="px-4 py-2 bg-gold text-ink rounded-sharp font-sans text-sm font-semibold hover:bg-gold-soft transition-colors focus-visible:outline-gold">
                  Save
                </button>
              )}
              {can(currentRole, "approve") && (
                <button onClick={handleSendReview}
                  className="px-4 py-2 bg-panel border border-[rgba(244,237,224,0.12)] text-ivory/60 rounded-sharp font-sans text-sm hover:border-gold/30 transition-colors focus-visible:outline-gold">
                  Save & send to review
                </button>
              )}
            </div>
          </div>
        )}

        {/* Side card */}
        <div className="space-y-4">
          {/* Completeness meter */}
          <div className="surface rounded-card p-4 space-y-3">
            <p className="font-sans text-sm font-semibold text-ivory/60">Completeness</p>
            <div className="space-y-1.5">
              <div className="flex justify-between">
                <span className="font-sans text-[0.68rem] text-ivory/40">Metadata quality</span>
                <span className="font-sans text-[0.68rem] text-gold">{completeness}%</span>
              </div>
              <div className="h-2 bg-panel rounded-full overflow-hidden">
                <div className="h-full rounded-full transition-all duration-500"
                  style={{
                    width: `${completeness}%`,
                    background: completeness >= 80 ? "#C9A24B" : completeness >= 50 ? "#4C7FB8" : "#B5573A",
                  }}
                />
              </div>
              <p className="font-sans text-[0.62rem] text-ivory/25 italic">
                {completeness < 60 ? "Complete all required fields." : completeness < 80 ? "Almost complete." : "Good quality."}
              </p>
            </div>
          </div>

          {/* Why metadata matters */}
          <div className="surface rounded-card p-4 space-y-2">
            <p className="font-sans text-sm font-semibold text-ivory/50">Why metadata matters</p>
            <GoldRule width="full" />
            {[
              { k: "Search",       v: "Enables full-text and semantic search." },
              { k: "Discovery",    v: "Surfaces items to researchers." },
              { k: "Preservation", v: "Provides context for long-term stewardship." },
              { k: "Management",   v: "Tracks lifecycle and access rights." },
            ].map(({ k, v }) => (
              <div key={k}>
                <p className="font-sans text-[0.7rem] font-semibold text-ivory/60">{k}</p>
                <p className="font-sans text-[0.65rem] text-ivory/35">{v}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function MetadataPage() {
  return (
    <AdminLayout>
      <Suspense fallback={<div className="p-6 text-ivory/30 font-sans text-sm">Loading…</div>}>
        <MetadataContent />
      </Suspense>
    </AdminLayout>
  );
}
