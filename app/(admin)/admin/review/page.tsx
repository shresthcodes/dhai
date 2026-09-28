"use client";

import React, { useState } from "react";
import { CheckCircle, XCircle, RotateCcw, Shield } from "lucide-react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { CapabilityChip } from "@/components/admin/CapabilityChip";
import { useAdminStore } from "@/store/admin/adminStore";
import { GoldRule } from "@/components/ui/GoldRule";
import { useToast } from "@/components/ui/Toast";
import { can } from "@/store/admin/types";
import { cn } from "@/lib/utils";

export default function ReviewPage() {
  const { assets, setLifecycle, currentRole, log } = useAdminStore();
  const { toast } = useToast();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [comment,    setComment]    = useState("");

  const queue   = assets.filter((a) => a.lifecycle === "in-review");
  const selected = queue.find((a) => a.id === selectedId) ?? queue[0];

  // Checklist
  function getChecklist(a: typeof selected) {
    if (!a) return [];
    return [
      { label: "Metadata ≥ 60% complete", ok: a.metadata.completeness >= 60 },
      { label: "Rights note present",     ok: !!a.metadata.rightsNote },
      { label: "OCR validated (if scan)", ok: a.kind !== "scan" || !!a.ocr?.validated },
      { label: "Checksum recorded",       ok: !!a.checksum },
      { label: "Access rights set",       ok: !!a.metadata.accessRights },
    ];
  }

  function handleApprove() {
    if (!selected || !can(currentRole, "approve")) return;
    setLifecycle(selected.id, "approved", currentRole!, comment || "Approved");
    log(currentRole!, "approve", selected.id, comment || "Approved");
    toast("Asset approved", "success");
    setComment("");
    setSelectedId(null);
  }

  function handlePublish() {
    if (!selected || !can(currentRole, "publish")) return;
    setLifecycle(selected.id, "published", currentRole!, comment || "Published to archive");
    log(currentRole!, "publish", selected.id, comment || "Published");
    toast("Published to public archive", "success");
    setComment("");
    setSelectedId(null);
  }

  function handleReject() {
    if (!selected || !can(currentRole, "approve")) return;
    if (!comment) { toast("Please add a rejection reason", "error"); return; }
    setLifecycle(selected.id, "rejected", currentRole!, comment);
    log(currentRole!, "reject", selected.id, comment);
    toast("Asset rejected with reason", "info");
    setComment("");
    setSelectedId(null);
  }

  const checklist = getChecklist(selected);
  const allOk     = checklist.every((c) => c.ok);

  return (
    <AdminLayout>
      <div className="p-6 space-y-5">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <p className="eyebrow text-gold/60">Content Approval</p>
            <h1 className="font-serif text-h2 text-ivory">Review Queue ({queue.length})</h1>
          </div>
          <CapabilityChip status="IMPLEMENTED" />
        </div>

        {queue.length === 0 ? (
          <div className="surface rounded-card p-12 text-center">
            <CheckCircle size={28} strokeWidth={1} className="text-gold/30 mx-auto mb-3" />
            <p className="font-sans text-sm text-ivory/30">No assets awaiting review.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-[240px_1fr] gap-5">
            {/* Queue list */}
            <div className="surface rounded-card p-3 space-y-1 max-h-[70vh] overflow-y-auto">
              {queue.map((a) => (
                <button key={a.id} onClick={() => setSelectedId(a.id)}
                  className={cn("w-full text-left px-3 py-2.5 rounded-sharp font-sans text-xs transition-all focus-visible:outline-gold",
                    selectedId === a.id || (!selectedId && a.id === queue[0]?.id)
                      ? "bg-gold/10 text-gold"
                      : "text-ivory/50 hover:bg-white/5"
                  )}>
                  <p className="truncate">{a.metadata.title}</p>
                  <p className="text-[0.6rem] text-ivory/25 mt-0.5 capitalize">{a.kind} · {a.metadata.completeness}%</p>
                </button>
              ))}
            </div>

            {/* Review workspace */}
            {selected && (
              <div className="surface rounded-card p-5 space-y-5">
                <div>
                  <h2 className="font-serif text-h3 text-ivory">{selected.metadata.title}</h2>
                  <p className="font-sans text-caption text-ivory/40 mt-0.5">
                    {selected.kind} · {selected.metadata.language.toUpperCase()} · {selected.metadata.collection}
                  </p>
                </div>
                <GoldRule width="full" />

                {/* Summary */}
                <div className="grid grid-cols-2 gap-3 text-sm">
                  {[
                    ["Type",       selected.metadata.type],
                    ["Language",   selected.metadata.language.toUpperCase()],
                    ["Access",     selected.metadata.accessRights],
                    ["Date",       selected.metadata.date ?? "Date to be verified"],
                    ["Source",     selected.metadata.source],
                    ["Completeness", `${selected.metadata.completeness}%`],
                  ].map(([k, v]) => (
                    <div key={k}>
                      <p className="font-sans text-[0.65rem] text-ivory/30 uppercase tracking-wider">{k}</p>
                      <p className="font-sans text-[0.8rem] text-ivory/65">{v}</p>
                    </div>
                  ))}
                </div>

                {/* Checklist */}
                <div className="space-y-2">
                  <p className="font-sans text-sm font-semibold text-ivory/50">Review checklist</p>
                  {checklist.map(({ label, ok }) => (
                    <div key={label} className="flex items-center gap-2">
                      {ok
                        ? <CheckCircle size={13} strokeWidth={1.5} className="text-gold/70 shrink-0" />
                        : <XCircle    size={13} strokeWidth={1.5} className="text-terracotta/60 shrink-0" />
                      }
                      <span className={cn("font-sans text-xs", ok ? "text-ivory/60" : "text-ivory/35")}>{label}</span>
                    </div>
                  ))}
                </div>

                {/* Checksum */}
                {selected.checksum && (
                  <div className="flex items-center gap-2 px-3 py-2 rounded-sharp border border-gold/20 bg-gold/4">
                    <Shield size={12} strokeWidth={1.5} className="text-gold/60 shrink-0" />
                    <span className="font-sans text-[0.68rem] text-ivory/50">
                      SHA-256: <span className="font-mono text-[0.6rem] text-gold/60">{selected.checksum.hex.slice(0, 24)}…</span>
                    </span>
                    <CapabilityChip status="IMPLEMENTED" />
                  </div>
                )}

                {/* Comment */}
                <div>
                  <label className="eyebrow text-[0.55rem] text-ivory/30 block mb-1">Comment / reason</label>
                  <textarea value={comment} onChange={(e) => setComment(e.target.value)} rows={2}
                    className="w-full bg-panel border border-[rgba(244,237,224,0.1)] rounded-sharp px-3 py-2 font-sans text-sm text-ivory/70 outline-none resize-none focus:border-gold/30"
                    aria-label="Review comment or rejection reason" />
                </div>

                {/* Actions */}
                <div className="flex gap-2 flex-wrap">
                  {can(currentRole, "approve") && (
                    <button onClick={handleApprove} disabled={!allOk}
                      className="flex items-center gap-1.5 px-4 py-2 bg-gold text-ink rounded-sharp font-sans text-sm font-semibold disabled:opacity-35 hover:bg-gold-soft transition-colors focus-visible:outline-gold"
                      aria-disabled={!allOk}
                      title={!allOk ? "Complete checklist before approving" : "Approve"}
                    >
                      <CheckCircle size={13} strokeWidth={1.5} />Approve
                    </button>
                  )}
                  {can(currentRole, "publish") && (
                    <button onClick={handlePublish} disabled={!allOk}
                      className="flex items-center gap-1.5 px-4 py-2 bg-azure text-white rounded-sharp font-sans text-sm font-semibold disabled:opacity-35 hover:bg-azure/80 transition-colors focus-visible:outline-gold"
                      aria-disabled={!allOk}
                    >
                      Approve & Publish
                    </button>
                  )}
                  {can(currentRole, "approve") && (
                    <button onClick={handleReject}
                      className="flex items-center gap-1.5 px-4 py-2 border border-terracotta/30 text-terracotta/70 rounded-sharp font-sans text-sm hover:border-terracotta/50 transition-colors focus-visible:outline-gold"
                    >
                      <XCircle size={13} strokeWidth={1.5} />Reject
                    </button>
                  )}
                </div>
                <p className="font-sans text-[0.62rem] text-ivory/20">All decisions are logged to the activity log.</p>
              </div>
            )}
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
