"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { AlertTriangle, ShieldCheck } from "lucide-react";
import { useAdminStore } from "@/store/admin/adminStore";
import { type AdminRole } from "@/store/admin/types";
import { GoldRule } from "@/components/ui/GoldRule";

const ROLES: { role: AdminRole; label: string; desc: string }[] = [
  { role: "archivist",     label: "Archivist",         desc: "Upload, OCR, metadata editing" },
  { role: "reviewer",      label: "Reviewer",          desc: "Approve, request changes, access logs" },
  { role: "administrator", label: "Administrator",     desc: "Full access, publish, manage roles" },
  { role: "auditor",       label: "Read-only Auditor", desc: "View assets and activity log only" },
];

export default function AdminLoginPage() {
  const [selected, setSelected] = useState<AdminRole>("archivist");
  const { signIn } = useAdminStore();
  const router = useRouter();

  function handleEnter() {
    signIn(selected);
    router.push("/admin");
  }

  return (
    <div className="min-h-screen bg-ink flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md space-y-8">
        {/* Header */}
        <div className="text-center space-y-2">
          <p className="eyebrow text-gold/60">Institutional Archive Portal</p>
          <h1 className="font-serif text-h1 text-ivory">DHAI Admin</h1>
          <GoldRule className="mx-auto" />
          <p className="font-sans text-caption text-ivory/40">
            Archival management system prototype
          </p>
        </div>

        {/* Mock auth warning */}
        <div className="flex items-start gap-3 px-4 py-3 rounded-card border border-terracotta/25 bg-terracotta/8">
          <AlertTriangle size={15} strokeWidth={1.5} className="text-terracotta/70 shrink-0 mt-0.5" />
          <div>
            <p className="font-sans text-[0.78rem] font-semibold text-terracotta/80">Prototype — Mock Authentication</p>
            <p className="font-sans text-[0.72rem] text-ivory/50 mt-0.5 leading-relaxed">
              No real login, no server, no session security. Storage is local to this browser only.
              Do not use with real confidential data.
            </p>
          </div>
        </div>

        {/* Role selector */}
        <div className="space-y-3 surface rounded-card p-5">
          <p className="font-sans text-sm font-medium text-ivory/60 mb-4">Select a role to explore:</p>
          {ROLES.map(({ role, label, desc }) => (
            <button
              key={role}
              onClick={() => setSelected(role)}
              className={`w-full text-left px-4 py-3 rounded-card border transition-all focus-visible:outline-gold ${
                selected === role
                  ? "border-gold/40 bg-gold/8"
                  : "border-[rgba(244,237,224,0.1)] hover:border-[rgba(244,237,224,0.2)]"
              }`}
              aria-pressed={selected === role}
            >
              <div className="flex items-center justify-between">
                <p className={`font-sans text-sm font-semibold ${selected === role ? "text-gold" : "text-ivory/70"}`}>
                  {label}
                </p>
                {selected === role && <ShieldCheck size={14} strokeWidth={1.5} className="text-gold/60" />}
              </div>
              <p className="font-sans text-[0.72rem] text-ivory/35 mt-0.5">{desc}</p>
            </button>
          ))}
        </div>

        <button
          onClick={handleEnter}
          className="w-full py-3 bg-gold text-ink font-sans font-semibold text-sm rounded-card hover:bg-gold-soft transition-colors focus-visible:outline-gold"
        >
          Enter demo portal as {ROLES.find((r) => r.role === selected)?.label}
        </button>

        <p className="font-sans text-[0.65rem] text-ivory/25 text-center">
          Smart India Hackathon 2026 · Prototype · No server connection
        </p>
      </div>
    </div>
  );
}
