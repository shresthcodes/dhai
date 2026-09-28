"use client";
import React from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { ArrowLeft, Bookmark, Trash2, ExternalLink, Smartphone } from "lucide-react";
import { KioskButton } from "@/components/kiosk/KioskButton";
import { QRHandoff } from "@/components/kiosk/QRHandoff";
import { DemoBadge } from "@/components/ui/Badge";
import { GoldRule } from "@/components/ui/GoldRule";
import { useKioskStore } from "@/store/kiosk";
import { t } from "@/lib/i18n";
import type { Language } from "@/data/models";

const KIND_LABEL: Record<string, string> = {
  writing:     "Writing",
  speech:      "Speech",
  manuscript:  "Manuscript",
  debate:      "Constitutional Debate",
  photograph:  "Photograph",
  record:      "Historical Record",
  audio:       "Audio",
  video:       "Video",
  lecture:     "Lecture",
  documentary: "Documentary",
  interview:   "Interview",
};

export default function KioskSessionPage() {
  const router = useRouter();
  const { language, items, removeItem, reset } = useKioskStore();
  const lang = (language as Language) ?? "en";
  const tr   = (k: string) => t(k, lang);

  return (
    <div className="fixed inset-0 bg-ink flex flex-col">
      {/* Header */}
      <div className="flex items-center gap-4 px-6 py-4 bg-night border-b border-[rgba(244,237,224,0.1)] shrink-0">
        <KioskButton variant="secondary" size="lg" onClick={() => router.push("/kiosk")}>
          <ArrowLeft size={22} strokeWidth={1.5} />
        </KioskButton>
        <Bookmark size={26} strokeWidth={1.5} className="text-gold/60" />
        <h1 className="font-serif text-[1.75rem] text-ivory flex-1">{tr("kiosk.session")}</h1>
        <span className="font-sans text-sm text-ivory/40">{items.length} item{items.length !== 1 ? "s" : ""}</span>
        <DemoBadge />
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6">
        {items.length === 0 ? (
          <div className="flex flex-col items-center justify-center min-h-[40vh] text-center space-y-4">
            <Bookmark size={56} strokeWidth={1} className="text-ivory/15" />
            <p className="font-serif text-[2rem] text-ivory/40">No items yet</p>
            <p className="font-sans text-[1.2rem] text-ivory/30 max-w-sm">
              Items you open in Archive, Watch, and Ask will appear here automatically.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {items.map((item, i) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, x: 12 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05 }}
                className="flex items-center gap-4 bg-panel rounded-[20px] border-2 border-[rgba(244,237,224,0.1)] px-6 py-5"
              >
                <div className="flex-1 min-w-0 space-y-1">
                  <span className="font-sans text-sm text-gold/60 capitalize">
                    {KIND_LABEL[item.kind] ?? item.kind}
                  </span>
                  <p className="font-serif text-[1.25rem] text-ivory leading-snug truncate">{item.title}</p>
                </div>
                <div className="flex gap-2 shrink-0">
                  <KioskButton variant="ghost" size="lg"
                    onClick={() => router.push(item.path)}
                    aria-label={`Open ${item.title}`}>
                    <ExternalLink size={20} strokeWidth={1.5} />
                  </KioskButton>
                  <KioskButton variant="danger" size="lg"
                    onClick={() => removeItem(item.id)}
                    aria-label={`Remove ${item.title}`}>
                    <Trash2 size={20} strokeWidth={1.5} />
                  </KioskButton>
                </div>
              </motion.div>
            ))}
          </div>
        )}

        <GoldRule />

        {/* Phone handoff */}
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <Smartphone size={22} strokeWidth={1.5} className="text-ivory/40" />
            <p className="font-serif text-[1.4rem] text-ivory/70">{tr("kiosk.phoneHandoff")}</p>
          </div>
          <p className="font-sans text-[1.1rem] text-ivory/40">{tr("kiosk.scanQR")}</p>
          <QRHandoff path="/archive" size={200} label="Continue exploring on your phone" />
        </div>

        {/* Privacy notice */}
        <div className="py-4 text-center space-y-1">
          <p className="font-sans text-sm text-ivory/30">{tr("kiosk.noPersonalData")}</p>
          <p className="font-sans text-xs text-ivory/20 italic">{tr("kiosk.demoNotice")}</p>
        </div>
      </div>

      {/* End session */}
      <div className="px-6 py-5 border-t border-[rgba(244,237,224,0.08)] shrink-0">
        <KioskButton variant="danger" size="xl" fullWidth onClick={reset}>
          {tr("kiosk.endSession")}
        </KioskButton>
      </div>
    </div>
  );
}
