import type { Metadata } from "next";
import { MediaPageClient } from "./MediaPageClient";

export const metadata: Metadata = {
  title: "Audio-Visual Archive — DHAI",
  description: "Explore lectures, documentaries, interviews, speeches and audio recordings. Demonstration data only.",
};

export default function MediaPage() {
  return <MediaPageClient />;
}
