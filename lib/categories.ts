import { prisma } from "@/lib/prisma";

export type CalculatorCategory = {
  slug: string;
  name: string;
  description: string;
};

/** Default categories used by `prisma/seed` upserts when the DB is empty or you re-seed. */
export const defaultCategoriesSeed: CalculatorCategory[] = [
  {
    slug: "anthropometry",
    name: "Anthropometry",
    description: "Body measurements, composition, and energy requirement tools.",
  },
  {
    slug: "fitness-hydration",
    name: "Fitness & Hydration",
    description: "Daily hydration and heart-rate zone planning calculators.",
  },
  {
    slug: "clinical",
    name: "Clinical",
    description: "Common bedside and lab-derived medical calculation tools.",
  },
];

export async function getAllCategories(): Promise<CalculatorCategory[]> {
  const rows = await prisma.category.findMany({
    orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
  });
  return rows.map((r) => ({ slug: r.slug, name: r.name, description: r.description }));
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
