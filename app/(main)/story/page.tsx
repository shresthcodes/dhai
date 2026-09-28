import type { Metadata } from "next";
import { StoryPageClient } from "./StoryPageClient";

export const metadata: Metadata = {
  title: "A Life of Ideas — Memorial Story",
  description: "Five-chapter memorial story. Placeholder narrative — verified content to be added.",
};

export default function StoryPage() {
  return <StoryPageClient />;
}
