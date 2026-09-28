/* ─── Central i18n entry point ───────────────────────────────────────
   Full typed translation system with EN/HI/GU support.
   Missing hi/gu keys fall back to English automatically.

   translationReview: 'pending' — switch to 'reviewed' after native review.
────────────────────────────────────────────────────────────────── */
import type { Language } from "@/data/models";
import { en, type I18nKey } from "./i18n/en";
import { hi } from "./i18n/hi";
import { gu } from "./i18n/gu";

export type { I18nKey };
export { en };

export const translationReview: "pending" | "reviewed" = "pending";

/* ─── Interpolation helper ────────────────────────────────────────── */
function interpolate(str: string, vars?: Record<string, string | number>): string {
  if (!vars) return str;
  return str.replace(/\{(\w+)\}/g, (_, key) => String(vars[key] ?? `{${key}}`));
}

/* ─── Core t() function — accepts any string, falls back to English ── */
export function t(
  key: string,
  lang: Language = "en",
  vars?: Record<string, string | number>
): string {
  const dict = lang === "hi" ? hi : lang === "gu" ? gu : en;
  const val  = (dict as Record<string, string>)[key] ?? (en as Record<string, string>)[key];
  return interpolate(val ?? key, vars);
}

/* ─── React hook ──────────────────────────────────────────────────── */
export function useTranslations(lang: Language) {
  return (key: string, vars?: Record<string, string | number>) => t(key, lang, vars);
}

/* ─── Legacy compat ──────────────────────────────────────────────── */
export type TranslationKey = I18nKey;
