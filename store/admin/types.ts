/* ─── Admin Portal Types ─────────────────────────────────────────────
   PROTOTYPE — no real authentication, server or security claims.
──────────────────────────────────────────────────────────────── */

export type AdminRole = "archivist" | "reviewer" | "administrator" | "auditor";

export type AssetKind = "scan" | "document" | "audio" | "video" | "photograph";

export type AssetLifecycle =
  | "uploaded" | "ocr-queued" | "ocr-done"
  | "in-review" | "approved" | "published" | "rejected";

export type AccessRights = "open" | "restricted" | "staff-only";

export interface Checksum {
  algo:        "SHA-256";
  hex:         string;
  computedAt:  string;   // ISO
}

export interface OcrWord {
  text:        string;
  confidence:  number;
  bbox:        { x0: number; y0: number; x1: number; y1: number };
}

export interface OcrResult {
  status:       "pending" | "running" | "done" | "failed";
  text:         string;
  wordConfidence: OcrWord[];
  engine:       string;
  validated:    boolean;
  validatedAt?: string;
  languageNote?: string;
  needsSpecialist: boolean;
}

export interface MetadataRecord {
  documentId:    string;
  title:         string;
  date:          string | null;
  language:      string;
  type:          string;
  topic:         string[];
  collection:    string;
  source:        string;
  keywords:      string[];
  accessRights:  AccessRights;
  rightsNote:    string;
  provenanceNote:string;
  completeness:  number;   // 0-100, computed
}

export interface HistoryEntry {
  at:     string;
  role:   AdminRole;
  action: string;
  detail: string;
}

export interface AdminAsset {
  id:          string;
  kind:        AssetKind;
  fileName:    string;
  mime:        string;
  sizeBytes:   number;
  uploadedAt:  string;
  uploadedBy:  AdminRole;
  blobKey:     string | null;   // IndexedDB key
  checksum:    Checksum | null;
  lifecycle:   AssetLifecycle;
  metadata:    MetadataRecord;
  ocr?:        OcrResult;
  history:     HistoryEntry[];
  isDemo:      boolean;
}

export interface ActivityLogEntry {
  id:       string;
  at:       string;
  role:     AdminRole;
  action:   string;
  targetId: string;
  detail:   string;
}

/* ─── RBAC permission matrix ─────────────────────────────────────── */
export type AdminPermission =
  | "view" | "upload" | "edit_metadata" | "run_ocr" | "approve"
  | "publish" | "delete" | "manage_vocab" | "manage_access" | "view_logs";

export const ROLE_PERMISSIONS: Record<AdminRole, AdminPermission[]> = {
  auditor:       ["view", "view_logs"],
  archivist:     ["view", "upload", "edit_metadata", "run_ocr", "view_logs"],
  reviewer:      ["view", "upload", "edit_metadata", "run_ocr", "approve", "view_logs"],
  administrator: ["view", "upload", "edit_metadata", "run_ocr", "approve", "publish",
                  "delete", "manage_vocab", "manage_access", "view_logs"],
};

export function can(role: AdminRole | null | undefined, perm: AdminPermission): boolean {
  if (!role) return false;
  return ROLE_PERMISSIONS[role]?.includes(perm) ?? false;
}

/* ─── Capability status chip ─────────────────────────────────────── */
export type CapabilityStatus = "IMPLEMENTED" | "DEMO" | "PLANNED";
