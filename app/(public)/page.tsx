import type { Metadata } from "next";
import { BrowseByCategorySection } from "@/components/home/browse-by-category-section";
import { HeroSection } from "@/components/home/hero-section";
import { PopularCalculatorsSection } from "@/components/home/popular-calculators-section";
import { listCalculators } from "@/lib/calculator-queries";
import { absoluteUrl } from "@/lib/absolute-url";
import { SITE_DESCRIPTION, SITE_TITLE_DEFAULT } from "@/lib/site-brand";

export const metadata: Metadata = {
  title: { absolute: SITE_TITLE_DEFAULT },
  description: SITE_DESCRIPTION,
  alternates: { canonical: "/" },
  openGraph: {
    url: absoluteUrl("/"),
    title: SITE_TITLE_DEFAULT,
    description: SITE_DESCRIPTION,
  },
};

export const dynamic = "force-dynamic";

const POPULAR_LIMIT = 12;

export default async function Home() {
  const all = await listCalculators();
  const popular = all.slice(0, POPULAR_LIMIT);

  return (
    <main className="w-full bg-white">
      <HeroSection />
      <BrowseByCategorySection />
      <PopularCalculatorsSection calculators={popular} totalCount={all.length} />
      {/* <HomeInfoStrip /> */}
    </main>
  );
}
