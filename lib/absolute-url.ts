import { SITE_URL } from "@/lib/site-brand";

/** Build an absolute URL for canonical / Open Graph links. */
export function absoluteUrl(path: string): string {
  const base = SITE_URL.replace(/\/$/, "");
  const p = path.startsWith("/") ? path : `/${path}`;
  return `${base}${p}`;
}

/** Absolute image URL for Open Graph (handles full https URLs and site-relative paths). */
export function ogImageAbsoluteUrl(raw: string | null | undefined): string | undefined {
  const t = raw?.trim();
  if (!t) return undefined;
  if (t.startsWith("http://") || t.startsWith("https://")) return t;
  return absoluteUrl(t.startsWith("/") ? t : `/${t}`);
}
