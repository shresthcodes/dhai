import React from "react";
import { cn } from "@/lib/utils";
import type { CapabilityStatus } from "@/store/admin/types";

const styles: Record<CapabilityStatus, string> = {
  IMPLEMENTED: "text-gold/80 bg-gold/10 border-gold/30",
  DEMO:        "text-azure/70 bg-azure/8 border-azure/25",
  PLANNED:     "text-ivory/35 bg-ivory/4 border-ivory/15",
};

export function CapabilityChip({
  status, className,
}: { status: CapabilityStatus; className?: string }) {
  return (
    <span className={cn(
      "inline-flex items-center font-sans text-[0.55rem] font-semibold tracking-widest uppercase",
      "px-2 py-0.5 rounded-sharp border",
      styles[status], className
    )}>
      {status}
    </span>
  );
}
