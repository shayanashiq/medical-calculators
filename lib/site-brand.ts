/** Canonical hostname (no protocol). */
export const SITE_DOMAIN = "medicalcalculators.online";

function getSiteUrl(): string {
  const raw = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  if (raw) return raw.replace(/\/$/, "");
  return `https://${SITE_DOMAIN}`;
}

/** Full site URL for metadata, canonical, and JSON-LD. Set NEXT_PUBLIC_SITE_URL in production if the public URL differs. */
export const SITE_URL = getSiteUrl();

/**
 * Submit this exact URL in Google Search Console → Sitemaps (and keep it in AdSense / policy checks).
 * Served by `app/sitemap.ts` at `/sitemap.xml`.
 */
export const SITE_SITEMAP_URL = `${SITE_URL.replace(/\/$/, "")}/sitemap.xml`;

/** Brand phrase for headings and body copy (as requested). */
export const SITE_BRAND = "online medical calculators";

/** Default browser tab title (title case). */
export const SITE_TITLE_DEFAULT = "Online Medical Calculators";

/** Title template for inner pages: "Page | medicalcalculators.online" */
export const SITE_TITLE_TEMPLATE = `%s | ${SITE_DOMAIN}`;

/** Short mark for compact UI (admin sidebar, favicon-style badges). */
export const SITE_MARK = "MC";

/** Primary meta description (~155 chars) for root layout and fallbacks — no tool names (those come from the DB on key pages). */
export const SITE_DESCRIPTION =
  "Free online medical calculators for clinical and wellness use. Browse tools by category; private, instant results in your browser.";

/**
 * Fixed high-value phrases (always included) — merged at runtime with every calculator and category name from the database
 * (see `getMergedSiteKeywords` in `lib/seo-keywords.ts`).
 */
export const SITE_KEYWORDS_BASE = [
  "medical calculators online",
  "online medical calculators",
  "clinical calculator",
  "BMI calculator",
  "BMR calculator",
  "TDEE calculator",
  "creatinine clearance calculator",
  "anion gap calculator",
  "target heart rate calculator",
  "hydration calculator",
  SITE_DOMAIN,
] as const;
