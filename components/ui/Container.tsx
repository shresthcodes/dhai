import React from "react";
import { cn } from "@/lib/utils";

interface ContainerProps {
  children: React.ReactNode;
  className?: string;
  as?: React.ElementType;
  narrow?: boolean;
  wide?: boolean;
}

export function Container({
  children,
  className,
  as: Tag = "div",
  narrow = false,
  wide = false,
}: ContainerProps) {
  return (
    <Tag
      className={cn(
        "mx-auto w-full px-4 sm:px-6 lg:px-8",
        narrow ? "max-w-3xl" : wide ? "max-w-screen-2xl" : "max-w-7xl",
        className
      )}
    >
      {children}
    </Tag>
  );
}
