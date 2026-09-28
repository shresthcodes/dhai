"use client";
import React from "react";
import { cn } from "@/lib/utils";

interface KioskButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost" | "danger";
  size?:    "lg" | "xl";
  fullWidth?: boolean;
}

const variants = {
  primary:   "bg-gold text-ink hover:bg-gold-soft active:scale-[0.97]",
  secondary: "bg-panel border-2 border-[rgba(244,237,224,0.2)] text-ivory hover:border-gold/40 active:scale-[0.97]",
  ghost:     "bg-transparent border-2 border-[rgba(244,237,224,0.15)] text-ivory/70 hover:border-gold/30 active:scale-[0.97]",
  danger:    "bg-terracotta/20 border-2 border-terracotta/40 text-terracotta/90 hover:bg-terracotta/30 active:scale-[0.97]",
};
const sizes = {
  lg: "px-8 py-5 text-[1.25rem] min-h-[64px] gap-3",
  xl: "px-10 py-6 text-[1.5rem] min-h-[80px] gap-4",
};

export function KioskButton({
  variant = "primary", size = "lg", fullWidth, className, children, ...props
}: KioskButtonProps) {
  return (
    <button
      className={cn(
        "inline-flex items-center justify-center font-sans font-semibold rounded-[20px]",
        "transition-all duration-100 select-none touch-manipulation",
        "focus-visible:outline focus-visible:outline-4 focus-visible:outline-gold focus-visible:outline-offset-2",
        variants[variant], sizes[size],
        fullWidth && "w-full",
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
}
