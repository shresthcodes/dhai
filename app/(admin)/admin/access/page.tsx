"use client";

import React from "react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { CapabilityChip } from "@/components/admin/CapabilityChip";
import { ROLE_PERMISSIONS, type AdminRole, type AdminPermission } from "@/store/admin/types";
import { useAdminStore } from "@/store/admin/adminStore";
import { GoldRule } from "@/components/ui/GoldRule";
import { CheckCircle, XCircle } from "lucide-react";

const ALL_PERMS: AdminPermission[] = [
  "view","upload","edit_metadata","run_ocr","approve","publish","delete","manage_vocab","manage_access","view_logs",
];
const ROLES: AdminRole[] = ["auditor","archivist","reviewer","administrator"];

export default function AccessPage() {
  const { currentRole } = useAdminStore();

  return (
    <AdminLayout>
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <p className="eyebrow text-gold/60">Access Control</p>
            <h1 className="font-serif text-h2 text-ivory">RBAC Matrix</h1>
          </div>
          <CapabilityChip status="DEMO" />
        </div>

        <p className="font-sans text-caption text-ivory/40">
          Client-side role-based access control prototype. In production, access control would be enforced server-side.
        </p>

        <div className="surface rounded-card overflow-hidden border border-[rgba(244,237,224,0.08)]">
          <div className="overflow-x-auto">
            <table className="w-full" role="table" aria-label="Role permission matrix">
              <thead>
                <tr className="border-b border-[rgba(244,237,224,0.08)] bg-[rgba(244,237,224,0.02)]">
                  <th className="px-4 py-3 text-left font-sans text-[0.65rem] text-ivory/40 uppercase tracking-wider" scope="col">Permission</th>
                  {ROLES.map((r) => (
                    <th key={r} className="px-4 py-3 text-center font-sans text-[0.65rem] text-ivory/40 uppercase tracking-wider" scope="col">
                      {r}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-[rgba(244,237,224,0.05)]">
                {ALL_PERMS.map((perm) => (
                  <tr key={perm} className="hover:bg-white/3 transition-colors">
                    <td className="px-4 py-2.5">
                      <span className="font-sans text-sm text-ivory/60 capitalize">{perm.replace("_", " ")}</span>
                    </td>
                    {ROLES.map((role) => {
                      const has = ROLE_PERMISSIONS[role].includes(perm);
                      return (
                        <td key={role} className="px-4 py-2.5 text-center">
                          {has
                            ? <CheckCircle size={14} strokeWidth={1.5} className="text-gold/70 mx-auto" aria-label="Allowed" />
                            : <XCircle    size={14} strokeWidth={1.5} className="text-terracotta/25 mx-auto" aria-label="Denied" />
                          }
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="surface rounded-card p-4 space-y-2">
          <p className="font-sans text-sm font-semibold text-ivory/50">Current session</p>
          <GoldRule width="sm" />
          <p className="font-sans text-caption text-ivory/40">
            Signed in as: <strong className="text-gold/70">{currentRole ?? "—"}</strong>
          </p>
          <p className="font-sans text-caption text-ivory/30">
            Permissions: {currentRole ? ROLE_PERMISSIONS[currentRole].join(", ") : "none"}
          </p>
        </div>
      </div>
    </AdminLayout>
  );
}
