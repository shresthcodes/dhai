"use client";

import React from "react";
import { motion, useInView } from "framer-motion";
import { useAccessibilityStore } from "@/store/accessibility";

interface ScrollRevealProps {
  children: React.ReactNode;
  delay?:   number;
  className?: string;
  once?:    boolean;
}

export function ScrollReveal({ children, delay = 0, className, once = true }: ScrollRevealProps) {
  const ref = React.useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once, margin: "-80px" });
  const { reduceMotion } = useAccessibilityStore();

  if (reduceMotion) {
    return <div ref={ref} className={className}>{children}</div>;
  }

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 24 }}
      animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 24 }}
      transition={{ duration: 0.65, delay, ease: [0.22, 1, 0.36, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  );
}
