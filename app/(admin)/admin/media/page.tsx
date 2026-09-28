"use client";

import React from "react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { CapabilityChip } from "@/components/admin/CapabilityChip";
import { useAdminStore } from "@/store/admin/adminStore";
import { GoldRule } from "@/components/ui/GoldRule";

export default function AdminMediaPage() {
  const { assets } = useAdminStore();
  const mediaAssets = assets.filter((a) => ["audio","video"].includes(a.kind));

  return (
    <AdminLayout>
      <div className="p-6 space-y-5">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <p className="eyebrow text-gold/60">Audio-Visual Management</p>
            <h1 className="font-serif text-h2 text-ivory">Media Assets ({mediaAssets.length})</h1>
          </div>
          <div className="flex gap-2">
            <CapabilityChip status="DEMO" />
            <CapabilityChip status="PLANNED" />
          </div>
        </div>

        {/* Planned chip for transcription */}
        <div className="flex items-center gap-3 px-4 py-3 rounded-card border border-[rgba(244,237,224,0.08)] bg-panel">
          <CapabilityChip status="PLANNED" />
          <p className="font-sans text-caption text-ivory/40">
            Automatic transcription (roadmap) — speech-to-text pipeline not yet implemented.
          </p>
        </div>

        <div className="space-y-3">
          {mediaAssets.map((a) => (
            <div key={a.id} className="surface rounded-card p-4 flex items-center gap-4 border border-[rgba(244,237,224,0.08)]">
              <div className="w-12 h-12 rounded-sharp bg-[#12100D] flex items-center justify-center border border-[rgba(244,237,224,0.08)] shrink-0">
                <span className="font-sans text-[0.6rem] text-ivory/30 uppercase">{a.kind}</span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-sans text-sm text-ivory/70 truncate">{a.metadata.title}</p>
                <div className="flex gap-2 mt-1 flex-wrap">
                  <span className="font-sans text-[0.62rem] text-ivory/30">{a.mime}</span>
                  <span className="font-sans text-[0.62rem] text-ivory/30 capitalize">{a.metadata.accessRights}</span>
                  <span className={`font-sans text-[0.62rem] ${a.lifecycle === "published" ? "text-gold/60" : "text-ivory/30"} capitalize`}>{a.lifecycle}</span>
                </div>
              </div>
              <div className="text-right shrink-0 space-y-1">
                <p className="font-sans text-[0.62rem] text-ivory/25">No transcript</p>
                <CapabilityChip status="PLANNED" />
              </div>
            </div>
          ))}
          {mediaAssets.length === 0 && <p className="font-sans text-caption text-ivory/25 italic p-4">No audio/video assets uploaded yet.</p>}
        </div>
        <GoldRule width="full" />
        <p className="font-sans text-[0.65rem] text-ivory/20 italic">
          Transcript editor, chapter management and translation slots are planned for a future build phase.
        </p>
      </div>
    </AdminLayout>
  );
}
