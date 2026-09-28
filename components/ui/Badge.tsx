import React from "react";
import { cn } from "@/lib/utils";

type BadgeVariant = "demo" | "gold" | "azure" | "terracotta" | "neutral";

interface BadgeProps {
  variant?: BadgeVariant;
  children: React.ReactNode;
  className?: string;
}

const variantStyles: Record<BadgeVariant, string> = {
  demo:       "bg-terracotta/15 text-terracotta border-terracotta/30 font-semibold tracking-widest",
  gold:       "bg-gold/10 text-gold border-gold/30",
  azure:      "bg-azure/10 text-azure border-azure/30",
  terracotta: "bg-terracotta/10 text-terracotta border-terracotta/30",
  neutral:    "bg-ivory/8 text-ivory/60 border-ivory/15",
};

export function Badge({ variant = "neutral", children, className }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5",
        "font-sans text-[0.625rem] uppercase tracking-[0.12em]",
        "px-2.5 py-1 rounded-sharp border",
        variantStyles[variant],
        className
      )}
    >
      {children}
    </span>
  );
}

export function DemoBadge() {
  return (
    <Badge variant="demo" aria-label="This item contains demonstration data only">
      <span className="inline-block w-1.5 h-1.5 rounded-full bg-terracotta animate-pulse" />
      Demo Data
    </Badge>
  );
}
