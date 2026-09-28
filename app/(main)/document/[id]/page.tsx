import type { Metadata } from "next";
import { notFound }       from "next/navigation";
import { getArchiveItem } from "@/data/archiveService";
import { DocumentClient } from "./DocumentClient";

interface Props { params: Promise<{ id: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id }  = await params;
  const item    = await getArchiveItem(id);
  if (!item) return { title: "Document not found" };
  return {
    title:       `${item.title} — DHAI`,
    description: item.summary,
  };
}

export default async function DocumentPage({ params }: Props) {
  const { id } = await params;
  const item   = await getArchiveItem(id);
  if (!item) notFound();
  return <DocumentClient item={item} />;
}
