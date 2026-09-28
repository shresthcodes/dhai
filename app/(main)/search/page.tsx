import type { Metadata } from "next";
import { SearchPageClient } from "./SearchPageClient";

export const metadata: Metadata = {
  title: "Search — Smart Archive Discovery",
  description: "Semantic search across the archive. Demonstration data only.",
};

export default function SearchPage() {
  return <SearchPageClient />;
}
