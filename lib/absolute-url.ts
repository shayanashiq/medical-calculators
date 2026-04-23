import { SITE_URL } from "@/lib/site-brand";

/** Build an absolute URL for canonical / Open Graph links. */
export function absoluteUrl(path: string): string {
  const base = SITE_URL.replace(/\/$/, "");
  const p = path.startsWith("/") ? path : `/${path}`;
  return `${base}${p}`;
}

