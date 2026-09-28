import React from "react";
import { cn } from "@/lib/utils";

interface GoldRuleProps {
  className?: string;
  width?: "sm" | "md" | "full";
}

export function GoldRule({ className, width = "md" }: GoldRuleProps) {
  const widths = { sm: "w-8", md: "w-16", full: "w-full" };
  return (
    <div
      aria-hidden="true"
      className={cn(
        "h-px bg-gradient-to-r from-transparent via-gold to-transparent opacity-70",
        widths[width],
        className
      )}
    />
  );
}

export function Divider({ className }: { className?: string }) {
  return (
    <hr
      aria-hidden="true"
      className={cn("border-0 border-t border-[rgba(244,237,224,0.10)]", className)}
    />
  );
}
