"use client";

import React, { useState, useEffect } from "react";
import { ShortcutsSheet } from "./ShortcutsSheet";

export function ShortcutsProvider() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      const tag = (e.target as HTMLElement).tagName;
      if (tag === "INPUT" || tag === "TEXTAREA") return;
      if (e.key === "?") setOpen((v) => !v);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return <ShortcutsSheet open={open} onClose={() => setOpen(false)} />;
}
