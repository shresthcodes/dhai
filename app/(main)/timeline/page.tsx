import type { Metadata } from "next";
import { TimelinePageClient } from "./TimelinePageClient";

export const metadata: Metadata = {
  title: "The Journey — Interactive Timeline",
  description: "An interactive timeline. Seed data — verify each event against primary sources before public use.",
};

export default function TimelinePage() {
  return <TimelinePageClient />;
}
