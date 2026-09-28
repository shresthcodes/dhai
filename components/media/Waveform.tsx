"use client";

import React, { useRef, useEffect } from "react";
import { cn } from "@/lib/utils";

interface WaveformProps {
  progress:   number;  // 0-1
  className?: string;
  bars?:      number;
  isPlaying?: boolean;
}

export function Waveform({ progress, className, bars = 80, isPlaying = false }: WaveformProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rafRef    = useRef<number>(0);
  const tRef      = useRef(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Generate pseudo-random waveform heights
    const heights = Array.from({ length: bars }, (_, i) => {
      const base = 0.2 + Math.abs(Math.sin(i * 0.37) * 0.5 + Math.sin(i * 0.11) * 0.3);
      return Math.min(1, base);
    });

    function draw() {
      if (!ctx || !canvas) return;
      const W = canvas.width;
      const H = canvas.height;
      ctx.clearRect(0, 0, W, H);

      const barW   = W / (bars * 1.4);
      const gap    = barW * 0.4;
      const total  = barW + gap;
      const played = Math.floor(progress * bars);

      heights.forEach((h, i) => {
        const x   = i * total;
        const barH = h * H * (isPlaying ? (0.85 + Math.sin(tRef.current * 0.15 + i * 0.4) * 0.15) : 0.85);
        const y   = (H - barH) / 2;

        ctx.fillStyle = i < played
          ? `rgba(201,162,75,${0.7 + h * 0.3})`
          : `rgba(244,237,224,${0.1 + h * 0.08})`;
        ctx.beginPath();
        ctx.roundRect(x, y, barW, barH, barW / 2);
        ctx.fill();
      });

      tRef.current++;
      if (isPlaying) rafRef.current = requestAnimationFrame(draw);
    }

    draw();
    if (!isPlaying) return;

    return () => cancelAnimationFrame(rafRef.current);
  }, [progress, bars, isPlaying]);

  return (
    <canvas
      ref={canvasRef}
      width={600}
      height={80}
      className={cn("w-full", className)}
      aria-label="Audio waveform"
      role="img"
    />
  );
}
