import React from "react";
import "@/styles/globals.css";

export default function AdminRootLayout({ children }: { children: React.ReactNode }) {
  // No public navbar/footer — admin has its own layout
  return <>{children}</>;
}
