/** Canonical hostname (no protocol). */
export const SITE_DOMAIN = "medicalcalculators.online";

function getSiteUrl(): string {
  const raw = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  if (raw) return raw.replace(/\/$/, "");
  return `https://${SITE_DOMAIN}`;
}

/** Full site URL for metadata, canonical, and JSON-LD. Set NEXT_PUBLIC_SITE_URL in production if the public URL differs. */
export const SITE_URL = getSiteUrl();

/** Brand phrase for headings and body copy (as requested). */
export const SITE_BRAND = "online medical calculators";

/** Default browser tab title (title case). */
export const SITE_TITLE_DEFAULT = "Online Medical Calculators";

/** Title template for inner pages: "Page | medicalcalculators.online" */
export const SITE_TITLE_TEMPLATE = `%s | ${SITE_DOMAIN}`;

/** Short mark for compact UI (admin sidebar, favicon-style badges). */
export const SITE_MARK = "MC";

/** Primary meta description (~155 chars) for root and fallbacks. */
export const SITE_DESCRIPTION =
  "Free online medical calculators: BMI, BMR, TDEE, body fat, hydration, heart rate zones, creatinine clearance, anion gap & more. Private, instant results in your browser.";

/** SEO keywords (supplemental; keep focused). */
export const SITE_KEYWORDS = [
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
