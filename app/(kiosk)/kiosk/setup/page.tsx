"use client";
import React from "react";
import { useRouter } from "next/navigation";
import { KioskButton } from "@/components/kiosk/KioskButton";
import { ArrowLeft } from "lucide-react";
export default function KioskPage() {
  const router = useRouter();
  return (
    <div className="fixed inset-0 bg-ink flex flex-col items-center justify-center gap-6 p-8">
      <p className="eyebrow text-gold/50">Kiosk · Staff Setup</p>
      <h1 className="font-serif text-[3rem] text-ivory text-center">Staff Setup</h1>
      <p className="font-sans text-ivory/30 text-lg text-center max-w-lg">Full kiosk interface coming in a later build step.</p>
      <KioskButton variant="secondary" size="xl" onClick={() => router.push('/kiosk')}>
        <ArrowLeft size={22} strokeWidth={1.5} />Back to Home
      </KioskButton>
    </div>
  );
}
