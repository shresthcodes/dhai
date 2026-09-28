import type { Metadata } from "next";
import { ArchivePageClient } from "./ArchivePageClient";

export const metadata: Metadata = {
  title: "Archive — Explore the Collection",
  description: "Browse all archival materials. Demonstration data only.",
};

export default function ArchivePage() {
  return <ArchivePageClient />;
}
