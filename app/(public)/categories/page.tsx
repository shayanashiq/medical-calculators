import Link from "next/link";
import type { Metadata } from "next";
import { CategoriesIndexSearch } from "@/components/categories/categories-index-search";
import { getAllCategories, getCategoryCount } from "@/lib/categories";
import { getCalculatorCount, listCalculators } from "@/lib/calculator-queries";
import { absoluteUrl } from "@/lib/absolute-url";
import { SITE_BRAND, SITE_DOMAIN } from "@/lib/site-brand";

export async function generateMetadata(): Promise<Metadata> {
  const [calculatorCount, categoryCount] = await Promise.all([getCalculatorCount(), getCategoryCount()]);
  const categoriesDescription = `Explore ${categoryCount} categories and ${calculatorCount} free ${SITE_BRAND} on ${SITE_DOMAIN}.`;
  const title = "Categories";
  const ogTitle = `${title} | ${SITE_DOMAIN}`;
  return {
    title,
    description: categoriesDescription,
    alternates: { canonical: "/categories" },
    openGraph: {
      url: absoluteUrl("/categories"),
      title: ogTitle,
      description: categoriesDescription,
    },
    twitter: {
      card: "summary_large_image",
      title: ogTitle,
      description: categoriesDescription,
    },
  };
}

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
