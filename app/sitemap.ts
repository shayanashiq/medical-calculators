import type { MetadataRoute } from "next";
import { prisma } from "@/lib/prisma";
import { absoluteUrl } from "@/lib/absolute-url";

/** Refresh sitemap periodically so new calculators appear without a redeploy. */
export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [calculators, categories] = await Promise.all([
    prisma.calculator.findMany({
      select: { slug: true, updatedAt: true },
      orderBy: { name: "asc" },
    }),
    prisma.category.findMany({
      select: { slug: true, updatedAt: true },
      orderBy: { name: "asc" },
    }),
  ]);

  const now = new Date();
  const entries: MetadataRoute.Sitemap = [
    { url: absoluteUrl("/"), lastModified: now, changeFrequency: "weekly", priority: 1 },
    { url: absoluteUrl("/calculators"), lastModified: now, changeFrequency: "daily", priority: 0.95 },
    { url: absoluteUrl("/categories"), lastModified: now, changeFrequency: "weekly", priority: 0.9 },
    { url: absoluteUrl("/blog"), lastModified: now, changeFrequency: "monthly", priority: 0.65 },
    { url: absoluteUrl("/privacy"), lastModified: now, changeFrequency: "yearly", priority: 0.35 },
    { url: absoluteUrl("/terms"), lastModified: now, changeFrequency: "yearly", priority: 0.35 },
  ];

  for (const c of categories) {
    entries.push({
      url: absoluteUrl(`/categories/${c.slug}`),
      lastModified: c.updatedAt,
      changeFrequency: "weekly",
      priority: 0.85,
    });
  }

  for (const calc of calculators) {
    entries.push({
      url: absoluteUrl(`/calculators/${calc.slug}`),
      lastModified: calc.updatedAt,
      changeFrequency: "weekly",
      priority: 0.9,
    });
  }

  return entries;
}
