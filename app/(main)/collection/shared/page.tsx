"use client";

import React, { useEffect, useState } from "react";
import { Container } from "@/components/ui/Container";
import { DemoBadge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { GoldRule } from "@/components/ui/GoldRule";
import { useCollectionStore, type Collection } from "@/store/collection";
import { decodeShareLink } from "@/lib/collectionExport";
import { useToast } from "@/components/ui/Toast";
import { AlertTriangle } from "lucide-react";

export default function SharedCollectionPage() {
  const [sharedCol, setSharedCol] = useState<Collection | null>(null);
  const [error,     setError]     = useState("");
  const { addCollection, addItem } = useCollectionStore();
  const { toast } = useToast();

  useEffect(() => {
    const hash = window.location.hash.slice(1);
    if (!hash) { setError("No collection data found in the link."); return; }
    const col = decodeShareLink(hash);
    if (!col) { setError("Could not decode the collection link."); return; }
    setSharedCol(col);
  }, []);

  function handleImport() {
    if (!sharedCol) return;
    const id = addCollection(sharedCol.name, sharedCol.description);
    sharedCol.items.forEach((item) => addItem(id, {
      kind: item.kind, refId: item.refId, title: item.title, note: item.note,
    }));
    toast(`"${sharedCol.name}" imported to your collections`, "success");
  }

  return (
    <div className="min-h-screen pt-[4.5rem] flex items-center justify-center">
      <Container narrow>
        <div className="surface rounded-card p-8 space-y-5">
          <div className="flex items-center gap-2">
            <p className="eyebrow text-gold/60">Shared Collection</p>
            <DemoBadge />
          </div>

          {error ? (
            <div className="flex items-center gap-2 text-terracotta/70">
              <AlertTriangle size={16} strokeWidth={1.5} />
              <p className="font-sans text-sm">{error}</p>
            </div>
          ) : sharedCol ? (
            <>
              <h1 className="font-serif text-h2 text-ivory">{sharedCol.name}</h1>
              {sharedCol.description && <p className="font-sans text-caption text-ivory/45">{sharedCol.description}</p>}
              <GoldRule />
              <p className="font-sans text-caption text-ivory/50">
                {sharedCol.items.length} items · Read-only view
              </p>
              <div className="flex items-start gap-2 px-3 py-2 rounded-sharp border border-azure/20 bg-azure/4">
                <AlertTriangle size={12} strokeWidth={1.5} className="text-azure/60 shrink-0 mt-0.5" />
                <p className="font-sans text-[0.72rem] text-ivory/50">
                  Link contains the collection data; no server used (prototype). Items are demo records only.
                </p>
              </div>
              <div className="space-y-2">
                {sharedCol.items.map((item, i) => (
                  <div key={i} className="flex items-center gap-3 px-3 py-2 rounded-sharp border border-[rgba(244,237,224,0.08)]">
                    <span className="eyebrow text-[0.52rem] text-gold/50">{item.kind}</span>
                    <span className="font-sans text-sm text-ivory/65 flex-1 truncate">{item.title}</span>
                  </div>
                ))}
              </div>
              <Button variant="primary" size="md" onClick={handleImport}>
                Import to my collections
              </Button>
            </>
          ) : (
            <p className="font-sans text-caption text-ivory/30">Loading…</p>
          )}
        </div>
      </Container>
    </div>
  );
}
