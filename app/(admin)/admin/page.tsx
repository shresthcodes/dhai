"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { Upload, ScanLine, CheckCircle, Globe, AlertCircle, ArrowRight } from "lucide-react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { CapabilityChip } from "@/components/admin/CapabilityChip";
import { useAdminStore, computeStats } from "@/store/admin/adminStore";
import { can } from "@/store/admin/types";
import { GoldRule } from "@/components/ui/GoldRule";
import Link from "next/link";

const LIFECYCLE_ORDER = [
  { key: "uploaded",   label: "Uploaded" },
  { key: "ocr-queued", label: "OCR Queue" },
  { key: "ocr-done",   label: "OCR Done" },
  { key: "in-review",  label: "In Review" },
  { key: "approved",   label: "Approved" },
  { key: "published",  label: "Published" },
];

function StatCard({ label, value, sub, color = "text-gold" }: {
  label: string; value: number | string; sub?: string; color?: string;
}) {
  return (
    <div className="surface rounded-card p-5 space-y-1 border border-[rgba(244,237,224,0.08)]">
      <p className="eyebrow text-[0.55rem] text-ivory/35">{label}</p>
      <p className={`font-serif text-[2rem] leading-none ${color}`}>{value}</p>
      {sub && <p className="font-sans text-[0.68rem] text-ivory/30">{sub}</p>}
    </div>
  );
}

export default function AdminOverviewPage() {
  const { assets, activity, currentRole } = useAdminStore();
  const stats = computeStats(assets);
  const router = useRouter();

  const needsAttention = assets.filter((a) =>
    a.metadata.completeness < 60 || !a.checksum || (a.lifecycle === "ocr-done" && !a.ocr?.validated)
  ).slice(0, 5);

  return (
    <AdminLayout>
      <div className="p-6 space-y-8">
        {/* Header */}
        <div>
          <p className="eyebrow text-gold/60">Archive Overview</p>
          <h1 className="font-serif text-h2 text-ivory mt-1">Dashboard</h1>
          <GoldRule width="sm" className="mt-2" />
        </div>

        {/* Stat cards */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          <StatCard label="Total assets"   value={stats.total}           color="text-ivory" />
          <StatCard label="OCR queue"      value={stats.ocrQueue}        color="text-azure" />
          <StatCard label="Needs metadata" value={stats.needsMeta}       color="text-terracotta" />
          <StatCard label="In review"      value={stats.awaitingReview}  color="text-gold" />
          <StatCard label="Published"      value={stats.published}       color="text-gold" />
          <StatCard label="No checksum"    value={stats.noChecksum}      color="text-terracotta/70" />
        </div>

        {/* Workflow funnel */}
        <div className="surface rounded-card p-5 space-y-4">
          <div className="flex items-center justify-between">
            <p className="font-sans text-sm font-semibold text-ivory/60">Workflow Funnel</p>
            <CapabilityChip status="IMPLEMENTED" />
          </div>
          <div className="flex items-center gap-1 overflow-x-auto pb-2">
            {LIFECYCLE_ORDER.map((stage, i) => {
              const count = stats.byLifecycle[stage.key] ?? 0;
              return (
                <React.Fragment key={stage.key}>
                  <Link
                    href={`/admin/assets?lifecycle=${stage.key}`}
                    className="flex flex-col items-center min-w-[80px] p-3 rounded-card hover:bg-white/5 transition-colors focus-visible:outline-gold"
                  >
                    <span className={`font-serif text-[1.5rem] leading-none ${count > 0 ? "text-gold" : "text-ivory/25"}`}>
                      {count}
                    </span>
                    <span className="font-sans text-[0.62rem] text-ivory/40 mt-1 text-center">{stage.label}</span>
                  </Link>
                  {i < LIFECYCLE_ORDER.length - 1 && (
                    <ArrowRight size={12} strokeWidth={1.5} className="text-ivory/15 shrink-0" />
                  )}
                </React.Fragment>
              );
            })}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {/* Needs attention */}
          <div className="surface rounded-card p-5 space-y-3">
            <p className="font-sans text-sm font-semibold text-ivory/60">Needs attention</p>
            {needsAttention.length === 0 ? (
              <p className="font-sans text-caption text-ivory/25 italic">All assets are in good shape.</p>
            ) : (
              <div className="space-y-2">
                {needsAttention.map((a) => (
                  <Link key={a.id} href={`/admin/assets?id=${a.id}`}
                    className="flex items-start gap-2 p-2.5 rounded-sharp hover:bg-white/5 transition-colors focus-visible:outline-gold"
                  >
                    <AlertCircle size={12} strokeWidth={1.5} className="text-terracotta/60 shrink-0 mt-0.5" />
                    <div>
                      <p className="font-sans text-xs text-ivory/65">{a.metadata.title}</p>
                      <p className="font-sans text-[0.65rem] text-ivory/30">
                        {a.metadata.completeness < 60 ? "Incomplete metadata · " : ""}
                        {!a.checksum ? "No checksum · " : ""}
                        {a.lifecycle === "ocr-done" && !a.ocr?.validated ? "OCR not validated" : ""}
                      </p>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* Recent activity */}
          <div className="surface rounded-card p-5 space-y-3">
            <div className="flex items-center justify-between">
              <p className="font-sans text-sm font-semibold text-ivory/60">Recent activity</p>
              <CapabilityChip status="DEMO" />
            </div>
            <div className="space-y-1.5 max-h-44 overflow-y-auto">
              {activity.slice(0, 8).map((log) => (
                <div key={log.id} className="flex items-start gap-2">
                  <span className="font-sans text-[0.6rem] text-ivory/25 shrink-0 w-14 tabular-nums">
                    {new Date(log.at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                  </span>
                  <p className="font-sans text-[0.72rem] text-ivory/55">
                    <span className="text-gold/60">{log.role}</span> · {log.action} · {log.detail}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Quick actions */}
        <div className="flex flex-wrap gap-3">
          {can(currentRole, "upload") && (
            <Link href="/admin/assets"
              className="flex items-center gap-2 px-4 py-2.5 bg-gold text-ink rounded-card font-sans text-sm font-semibold hover:bg-gold-soft transition-colors focus-visible:outline-gold"
            >
              <Upload size={14} strokeWidth={1.5} />Upload asset
            </Link>
          )}
          {can(currentRole, "run_ocr") && (
            <Link href="/admin/ocr"
              className="flex items-center gap-2 px-4 py-2.5 bg-panel text-ivory/70 border border-[rgba(244,237,224,0.12)] rounded-card font-sans text-sm hover:border-gold/30 transition-colors focus-visible:outline-gold"
            >
              <ScanLine size={14} strokeWidth={1.5} />OCR queue
            </Link>
          )}
          {can(currentRole, "approve") && (
            <Link href="/admin/review"
              className="flex items-center gap-2 px-4 py-2.5 bg-panel text-ivory/70 border border-[rgba(244,237,224,0.12)] rounded-card font-sans text-sm hover:border-gold/30 transition-colors focus-visible:outline-gold"
            >
              <CheckCircle size={14} strokeWidth={1.5} />Review queue ({stats.awaitingReview})
            </Link>
          )}
        </div>
      </div>
    </AdminLayout>
  );
}
