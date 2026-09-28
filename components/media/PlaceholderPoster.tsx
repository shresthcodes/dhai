"use client";

import React, { useRef, useEffect } from "react";
import { cn } from "@/lib/utils";

interface PlaceholderPosterProps {
  title:     string;
  kind:      string;
  className?: string;
  animate?:  boolean;
}

export function PlaceholderPoster({ title, kind, className, animate = true }: PlaceholderPosterProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rafRef    = useRef<number>(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let t = 0;

    function draw() {
      if (!ctx || !canvas) return;
      const W = canvas.width;
      const H = canvas.height;

      // Dark paper background
      ctx.fillStyle = "#0E0C09";
      ctx.fillRect(0, 0, W, H);

      // Slow grain drift using sine pattern
      const grain = ctx.createImageData(W, H);
      const d = grain.data;
      for (let i = 0; i < d.length; i += 4) {
        const x = (i / 4) % W;
        const y = Math.floor((i / 4) / W);
        const n = Math.sin(x * 0.08 + t * 0.002) * Math.cos(y * 0.06 + t * 0.0015);
        const v = 12 + n * 10;
        d[i] = d[i+1] = d[i+2] = v;
        d[i+3] = 180;
      }
      ctx.putImageData(grain, 0, 0);

      // Subtle vignette
      const vign = ctx.createRadialGradient(W/2, H/2, 0, W/2, H/2, W * 0.7);
      vign.addColorStop(0, "rgba(0,0,0,0)");
      vign.addColorStop(1, "rgba(0,0,0,0.75)");
      ctx.fillStyle = vign;
      ctx.fillRect(0, 0, W, H);

      // Gold film border
      ctx.strokeStyle = "rgba(201,162,75,0.25)";
      ctx.lineWidth = 2;
      ctx.strokeRect(8, 8, W - 16, H - 16);

      // Kind label
      ctx.font = "600 10px 'Inter', sans-serif";
      ctx.letterSpacing = "0.12em";
      ctx.fillStyle = "rgba(201,162,75,0.55)";
      ctx.textAlign = "center";
      ctx.fillText(kind.toUpperCase(), W / 2, H / 2 - 24);

      // Title
      ctx.font = "500 13px Georgia, serif";
      ctx.fillStyle = "rgba(244,237,224,0.55)";
      ctx.letterSpacing = "0";
      const words = title.split(" ");
      let line = "";
      const lines: string[] = [];
      for (const w of words) {
        const test = line + w + " ";
        if (ctx.measureText(test).width > W - 40) { lines.push(line); line = w + " "; }
        else line = test;
      }
      if (line) lines.push(line);
      lines.forEach((l, i) => ctx.fillText(l.trim(), W / 2, H / 2 + i * 18));

      // "Placeholder media" footer
      ctx.font = "11px 'Inter', sans-serif";
      ctx.fillStyle = "rgba(244,237,224,0.18)";
      ctx.fillText("Placeholder media", W / 2, H - 18);

      t++;
      if (animate) rafRef.current = requestAnimationFrame(draw);
    }

    draw();
    return () => cancelAnimationFrame(rafRef.current);
  }, [title, kind, animate]);

  return (
    <canvas
      ref={canvasRef}
      width={400}
      height={225}
      className={cn("w-full h-full object-cover", className)}
      aria-label={`Placeholder poster for ${title}`}
      role="img"
    />
  );
}
