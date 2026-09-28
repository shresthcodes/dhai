"use client";

import React from "react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { CapabilityChip } from "@/components/admin/CapabilityChip";
import { useAdminStore } from "@/store/admin/adminStore";
import { GoldRule } from "@/components/ui/GoldRule";
import { useToast } from "@/components/ui/Toast";
import { downloadFile } from "@/lib/collectionExport";

export default function SettingsPage() {
  const { reset, assets, activity } = useAdminStore();
  const { toast } = useToast();
  const [confirming, setConfirming] = React.useState(false);

  function handleReset() {
    if (!confirming) { setConfirming(true); return; }
    reset();
    toast("Demo data reset", "info");
    setConfirming(false);
  }

  function handleExport() {
    const data = { assets, activity, exportedAt: new Date().toISOString(), note: "Prototype export — demo data" };
    downloadFile(JSON.stringify(data, null, 2), "dhai-portal-export.json", "application/json");
  }

  const PLANNED_FEATURES = [
    { label: "PostgreSQL database", desc: "Replace localStorage with a real relational database." },
    { label: "S3-compatible object storage", desc: "Store files in production cloud storage." },
    { label: "Vector search index (pgvector)", desc: "Semantic search over archival content." },
    { label: "OCR/ASR service (server-side)", desc: "High-accuracy OCR and speech-to-text via a dedicated service." },
    { label: "Encryption at rest (AES-256)", desc: "All stored files and metadata encrypted." },
    { label: "Automated backups", desc: "Scheduled geo-redundant backups with retention policy." },
    { label: "Audit-grade activity log", desc: "Tamper-proof, signed, server-side activity log." },
    { label: "SSO / institutional auth", desc: "Integration with institutional identity provider." },
  ];

  return (
    <AdminLayout>
      <div className="p-6 space-y-6">
        <div>
          <p className="eyebrow text-gold/60">Settings</p>
          <h1 className="font-serif text-h2 text-ivory">Portal Settings</h1>
          <GoldRule width="sm" className="mt-2" />
        </div>

        {/* Demo data reset */}
        <div className="surface rounded-card p-5 space-y-3">
          <p className="font-sans text-sm font-semibold text-ivory/60">Demo Data</p>
          <p className="font-sans text-caption text-ivory/40">
            Reset all assets and activity log to the built-in seed data. This clears any uploads or changes made in this session.
          </p>
          <div className="flex gap-2">
            <button onClick={handleReset}
              className={`px-4 py-2 rounded-sharp font-sans text-sm font-semibold transition-colors focus-visible:outline-gold ${
                confirming
                  ? "bg-terracotta text-white hover:bg-terracotta/80"
                  : "bg-panel border border-[rgba(244,237,224,0.12)] text-ivory/50 hover:border-gold/30"
              }`}
            >
              {confirming ? "Click again to confirm reset" : "Reset demo data"}
            </button>
            {confirming && (
              <button onClick={() => setConfirming(false)}
                className="px-4 py-2 rounded-sharp font-sans text-sm text-ivory/40 hover:text-ivory/70 focus-visible:outline-gold"
              >Cancel</button>
            )}
          </div>
        </div>

        {/* Export / import */}
        <div className="surface rounded-card p-5 space-y-3">
          <p className="font-sans text-sm font-semibold text-ivory/60">Export Portal Data</p>
          <p className="font-sans text-caption text-ivory/40">Download all asset metadata and activity log as JSON.</p>
          <button onClick={handleExport}
            className="px-4 py-2 bg-panel border border-[rgba(244,237,224,0.12)] text-ivory/50 rounded-sharp font-sans text-sm hover:border-gold/30 transition-colors focus-visible:outline-gold"
          >Export all data (JSON)</button>
        </div>

        {/* Production roadmap */}
        <div className="surface rounded-card p-5 space-y-4">
          <div className="flex items-center gap-2">
            <p className="font-sans text-sm font-semibold text-ivory/60">Production Architecture (Roadmap)</p>
            <CapabilityChip status="PLANNED" />
          </div>
          <p className="font-sans text-caption text-ivory/35">
            The following capabilities are planned for a production deployment. None are implemented in this prototype.
          </p>
          <div className="space-y-2">
            {PLANNED_FEATURES.map(({ label, desc }) => (
              <div key={label} className="flex items-start gap-3">
                <CapabilityChip status="PLANNED" className="shrink-0 mt-0.5" />
                <div>
                  <p className="font-sans text-[0.78rem] font-semibold text-ivory/55">{label}</p>
                  <p className="font-sans text-[0.68rem] text-ivory/30">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
