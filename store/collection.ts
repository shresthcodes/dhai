import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

/* ─── Collection Item kinds ──────────────────────────────────────── */
export type CollectionItemKind =
  | "document" | "media" | "clip" | "timeline-event"
  | "story-chapter" | "ai-answer" | "note";

export interface CollectionItem {
  id:       string;           // unique within collection
  kind:     CollectionItemKind;
  refId:    string;           // references archive/media/timeline id
  title:    string;
  addedAt:  string;           // ISO
  note?:    string;
  order:    number;
  // kind-specific extras
  clip?:    { startSec: number; endSec: number };
  answer?:  { question: string; answerText: string; sources: string[]; mode: string };
}

export interface Collection {
  id:          string;
  name:        string;
  description: string;
  createdAt:   string;
  updatedAt:   string;
  items:       CollectionItem[];
}

interface CollectionState {
  // Schema version for migrations
  _version:    number;
  collections: Collection[];

  // Legacy compat — flat saved ids (derived from items)
  savedIds:    string[];

  // Actions
  addCollection:    (name: string, description?: string) => string;
  removeCollection: (id: string) => void;
  renameCollection: (id: string, name: string) => void;
  duplicateCollection: (id: string) => void;

  addItem:    (collectionId: string, item: Omit<CollectionItem, "id" | "addedAt" | "order">) => void;
  removeItem: (collectionIdOrItemId: string, itemId?: string) => void;
  updateNote: (collectionId: string, itemId: string, note: string) => void;
  reorderItem:(collectionId: string, itemId: string, direction: "up" | "down") => void;
  bulkRemove: (collectionId: string, itemIds: string[]) => void;

  // Legacy helpers (backward compat)
  saveItem:   (id: string, title?: string, kind?: CollectionItemKind) => void;
  isSaved:    (id: string) => boolean;
  clearAll:   () => void;
}

/* ─── ID generator ────────────────────────────────────────────────── */
function uid() { return `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`; }

function mkCollection(name: string, description = ""): Collection {
  const now = new Date().toISOString();
  return { id: uid(), name, description, createdAt: now, updatedAt: now, items: [] };
}

export const useCollectionStore = create<CollectionState>()(
  persist(
    (set, get) => ({
      _version:    2,
      collections: [mkCollection("My Research", "Default research collection")],
      savedIds:    [],

      addCollection: (name, description = "") => {
        const col = mkCollection(name, description);
        set((s) => ({ collections: [...s.collections, col] }));
        return col.id;
      },

      removeCollection: (id) => set((s) => ({
        collections: s.collections.filter((c) => c.id !== id),
      })),

      renameCollection: (id, name) => set((s) => ({
        collections: s.collections.map((c) =>
          c.id === id ? { ...c, name, updatedAt: new Date().toISOString() } : c
        ),
      })),

      duplicateCollection: (id) => set((s) => {
        const src = s.collections.find((c) => c.id === id);
        if (!src) return s;
        const now  = new Date().toISOString();
        const copy = { ...src, id: uid(), name: `${src.name} (copy)`, createdAt: now, updatedAt: now, items: [...src.items] };
        return { collections: [...s.collections, copy] };
      }),

      addItem: (collectionId, item) => set((s) => {
        const now = new Date().toISOString();
        const col = s.collections.find((c) => c.id === collectionId);
        if (!col) return s;
        const maxOrder = col.items.reduce((m, i) => Math.max(m, i.order), -1);
        const newItem: CollectionItem = { ...item, id: uid(), addedAt: now, order: maxOrder + 1 };
        const updatedCols = s.collections.map((c) =>
          c.id === collectionId
            ? { ...c, items: [...c.items, newItem], updatedAt: now }
            : c
        );
        return {
          collections: updatedCols,
          savedIds:    Array.from(new Set([...s.savedIds, item.refId])),
        };
      }),

      removeItem: (collectionIdOrItemId: string, itemId?: string) => set((s) => {
        // Legacy: single arg = remove by refId from all collections
        if (!itemId) {
          const updatedCols = s.collections.map((c) => ({
            ...c,
            items: c.items.filter((i) => i.refId !== collectionIdOrItemId && i.id !== collectionIdOrItemId),
          }));
          const allRefIds = new Set(updatedCols.flatMap((c) => c.items.map((i) => i.refId)));
          return { collections: updatedCols, savedIds: Array.from(allRefIds) };
        }
        // New: two args = collectionId + itemId
        const updatedCols = s.collections.map((c) =>
          c.id === collectionIdOrItemId
            ? { ...c, items: c.items.filter((i) => i.id !== itemId), updatedAt: new Date().toISOString() }
            : c
        );
        const allRefIds = new Set(updatedCols.flatMap((c) => c.items.map((i) => i.refId)));
        return { collections: updatedCols, savedIds: Array.from(allRefIds) };
      }),

      updateNote: (collectionId, itemId, note) => set((s) => ({
        collections: s.collections.map((c) =>
          c.id === collectionId
            ? { ...c, items: c.items.map((i) => i.id === itemId ? { ...i, note } : i), updatedAt: new Date().toISOString() }
            : c
        ),
      })),

      reorderItem: (collectionId, itemId, direction) => set((s) => {
        const col = s.collections.find((c) => c.id === collectionId);
        if (!col) return s;
        const items  = [...col.items].sort((a, b) => a.order - b.order);
        const idx    = items.findIndex((i) => i.id === itemId);
        if (direction === "up" && idx > 0) {
          [items[idx - 1].order, items[idx].order] = [items[idx].order, items[idx - 1].order];
        } else if (direction === "down" && idx < items.length - 1) {
          [items[idx + 1].order, items[idx].order] = [items[idx].order, items[idx + 1].order];
        }
        return {
          collections: s.collections.map((c) =>
            c.id === collectionId ? { ...c, items, updatedAt: new Date().toISOString() } : c
          ),
        };
      }),

      bulkRemove: (collectionId, itemIds) => set((s) => {
        const idSet = new Set(itemIds);
        return {
          collections: s.collections.map((c) =>
            c.id === collectionId
              ? { ...c, items: c.items.filter((i) => !idSet.has(i.id)), updatedAt: new Date().toISOString() }
              : c
          ),
        };
      }),

      // Legacy compat — saves to first collection
      saveItem: (id: string, title = "Saved item", kind: CollectionItemKind = "document") => {
        const state = get();
        const firstCol = state.collections[0];
        if (!firstCol) return;
        // Don't duplicate
        if (firstCol.items.some((i) => i.refId === id)) return;
        get().addItem(firstCol.id, { kind, refId: id, title });
      },

      isSaved: (id) => get().savedIds.includes(id),

      clearAll: () => set({ collections: [mkCollection("My Research")], savedIds: [] }),
    }),
    {
      name:    "dhai-collection-v2",
      version: 2,
      storage: createJSONStorage(() =>
        typeof window !== "undefined"
          ? localStorage
          : { getItem: () => null, setItem: () => {}, removeItem: () => {} }
      ),
      // Migrate from v1 (flat savedIds)
      migrate: (persisted, version) => {
        if (version < 2) {
          const old = persisted as { savedIds?: string[] };
          const col  = mkCollection("My Research");
          (old.savedIds ?? []).forEach((id, i) => {
            col.items.push({
              id: uid(), kind: "document", refId: id, title: `Saved item ${i + 1}`,
              addedAt: new Date().toISOString(), order: i,
            });
          });
          return { _version: 2, collections: [col], savedIds: old.savedIds ?? [] };
        }
        return persisted as CollectionState;
      },
    }
  )
);
