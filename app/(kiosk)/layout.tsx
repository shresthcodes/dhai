import React from "react";
import "@/styles/globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

export default function KioskRootLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
