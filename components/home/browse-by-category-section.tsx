import { HomeCategorySpotlight } from "@/components/home/home-category-spotlight";
import { getAllCategories } from "@/lib/categories";
import { listCalculators } from "@/lib/calculator-queries";

export async function BrowseByCategorySection() {
  const [categories, calculators] = await Promise.all([getAllCategories(), listCalculators()]);
  return <HomeCategorySpotlight categories={categories} calculators={calculators} />;
}
