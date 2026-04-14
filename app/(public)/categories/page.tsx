import Link from "next/link";
import type { Metadata } from "next";
import { CategoriesIndexSearch } from "@/components/categories/categories-index-search";
import { getAllCategories } from "@/lib/categories";
import { listCalculators } from "@/lib/calculator-queries";
import { absoluteUrl } from "@/lib/absolute-url";
import { SITE_BRAND, SITE_DOMAIN } from "@/lib/site-brand";

const categoriesDescription = `Explore ${SITE_BRAND} by topic on ${SITE_DOMAIN}: body metrics, fitness, hydration, and clinical tools.`;

export const metadata: Metadata = {
  title: "Categories",
  description: categoriesDescription,
  alternates: { canonical: "/categories" },
  openGraph: {
    url: absoluteUrl("/categories"),
    title: `Categories | ${SITE_DOMAIN}`,
    description: categoriesDescription,
  },
};

export const dynamic = "force-dynamic";

export default async function CategoriesIndexPage() {
  const [all, categories] = await Promise.all([listCalculators(), getAllCategories()]);
  const rows = categories.map((category) => ({
    category,
    calculatorCount: all.filter((c) => c.category === category.slug).length,
  }));

  return (
    <main className="mx-auto w-full max-w-7xl bg-white px-4 py-6 sm:px-6 lg:px-8">
      <CategoriesIndexSearch rows={rows} />
    </main>
  );
}
