"use client";
import React, { useEffect, useRef } from "react";
import { cn } from "@/lib/utils";

interface QRHandoffProps {
  path:      string;   // e.g. "/document/doc-001"
  label?:    string;
  className?: string;
  size?:     number;
}

export function QRHandoff({ path, label, className, size = 240 }: QRHandoffProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const siteUrl   = process.env.NEXT_PUBLIC_SITE_URL ?? "";
  const fullUrl   = siteUrl ? `${siteUrl}${path}` : "";

  useEffect(() => {
    if (!fullUrl || !canvasRef.current) return;
    let cancelled = false;
    import("qrcode").then((QRCode) => {
      if (cancelled || !canvasRef.current) return;
      QRCode.toCanvas(canvasRef.current, fullUrl, {
        width: size,
        margin: 2,
        color: { dark: "#0B0D12", light: "#F4EDE0" },
      });
    }).catch(() => {});
    return () => { cancelled = true; };
  }, [fullUrl, size]);

  if (!fullUrl) {
    return (
      <div className={cn(
        "flex flex-col items-center justify-center p-6 rounded-[20px] border-2 border-[rgba(244,237,224,0.12)] bg-panel text-center gap-3",
        className
      )} style={{ width: size, height: size }}>
        <p className="font-sans text-sm text-ivory/40 leading-relaxed">
          Set <code className="text-gold/60">NEXT_PUBLIC_SITE_URL</code> to enable phone handoff
        </p>
        <p className="font-sans text-[0.65rem] text-ivory/25 italic">Prototype only</p>
      </div>
    );
  }

  return (
    <div className={cn("flex flex-col items-center gap-3", className)}>
      <div className="rounded-[12px] overflow-hidden border-4 border-parchment p-2 bg-parchment">
        <canvas ref={canvasRef} width={size} height={size} aria-label={`QR code for ${label ?? path}`} />
      </div>
      <p className="font-sans text-sm text-ivory/60 text-center max-w-[240px] break-all">{fullUrl}</p>
    </div>
  );
}
