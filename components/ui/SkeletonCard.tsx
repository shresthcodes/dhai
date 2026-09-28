import React from "react";
import { cn } from "@/lib/utils";

function Bone({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "rounded bg-[rgba(244,237,224,0.06)] animate-pulse",
        className
      )}
    />
  );
}

export function SkeletonCard({ view = "grid" }: { view?: "grid" | "list" }) {
  if (view === "list") {
    return (
      <div className="flex gap-4 surface rounded-card p-4 border border-[rgba(244,237,224,0.08)]">
        <Bone className="w-16 h-16 shrink-0 rounded-sharp" />
        <div className="flex-1 space-y-2.5">
          <Bone className="h-4 w-3/4" />
          <Bone className="h-3 w-full" />
          <Bone className="h-3 w-1/2" />
          <div className="flex gap-2 pt-1">
            <Bone className="h-5 w-16 rounded-sharp" />
            <Bone className="h-5 w-12 rounded-sharp" />
          </div>
        </div>
      </div>
    );
  }
  return (
    <div className="surface rounded-card p-5 space-y-3 border border-[rgba(244,237,224,0.08)]">
      <Bone className="h-32 w-full rounded-sharp" />
      <Bone className="h-5 w-3/4" />
      <Bone className="h-3 w-full" />
      <Bone className="h-3 w-5/6" />
      <div className="flex gap-2 pt-1">
        <Bone className="h-5 w-16 rounded-sharp" />
        <Bone className="h-5 w-12 rounded-sharp" />
      </div>
    </div>
  );
}

export function SkeletonGrid({ count = 6, view = "grid" }: { count?: number; view?: "grid" | "list" }) {
  return (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonCard key={i} view={view} />
      ))}
    </>
  );
}
