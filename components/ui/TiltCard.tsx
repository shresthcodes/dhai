"use client";

import React, { useRef } from "react";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import { cn } from "@/lib/utils";

interface TiltCardProps {
  children: React.ReactNode;
  className?: string;
  maxTilt?: number; // degrees
}

export function TiltCard({ children, className, maxTilt = 6 }: TiltCardProps) {
  const ref = useRef<HTMLDivElement>(null);

  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const springConfig = { stiffness: 300, damping: 30, mass: 0.8 };
  const rotateX = useSpring(useTransform(y, [-0.5, 0.5], [maxTilt, -maxTilt]), springConfig);
  const rotateY = useSpring(useTransform(x, [-0.5, 0.5], [-maxTilt, maxTilt]), springConfig);

  // Moving highlight
  const highlightX = useSpring(useTransform(x, [-0.5, 0.5], ["0%", "100%"]), springConfig);
  const highlightY = useSpring(useTransform(y, [-0.5, 0.5], ["0%", "100%"]), springConfig);

  // Layered shadow depth
  const shadowStr = useTransform(
    [rotateX, rotateY],
    ([rx, ry]: number[]) =>
      `0 ${8 + Math.abs(ry) * 2}px ${24 + Math.abs(rx) * 4}px rgba(0,0,0,0.5), ` +
      `0 2px 8px rgba(0,0,0,0.3)`
  );

  function handleMouseMove(e: React.MouseEvent<HTMLDivElement>) {
    const rect = ref.current?.getBoundingClientRect();
    if (!rect) return;
    x.set((e.clientX - rect.left) / rect.width - 0.5);
    y.set((e.clientY - rect.top) / rect.height - 0.5);
  }

  function handleMouseLeave() {
    x.set(0);
    y.set(0);
  }

  return (
    <motion.div
      ref={ref}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{
        rotateX,
        rotateY,
        boxShadow: shadowStr,
        transformStyle: "preserve-3d",
        perspective: 800,
      }}
      className={cn(
        "relative overflow-hidden rounded-card cursor-default",
        "transition-shadow duration-300",
        className
      )}
    >
      {/* Moving highlight overlay */}
      <motion.div
        className="pointer-events-none absolute inset-0 z-10 rounded-card"
        style={{
          background: useTransform(
            [highlightX, highlightY],
            ([hx, hy]: string[]) =>
              `radial-gradient(circle at ${hx} ${hy}, rgba(201,162,75,0.08) 0%, transparent 60%)`
          ),
        }}
      />
      {children}
    </motion.div>
  );
}
