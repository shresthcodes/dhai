"use client";
import React, { useState } from "react";
import { motion } from "framer-motion";
import { Monitor, Tablet, Tv, Smartphone, Camera } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { GoldRule } from "@/components/ui/GoldRule";
import { DemoBadge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import Link from "next/link";

interface DeviceFrameProps {
  label:     string;
  icon:      React.ElementType;
  children:  React.ReactNode;
  className?: string;
  style?:    React.CSSProperties;
}

function DeviceFrame({ label, icon: Icon, children, className, style }: DeviceFrameProps) {
  return (
    <motion.div
      animate={{ y: [0, -8, 0] }}
      transition={{ duration: 4, repeat: Infinity, ease: "easeInOut", delay: Math.random() * 2 }}
      className={className}
      style={style}
    >
      <div className="text-center mb-3 flex items-center justify-center gap-2">
        <Icon size={14} strokeWidth={1.5} className="text-ivory/40" />
        <span className="eyebrow text-[0.6rem] text-ivory/40">{label}</span>
      </div>
      {children}
    </motion.div>
  );
}

function BrowserFrame({ children }: { children: React.ReactNode }) {
  return (
    <div className="rounded-[12px] overflow-hidden border-2 border-[rgba(244,237,224,0.15)] shadow-card" style={{ background: "#161B26" }}>
      <div className="flex items-center gap-1.5 px-3 py-2 border-b border-[rgba(244,237,224,0.08)] bg-[rgba(255,255,255,0.02)]">
        <div className="w-2 h-2 rounded-full bg-terracotta/50" />
        <div className="w-2 h-2 rounded-full bg-gold/40" />
        <div className="w-2 h-2 rounded-full bg-azure/40" />
        <div className="flex-1 h-3 mx-2 rounded-full bg-[rgba(244,237,224,0.06)]" />
      </div>
      <div className="p-3">{children}</div>
    </div>
  );
}

function KioskFrame({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-col items-center gap-2">
      {/* Screen */}
      <div className="rounded-[10px] overflow-hidden border-2 border-[rgba(244,237,224,0.2)] shadow-card" style={{ background: "#0B0D12", aspectRatio: "9/16", width: 160 }}>
        <div className="h-full flex flex-col items-center justify-center p-4 gap-3">
          <p className="font-serif text-[0.7rem] text-gold text-center">DHAI</p>
          <div className="grid grid-cols-2 gap-1.5 w-full">
            {["Search","Explore","Watch","Timeline"].map((l) => (
              <div key={l} className="rounded-[6px] bg-[rgba(244,237,224,0.05)] border border-[rgba(244,237,224,0.08)] p-1.5 text-center">
                <p className="font-sans text-[0.5rem] text-ivory/50">{l}</p>
              </div>
            ))}
          </div>
          <p className="font-sans text-[0.4rem] text-ivory/20 text-center">Touch to begin</p>
        </div>
      </div>
      {/* Stand */}
      <div className="w-2 h-8 bg-[rgba(244,237,224,0.15)] rounded-full" />
      <div className="w-16 h-2 bg-[rgba(244,237,224,0.12)] rounded-full" />
    </div>
  );
}

function DisplayWallFrame({ children }: { children: React.ReactNode }) {
  return (
    <div className="rounded-[8px] overflow-hidden border-2 border-[rgba(244,237,224,0.15)] shadow-card" style={{ background: "#0B0D12", aspectRatio: "16/5" }}>
      <div className="h-full flex items-center px-6 gap-6">
        <div className="space-y-1.5 flex-1">
          <p className="font-sans text-[0.55rem] text-gold/50 uppercase tracking-wider">Constitutional Journey</p>
          <p className="font-serif text-[0.9rem] text-ivory leading-tight">29 August 1947</p>
          <p className="font-sans text-[0.5rem] text-ivory/40">Chairman of the Constitution Drafting Committee</p>
        </div>
        <div className="w-10 h-10 rounded-full bg-gold/10 border border-gold/20 flex items-center justify-center shrink-0">
          <p className="font-sans text-[0.4rem] text-gold/50">QR</p>
        </div>
      </div>
    </div>
  );
}

function PhoneFrame({ children }: { children: React.ReactNode }) {
  return (
    <div className="rounded-[18px] overflow-hidden border-2 border-[rgba(244,237,224,0.2)] shadow-card" style={{ background: "#10141C", width: 100, aspectRatio: "9/19" }}>
      <div className="h-2 bg-[rgba(244,237,224,0.04)] rounded-b-sm mx-4 mt-1" />
      <div className="p-2 space-y-1.5">
        <div className="h-2 w-full rounded bg-[rgba(244,237,224,0.06)]" />
        <div className="h-8 rounded bg-[rgba(201,162,75,0.08)] border border-gold/10 flex items-center justify-center">
          <p className="font-sans text-[0.4rem] text-gold/40">Scan to continue</p>
        </div>
        <div className="h-2 w-3/4 rounded bg-[rgba(244,237,224,0.04)]" />
      </div>
    </div>
  );
}

function WebPortalPreview() {
  return (
    <div className="space-y-2">
      <div className="h-2 w-24 rounded bg-gold/20" />
      <div className="h-6 w-full rounded bg-[rgba(244,237,224,0.05)]" />
      <div className="grid grid-cols-3 gap-1.5">
        {[1,2,3].map(i => <div key={i} className="h-10 rounded bg-[rgba(244,237,224,0.04)] border border-[rgba(244,237,224,0.06)]" />)}
      </div>
      <div className="h-1.5 w-16 rounded bg-gold/15" />
    </div>
  );
}

export function ShowcaseClient() {
  const [screenshotMode, setScreenshotMode] = useState(false);

  return (
    <div className="min-h-screen pt-[4.5rem] relative overflow-hidden"
      style={{ background: "radial-gradient(ellipse 80% 60% at 50% 40%, rgba(201,162,75,0.04) 0%, #0B0D12 70%)" }}>
      <Container className="py-16 space-y-12">
        {/* Header */}
        <div className="text-center space-y-4">
          <p className="eyebrow text-gold/60">Concept Visualisation</p>
          <h1 className="font-serif text-display text-ivory">One Knowledge Layer</h1>
          <GoldRule className="mx-auto" />
          <p className="font-sans text-body text-ivory/45 max-w-xl mx-auto">
            Web Portal · Research Interface · Museum Kiosk · Smart Display
          </p>
          <div className="flex items-center justify-center gap-3">
            <DemoBadge />
            <span className="font-sans text-[0.68rem] text-ivory/25 italic">
              Concept visualisation — not real hardware
            </span>
          </div>
        </div>

        {/* Device cluster */}
        <div className={`flex flex-wrap items-end justify-center gap-10 py-8 ${screenshotMode ? "min-h-[500px]" : ""}`}
          style={{ perspective: "1200px" }}>
          {/* Browser / Web portal */}
          <DeviceFrame label="Web Portal" icon={Monitor} className="w-72" style={{ transform: "rotateY(-8deg) translateZ(0)" } as React.CSSProperties}>
            <BrowserFrame><WebPortalPreview /></BrowserFrame>
          </DeviceFrame>

          {/* Kiosk */}
          <DeviceFrame label="Museum Kiosk" icon={Tablet} className="self-end">
            <KioskFrame><></></KioskFrame>
          </DeviceFrame>

          {/* Smart display */}
          <DeviceFrame label="Smart Display" icon={Tv} className="w-96" style={{ transform: "rotateY(6deg) translateZ(0)" } as React.CSSProperties}>
            <DisplayWallFrame><></></DisplayWallFrame>
          </DeviceFrame>

          {/* Phone */}
          <DeviceFrame label="Phone Handoff" icon={Smartphone} className="self-end">
            <PhoneFrame><></></PhoneFrame>
          </DeviceFrame>
        </div>

        {/* Caption */}
        <p className="font-sans text-caption text-ivory/30 text-center max-w-xl mx-auto italic">
          All four interfaces draw from the same archival knowledge layer.
          The same verified records power the web portal, kiosk, display wall and phone handoff.
        </p>

        {/* CTAs */}
        <div className="flex flex-wrap gap-3 justify-center">
          <Button variant="primary"   size="md" href="/kiosk">Launch Kiosk →</Button>
          <Button variant="secondary" size="md" href="/display">Exhibition Display →</Button>
          <Button variant="ghost"     size="sm" onClick={() => setScreenshotMode((v) => !v)}>
            <Camera size={14} strokeWidth={1.5} className="mr-1.5" />
            {screenshotMode ? "Exit screenshot mode" : "Screenshot mode"}
          </Button>
        </div>
      </Container>
    </div>
  );
}
