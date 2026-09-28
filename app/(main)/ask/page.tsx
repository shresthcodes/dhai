import type { Metadata } from "next";
import { AskPageClient } from "./AskPageClient";

export const metadata: Metadata = {
  title: "Ask the Archive — AI Research Assistant",
  description: "Evidence-grounded AI research assistant for exploring archival knowledge. Demo prototype.",
};

export default function AskPage() {
  return <AskPageClient />;
}
