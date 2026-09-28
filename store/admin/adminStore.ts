import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type { AdminAsset, ActivityLogEntry, AdminRole, AssetLifecycle, MetadataRecord, OcrResult } from "./types";
import { SEED_ASSETS, SEED_ACTIVITY } from "./seedData";

function uid() { return `asset-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`; }
function logId() { return `log-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`; }

interface AdminState {
  // Auth (mock)
  currentRole: AdminRole | null;
  signIn:      (role: AdminRole) => void;
  signOut:     () => void;

  // Assets
  assets:      AdminAsset[];
  addAsset:    (a: Omit<AdminAsset, "id">) => string;
  updateAsset: (id: string, patch: Partial<AdminAsset>) => void;
  deleteAsset: (id: string) => void;
  setLifecycle:(id: string, lc: AssetLifecycle, role: AdminRole, detail?: string) => void;
  updateMetadata: (id: string, meta: Partial<MetadataRecord>) => void;
  setOcr:      (id: string, ocr: OcrResult) => void;
  setChecksum: (id: string, hex: string) => void;

  // Activity log
  activity:    ActivityLogEntry[];
  log:         (role: AdminRole, action: string, targetId: string, detail: string) => void;

  // Reset
  reset:       () => void;
}

export const useAdminStore = create<AdminState>()(
  persist(
    (set, get) => ({
      currentRole: null,
      signIn:  (role) => set({ currentRole: role }),
      signOut: ()     => set({ currentRole: null }),

      assets:   SEED_ASSETS,
      activity: SEED_ACTIVITY,

      addAsset: (a) => {
        const id = uid();
        set((s) => ({ assets: [...s.assets, { ...a, id }] }));
        return id;
      },

      updateAsset: (id, patch) => set((s) => ({
        assets: s.assets.map((a) => a.id === id ? { ...a, ...patch } : a),
      })),

      deleteAsset: (id) => set((s) => ({
        assets: s.assets.filter((a) => a.id !== id),
      })),

      setLifecycle: (id, lc, role, detail = "") => set((s) => ({
        assets: s.assets.map((a) =>
          a.id === id
            ? {
                ...a,
                lifecycle: lc,
                history: [...a.history, {
                  at: new Date().toISOString(), role, action: lc, detail,
                }],
              }
            : a
        ),
      })),

      updateMetadata: (id, meta) => set((s) => ({
        assets: s.assets.map((a) => {
          if (a.id !== id) return a;
          const merged = { ...a.metadata, ...meta };
          // Compute completeness
          const fields = [
            merged.title, merged.date !== null,
            merged.language, merged.type, merged.topic.length > 0,
            merged.collection, merged.source, merged.keywords.length > 0,
            merged.accessRights, merged.rightsNote, merged.provenanceNote,
          ];
          const complete = Math.round((fields.filter(Boolean).length / fields.length) * 100);
          return { ...a, metadata: { ...merged, completeness: complete } };
        }),
      })),

      setOcr: (id, ocr) => set((s) => ({
        assets: s.assets.map((a) =>
          a.id === id
            ? { ...a, ocr, lifecycle: ocr.status === "done" ? "ocr-done" : a.lifecycle }
            : a
        ),
      })),

      setChecksum: (id, hex) => set((s) => ({
        assets: s.assets.map((a) =>
          a.id === id
            ? { ...a, checksum: { algo: "SHA-256", hex, computedAt: new Date().toISOString() } }
            : a
        ),
      })),

      log: (role, action, targetId, detail) => set((s) => ({
        activity: [
          { id: logId(), at: new Date().toISOString(), role, action, targetId, detail },
          ...s.activity,
        ].slice(0, 500),
      })),

      reset: () => set({ assets: SEED_ASSETS, activity: SEED_ACTIVITY, currentRole: null }),
    }),
    {
      name: "dhai-admin-v1",
      storage: createJSONStorage(() =>
        typeof window !== "undefined"
          ? localStorage
          : { getItem: () => null, setItem: () => {}, removeItem: () => {} }
      ),
    }
  )
);

/* ─── Computed helpers ───────────────────────────────────────────── */
export function computeStats(assets: AdminAsset[]) {
  const total      = assets.length;
  const byKind     = assets.reduce<Record<string, number>>((a, i) => { a[i.kind] = (a[i.kind] ?? 0) + 1; return a; }, {});
  const byLifecycle= assets.reduce<Record<string, number>>((a, i) => { a[i.lifecycle] = (a[i.lifecycle] ?? 0) + 1; return a; }, {});
  const ocrQueue   = assets.filter((a) => a.lifecycle === "ocr-queued").length;
  const needsMeta  = assets.filter((a) => a.metadata.completeness < 60).length;
  const awaitingReview = assets.filter((a) => a.lifecycle === "in-review").length;
  const published  = assets.filter((a) => a.lifecycle === "published").length;
  const noChecksum = assets.filter((a) => !a.checksum).length;
  return { total, byKind, byLifecycle, ocrQueue, needsMeta, awaitingReview, published, noChecksum };
}
