"use client";

import React, { useState } from "react";
import { Download } from "lucide-react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { CapabilityChip } from "@/components/admin/CapabilityChip";
import { useAdminStore } from "@/store/admin/adminStore";
import { can } from "@/store/admin/types";
import { downloadFile } from "@/lib/collectionExport";

export default function ActivityPage() {
  const { activity, currentRole } = useAdminStore();
  const [search, setSearch] = useState("");
  const [roleF,  setRoleF]  = useState("");

  if (!can(currentRole, "view_logs")) {
    return <AdminLayout><div className="p-6 text-ivory/30 font-sans text-sm">Access denied — requires view_logs permission.</div></AdminLayout>;
  }

  const filtered = activity
    .filter((l) => !search || l.action.includes(search) || l.detail.includes(search))
    .filter((l) => !roleF || l.role === roleF);

  function handleExport() {
    const csv = ["at,role,action,targetId,detail",
      ...filtered.map((l) => `${l.at},${l.role},${l.action},${l.targetId},"${l.detail}"`)
    ].join("\n");
    downloadFile(csv, "dhai-activity-log.csv", "text/csv");
  }

  return (
    <AdminLayout>
      <div className="p-6 space-y-5">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <p className="eyebrow text-gold/60">Activity Log</p>
            <h1 className="font-serif text-h2 text-ivory">Log</h1>
          </div>
          <CapabilityChip status="DEMO" />
        </div>
        <p className="font-sans text-caption text-ivory/30 italic">
          Prototype log — stored locally in browser, not tamper-proof.
        </p>

        <div className="flex gap-3 flex-wrap">
          <input type="search" value={search} onChange={(e) => setSearch(e.target.value)}
            placeholder="Search actions…"
            className="flex-1 min-w-[160px] bg-panel border border-[rgba(244,237,224,0.1)] rounded-sharp px-3 py-2 font-sans text-sm text-ivory/70 outline-none placeholder:text-ivory/20 focus:border-gold/30"
            aria-label="Search activity log" />
          <select value={roleF} onChange={(e) => setRoleF(e.target.value)}
            className="bg-panel border border-[rgba(244,237,224,0.1)] rounded-sharp px-3 py-2 font-sans text-sm text-ivory/60 outline-none focus:border-gold/30"
            aria-label="Filter by role"
          >
            <option value="">All roles</option>
            {["archivist","reviewer","administrator","auditor"].map((r) => <option key={r} value={r}>{r}</option>)}
          </select>
          <button onClick={handleExport}
            className="flex items-center gap-1.5 px-3 py-2 border border-[rgba(244,237,224,0.12)] text-ivory/50 rounded-sharp font-sans text-sm hover:border-gold/30 transition-colors focus-visible:outline-gold"
          >
            <Download size={13} strokeWidth={1.5} />Export CSV
          </button>
        </div>

        <div className="surface rounded-card overflow-hidden border border-[rgba(244,237,224,0.08)]">
          <table className="w-full" role="table" aria-label="Activity log">
            <thead>
              <tr className="border-b border-[rgba(244,237,224,0.08)] bg-[rgba(244,237,224,0.02)]">
                {["Time","Role","Action","Target","Detail"].map((h) => (
                  <th key={h} className="px-3 py-2.5 text-left font-sans text-[0.62rem] text-ivory/35 uppercase tracking-wider" scope="col">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-[rgba(244,237,224,0.04)]">
              {filtered.map((l) => (
                <tr key={l.id} className="hover:bg-white/3 transition-colors">
                  <td className="px-3 py-2 font-sans text-[0.65rem] text-ivory/30 tabular-nums whitespace-nowrap">{new Date(l.at).toLocaleTimeString()}</td>
                  <td className="px-3 py-2 font-sans text-[0.72rem] text-ivory/55 capitalize">{l.role}</td>
                  <td className="px-3 py-2 font-sans text-[0.72rem] text-gold/60">{l.action}</td>
                  <td className="px-3 py-2 font-mono text-[0.6rem] text-ivory/35">{l.targetId}</td>
                  <td className="px-3 py-2 font-sans text-[0.72rem] text-ivory/45 max-w-[240px] truncate">{l.detail}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {filtered.length === 0 && <div className="py-8 text-center font-sans text-sm text-ivory/25">No log entries match.</div>}
        </div>
        <p className="font-sans text-[0.62rem] text-ivory/20">{filtered.length} entries</p>
      </div>
    </AdminLayout>
  );
}
