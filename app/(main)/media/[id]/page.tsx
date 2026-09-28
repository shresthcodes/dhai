import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getMediaItem } from "@/data/mediaService";
import { MediaItemClient } from "./MediaItemClient";

interface Props { params: Promise<{ id: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const item   = await getMediaItem(id);
  if (!item) return { title: "Media not found" };
  return { title: `${item.title} — DHAI`, description: item.summary };
}

export default async function MediaItemPage({ params }: Props) {
  const { id } = await params;
  const item   = await getMediaItem(id);
  if (!item) notFound();
  return <MediaItemClient item={item} />;
}
