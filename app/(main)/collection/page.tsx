import type { Metadata } from "next";
import { CollectionPageClient } from "./CollectionPageClient";

export const metadata: Metadata = {
  title: "My Collection — DHAI",
  description: "Your personal research collection. Stored on this device only.",
};

export default function CollectionPage() {
  return <CollectionPageClient />;
}
