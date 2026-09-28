"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import {
  LayoutDashboard, FolderOpen, ScanLine, Tag, Film,
  CheckCircle, Shield, Users, Activity, Settings,
  ChevronLeft, ChevronRight, LogOut, Accessibility,
  AlertTriangle, Search, X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAdminStore } from "@/store/admin/adminStore";
import { can, type AdminRole, type AdminPermission } from "@/store/admin/types";
import { GoldRule } from "@/components/ui/GoldRule";
import { useLanguageStore } from "@/store/language";
import type { Language } from "@/data/models";

const NAV_ITEMS = [
  { href: "/admin",             icon: LayoutDashboard, label: "Overview",       perm: "view" as AdminPermission },
  { href: "/admin/assets",      icon: FolderOpen,      label: "Assets",         perm: "view" as AdminPermission },
  { href: "/admin/ocr",         icon: ScanLine,        label: "OCR Workflow",   perm: "run_ocr" as AdminPermission },
  { href: "/admin/metadata",    icon: Tag,             label: "Metadata",       perm: "edit_metadata" as AdminPermission },
  { href: "/admin/media",       icon: Film,            label: "Media",          perm: "view" as AdminPermission },
  { href: "/admin/review",      icon: CheckCircle,     label: "Review",         perm: "approve" as AdminPermission },
  { href: "/admin/preservation",icon: Shield,          label: "Preservation",   perm: "view" as AdminPermission },
  { href: "/admin/access",      icon: Users,           label: "Access Control", perm: "manage_access" as AdminPermission },
  { href: "/admin/activity",    icon: Activity,        label: "Activity Log",   perm: "view_logs" as AdminPermission },
  { href: "/admin/settings",    icon: Settings,        label: "Settings",       perm: "view" as AdminPermission },
];

const ROLE_LABELS: Record<AdminRole, string> = {
  archivist:     "Archivist",
  reviewer:      "Reviewer",
  administrator: "Administrator",
  auditor:       "Read-only Auditor",
};

const ROLE_COLORS: Record<AdminRole, string> = {
  archivist:     "text-azure/70 border-azure/30 bg-azure/8",
  reviewer:      "text-gold/70 border-gold/30 bg-gold/8",
  administrator: "text-terracotta/70 border-terracotta/30 bg-terracotta/8",
  auditor:       "text-ivory/50 border-ivory/20 bg-ivory/4",
};

/* ─── Command palette ────────────────────────────────────────────── */
function CommandPalette({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [q, setQ] = useState("");
  const router    = useRouter();
  const filtered  = NAV_ITEMS.filter((i) => i.label.toLowerCase().includes(q.toLowerCase()));

  useEffect(() => {
    if (!open) return;
    const el = document.getElementById("cmd-input");
    el?.focus();
  }, [open]);

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[500] bg-black/50" onClick={onClose} />
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: -8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96 }}
            className="fixed top-[20%] left-1/2 -translate-x-1/2 z-[501] w-[420px] max-w-[92vw] glass rounded-card shadow-card overflow-hidden"
            role="dialog" aria-label="Command palette"
          >
            <div className="flex items-center gap-2 px-4 py-3 border-b border-[rgba(244,237,224,0.08)]">
              <Search size={14} strokeWidth={1.5} className="text-ivory/40" />
              <input id="cmd-input" type="text" value={q} onChange={(e) => setQ(e.target.value)}
                placeholder="Jump to section…"
                className="flex-1 bg-transparent font-sans text-sm text-ivory outline-none placeholder:text-ivory/25"
                onKeyDown={(e) => {
                  if (e.key === "Escape") onClose();
                  if (e.key === "Enter" && filtered[0]) { router.push(filtered[0].href); onClose(); }
                }}
                aria-label="Search admin sections"
              />
              <button onClick={onClose} className="text-ivory/30 hover:text-ivory/60 focus-visible:outline-gold"><X size={13} /></button>
            </div>
            <div className="py-1 max-h-64 overflow-y-auto">
              {filtered.map((item) => (
                <button key={item.href}
                  onClick={() => { router.push(item.href); onClose(); }}
                  className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-white/5 transition-colors text-left focus-visible:outline-gold"
                >
                  <item.icon size={14} strokeWidth={1.5} className="text-ivory/40" />
                  <span className="font-sans text-sm text-ivory/70">{item.label}</span>
                </button>
              ))}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

