import { prisma } from "@/lib/prisma";
import { seedCategories } from "@/prisma/seed-data/categories";

export type CalculatorCategory = {
  slug: string;
  name: string;
  description: string;
};

/** Default categories used by `prisma/seed` upserts when the DB is empty or you re-seed. */
export const defaultCategoriesSeed: CalculatorCategory[] = seedCategories;

export async function getAllCategories(): Promise<CalculatorCategory[]> {
  const rows = await prisma.category.findMany({
    orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
  });
  return rows.map((r) => ({ slug: r.slug, name: r.name, description: r.description }));
}

/** For SEO metadata. */
export async function getCategoryCount(): Promise<number> {
  return prisma.category.count();
}

export async function getCategoryBySlug(slug: string): Promise<CalculatorCategory | null> {
  const row = await prisma.category.findUnique({ where: { slug } });
  if (!row) {
    return null;
  }
  return { slug: row.slug, name: row.name, description: row.description };
}

export async function getCategorySlugSet(): Promise<Set<string>> {
  const rows = await prisma.category.findMany({ select: { slug: true } });
  return new Set(rows.map((r) => r.slug));
}
