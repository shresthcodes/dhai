import React from "react";
import { cn } from "@/lib/utils";
import { GoldRule } from "./GoldRule";

interface SectionHeadingProps {
  eyebrow?:  string;
  title:     string;
  subtitle?: string;
  align?:    "left" | "center";
  className?: string;
}

export function SectionHeading({
  eyebrow,
  title,
  subtitle,
  align = "left",
  className,
}: SectionHeadingProps) {
  return (
    <div
      className={cn(
        "space-y-4",
        align === "center" && "text-center items-center flex flex-col",
        className
      )}
    >
      {eyebrow && (
        <p className="eyebrow" aria-label={eyebrow}>
          {eyebrow}
        </p>
      )}
      <h2 className="font-serif text-h2 text-ivory">{title}</h2>
      <GoldRule className={align === "center" ? "mx-auto" : ""} />
      {subtitle && (
        <p className="text-body text-ivory/60 max-w-2xl">{subtitle}</p>
      )}
    </div>
  );
}

export function Section({
  children,
  className,
  id,
}: {
  children: React.ReactNode;
  className?: string;
  id?: string;
}) {
  return (
    <section id={id} className={cn("py-20 lg:py-28", className)}>
      {children}
    </section>
  );
}