/* ─── Main admin layout ──────────────────────────────────────────── */
export function AdminLayout({ children }: { children: React.ReactNode }) {
  const { currentRole, signOut } = useAdminStore();
  const [collapsed,    setCollapsed]    = useState(false);
  const [cmdOpen,      setCmdOpen]      = useState(false);
  const { language, setLanguage }       = useLanguageStore();
  const pathname = usePathname();
  const router   = useRouter();

  // Redirect to login if no role
  useEffect(() => {
    if (!currentRole) router.replace("/admin/login");
  }, [currentRole, router]);

  // Ctrl/Cmd+K
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if ((e.ctrlKey || e.metaKey) && e.key === "k") { e.preventDefault(); setCmdOpen(true); }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  if (!currentRole) return null;

  const LANGS: Language[] = ["en", "hi", "gu"];
  const LANG_LABELS: Record<Language, string> = { en: "EN", hi: "हि", mr: "म", gu: "ગુ" };

  return (
    <div className="min-h-screen flex bg-ink font-sans">
      {/* Sidebar */}
      <aside className={cn(
        "flex flex-col shrink-0 bg-night border-r border-[rgba(244,237,224,0.08)] transition-all duration-300",
        collapsed ? "w-14" : "w-52"
      )} aria-label="Admin navigation">
        {/* Brand */}
        <div className="flex items-center gap-2.5 px-4 py-4 border-b border-[rgba(244,237,224,0.08)]">
          <span className="font-serif text-[1.1rem] font-semibold text-gold shrink-0">D</span>
          {!collapsed && (
            <div className="min-w-0">
              <p className="font-serif text-sm font-semibold text-ivory/80 leading-none">DHAI</p>
              <p className="font-sans text-[0.55rem] text-ivory/30 uppercase tracking-wider mt-0.5">Admin Portal</p>
            </div>
          )}
        </div>

        {/* Nav */}
        <nav className="flex-1 py-2 overflow-y-auto" aria-label="Portal sections">
          {NAV_ITEMS.map(({ href, icon: Icon, label, perm }) => {
            const allowed = can(currentRole, perm);
            const active  = pathname === href || (href !== "/admin" && pathname.startsWith(href));
            return (
              <Link
                key={href}
                href={allowed ? href : "#"}
                aria-disabled={!allowed}
                aria-label={!allowed ? `${label} — Requires ${perm.replace("_", " ")} permission` : label}
                title={!allowed ? `Requires ${perm.replace("_", " ")} permission` : label}
                className={cn(
                  "flex items-center gap-3 px-4 py-2.5 transition-all duration-150 focus-visible:outline-gold",
                  active ? "bg-gold/10 text-gold border-r-2 border-gold" : "text-ivory/50 hover:text-ivory/80 hover:bg-white/4",
                  !allowed && "opacity-35 cursor-not-allowed pointer-events-none"
                )}
              >
                <Icon size={15} strokeWidth={1.5} className="shrink-0" />
                {!collapsed && <span className="font-sans text-[0.8125rem] truncate">{label}</span>}
              </Link>
            );
          })}
        </nav>

        {/* Collapse toggle */}
        <button
          onClick={() => setCollapsed((v) => !v)}
          className="flex items-center justify-center py-3 border-t border-[rgba(244,237,224,0.08)] text-ivory/30 hover:text-ivory/70 transition-colors focus-visible:outline-gold"
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {collapsed ? <ChevronRight size={14} strokeWidth={1.5} /> : <ChevronLeft size={14} strokeWidth={1.5} />}
        </button>
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Mock auth banner */}
        <div className="flex items-center gap-2 px-4 py-1.5 bg-terracotta/10 border-b border-terracotta/20 shrink-0">
          <AlertTriangle size={11} strokeWidth={1.5} className="text-terracotta/70 shrink-0" />
          <p className="font-sans text-[0.65rem] text-ivory/50">
            Prototype — mock sign-in, no real authentication or server-side security.
            Storage is local to this browser only.
          </p>
        </div>

        {/* Top bar */}
        <header className="flex items-center justify-between gap-4 px-5 py-3 bg-night border-b border-[rgba(244,237,224,0.08)] shrink-0">
          <div className="flex items-center gap-3">
            <span className={cn("eyebrow text-[0.6rem] px-2 py-1 rounded-sharp border", ROLE_COLORS[currentRole])}>
              {ROLE_LABELS[currentRole]}
            </span>
            <button
              onClick={() => setCmdOpen(true)}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-sharp border border-[rgba(244,237,224,0.1)] font-sans text-xs text-ivory/35 hover:text-ivory/70 transition-colors focus-visible:outline-gold"
              aria-label="Open command palette (Ctrl+K)"
            >
              <Search size={11} strokeWidth={1.5} />
              <span className="hidden sm:inline">Ctrl+K</span>
            </button>
          </div>

          <div className="flex items-center gap-2">
            {/* Language */}
            <div className="flex border border-[rgba(244,237,224,0.1)] rounded-sharp overflow-hidden" role="group" aria-label="Language">
              {LANGS.map((l) => (
                <button key={l} onClick={() => setLanguage(l)}
                  className={cn("px-2 py-1 font-sans text-[0.65rem] transition-all focus-visible:outline-gold",
                    language === l ? "bg-gold/12 text-gold" : "text-ivory/30 hover:text-ivory/60"
                  )}
                  aria-pressed={language === l}
                  lang={l}
                >{LANG_LABELS[l]}</button>
              ))}
            </div>

            {/* Sign out */}
            <button
              onClick={() => { signOut(); router.replace("/admin/login"); }}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-sharp border border-[rgba(244,237,224,0.1)] font-sans text-xs text-ivory/35 hover:text-terracotta/70 transition-colors focus-visible:outline-gold"
              aria-label="Sign out"
            >
              <LogOut size={11} strokeWidth={1.5} />Sign out
            </button>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto" id="admin-main-content" tabIndex={-1}>
          {children}
        </main>
      </div>

      <CommandPalette open={cmdOpen} onClose={() => setCmdOpen(false)} />
    </div>
  );
}
