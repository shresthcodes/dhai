import React from "react";
import { Navbar }         from "@/components/layout/Navbar";
import { Footer }         from "@/components/layout/Footer";
import { A11yApplier }    from "@/components/layout/A11yApplier";
import { LenisProvider }  from "@/components/layout/LenisProvider";
import { ToastProvider }  from "@/components/ui/Toast";
import { MiniPlayer }     from "@/components/media/MiniPlayer";
import { ShortcutsProvider } from "@/components/ui/ShortcutsProvider";

export default function MainLayout({ children }: { children: React.ReactNode }) {
  return (
    <ToastProvider>
      <A11yApplier />
      <LenisProvider />
      <Navbar />
      <ShortcutsProvider />
      <main id="main-content" tabIndex={-1} className="outline-none min-h-screen">
        {children}
      </main>
      <Footer />
      <MiniPlayer />
    </ToastProvider>
  );
}
