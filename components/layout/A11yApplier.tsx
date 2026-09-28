"use client";

import { useEffect } from "react";
import { useAccessibilityStore } from "@/store/accessibility";

/* ─── A11yApplier ────────────────────────────────────────────────────
   Syncs accessibility store → CSS custom properties and data attributes
   on <html> so all CSS can respond. Runs before first paint.
────────────────────────────────────────────────────────────────── */
export function A11yApplier() {
  const {
    textScale, highContrast, reduceMotion,
    readableFont, underlineLinks, focusHighlight,
  } = useAccessibilityStore();

  useEffect(() => {
    const html = document.documentElement;

    // Text scale
    html.style.setProperty("--text-scale", String(textScale));
    html.style.fontSize = `calc(16px * ${textScale})`;

    // Data attributes → CSS selectors
    html.setAttribute("data-high-contrast",   String(highContrast));
    html.setAttribute("data-reduce-motion",   String(reduceMotion));
    html.setAttribute("data-readable-font",   String(readableFont));
    html.setAttribute("data-underline-links", String(underlineLinks));
    html.setAttribute("data-focus-highlight", String(focusHighlight));

    // Respect OS reduce-motion if user hasn't set explicitly
    const osPrefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (osPrefersReduced && !reduceMotion) {
      html.setAttribute("data-reduce-motion", "true");
    }
  }, [textScale, highContrast, reduceMotion, readableFont, underlineLinks, focusHighlight]);

  return null;
}
