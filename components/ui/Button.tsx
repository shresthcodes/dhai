"use client";

import React, { useRef } from "react";
import Link from "next/link";
import { motion, useMotionValue, useSpring } from "framer-motion";
import { cn } from "@/lib/utils";

export type ButtonVariant = "primary" | "secondary" | "ghost";
export type ButtonSize    = "sm" | "md" | "lg";

interface ButtonBaseProps {
  variant?:  ButtonVariant;
  size?:     ButtonSize;
  className?: string;
  children:  React.ReactNode;
}

interface ButtonAsButton extends ButtonBaseProps, Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, keyof ButtonBaseProps> {
  href?: undefined;
}

interface ButtonAsLink extends ButtonBaseProps {
  href: string;
  target?: string;
  rel?: string;
}

type ButtonProps = ButtonAsButton | ButtonAsLink;

export const variantStyles: Record<ButtonVariant, string> = {
  primary:
    "bg-gold text-ink font-semibold border border-gold hover:bg-gold-soft hover:border-gold-soft " +
    "shadow-[0_0_0_0_rgba(201,162,75,0)] hover:shadow-glow",
  secondary:
    "bg-transparent text-ivory border border-[rgba(244,237,224,0.25)] hover:border-gold hover:text-gold",
  ghost:
    "bg-transparent text-ivory/70 border border-transparent hover:text-gold hover:bg-white/5",
};

export const sizeStyles: Record<ButtonSize, string> = {
  sm: "px-4 py-2 text-[0.8125rem] gap-1.5",
  md: "px-6 py-2.5 text-sm gap-2",
  lg: "px-8 py-3.5 text-base gap-2.5",
};

const baseStyles =
  "relative inline-flex items-center justify-center font-sans font-medium rounded-sharp " +
  "transition-all duration-200 ease-out select-none cursor-pointer " +
  "focus-visible:outline focus-visible:outline-2 focus-visible:outline-gold focus-visible:outline-offset-2";

export function Button({ variant = "primary", size = "md", className, children, href, ...rest }: ButtonProps) {
  const elRef = useRef<HTMLElement>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const springX = useSpring(x, { stiffness: 500, damping: 30 });
  const springY = useSpring(y, { stiffness: 500, damping: 30 });

  const combined = cn(baseStyles, variantStyles[variant], sizeStyles[size], className);

  function handleMouseMove(e: React.MouseEvent<HTMLElement>) {
    const rect = elRef.current?.getBoundingClientRect();
    if (!rect) return;
    x.set(((e.clientX - (rect.left + rect.width / 2)) / rect.width) * 10);
    y.set(((e.clientY - (rect.top + rect.height / 2)) / rect.height) * 6);
  }
  function handleMouseLeave() { x.set(0); y.set(0); }

  if (href) {
    const { href: _href, ...linkRest } = rest as ButtonAsLink;
    return (
      <motion.span style={{ x: springX, y: springY }} className="inline-flex">
        <Link
          href={href}
          className={combined}
          onMouseMove={handleMouseMove as React.MouseEventHandler<HTMLAnchorElement>}
          onMouseLeave={handleMouseLeave}
          {...linkRest}
        >
          {children}
        </Link>
      </motion.span>
    );
  }

  const { onClick, disabled, type, ...btnRest } = rest as ButtonAsButton;
  return (
    <motion.button
      ref={elRef as React.Ref<HTMLButtonElement>}
      style={{ x: springX, y: springY }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      whileTap={{ scale: 0.97 }}
      onClick={onClick}
      disabled={disabled}
      type={type ?? "button"}
      className={combined}
      {...(btnRest as React.ComponentPropsWithoutRef<typeof motion.button>)}
    >
      {children}
    </motion.button>
  );
}
