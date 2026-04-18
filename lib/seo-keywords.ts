import { prisma } from "@/lib/prisma";
import { SITE_KEYWORDS_BASE } from "@/lib/site-brand";

/** Max meta keywords after merging DB names (base list is always added first; then categories; then calculators). */
const MAX_MERGED_KEYWORDS = 96;

function pushUnique(out: string[], seen: Set<string>, value: string) {
  const t = value.trim();
  if (!t || out.length >= MAX_MERGED_KEYWORDS) return;
  const k = t.toLowerCase();
  if (seen.has(k)) return;
  seen.add(k);
  out.push(t);
}

/**
 * Evergreen terms plus every calculator and category name from the database — no manual updates when you add tools.
 */
export async function getMergedSiteKeywords(): Promise<string[]> {
  const [calculators, categories] = await Promise.all([
    prisma.calculator.findMany({
      select: { name: true },
      orderBy: [{ name: "asc" }],
    }),
    prisma.category.findMany({
      select: { name: true },
      orderBy: [{ name: "asc" }],
    }),
  ]);

  const seen = new Set<string>();
  const out: string[] = [];

  for (const kw of SITE_KEYWORDS_BASE) {
    pushUnique(out, seen, kw);
  }

  for (const row of categories) {
    pushUnique(out, seen, row.name);
    pushUnique(out, seen, `${row.name} calculators`);
  }

  for (const row of calculators) {
    pushUnique(out, seen, row.name);
    pushUnique(out, seen, `${row.name} calculator`);
  }

  return out;
}
