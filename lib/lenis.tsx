"use client";

import { useEffect, useRef } from "react";
import Lenis from "lenis";

/* ─── useLenis ──────────────────────────────────────────────────────────
   Initialises Lenis smooth scroll on the client.
   Automatically disabled when prefers-reduced-motion is set.
──────────────────────────────────────────────────────────────────────── */
export function useLenis() {
  const lenisRef = useRef<Lenis | null>(null);

  useEffect(() => {
    const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReduced) return;

    const lenis = new Lenis({
      duration:  1.2,
      easing:    (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
    });

    lenisRef.current = lenis;

    let raf: number;
    function animate(time: number) {
      lenis.raf(time);
      raf = requestAnimationFrame(animate);
    }
    raf = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(raf);
      lenis.destroy();
    };
  }, []);

  return lenisRef;
}
