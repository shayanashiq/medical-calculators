import type { Metadata } from "next";
import { BrowseByCategorySection } from "@/components/home/browse-by-category-section";
import { HeroSection } from "@/components/home/hero-section";
import { PopularCalculatorsSection } from "@/components/home/popular-calculators-section";
import { getCalculatorCount, listCalculators } from "@/lib/calculator-queries";
import { absoluteUrl } from "@/lib/absolute-url";
import { SITE_BRAND, SITE_TITLE_DEFAULT } from "@/lib/site-brand";

export async function generateMetadata(): Promise<Metadata> {
  const total = await getCalculatorCount();
  const description = `Browse ${total} free online medical calculators — ${SITE_BRAND}. Private, instant results in your browser.`;
  return {
    title: { absolute: SITE_TITLE_DEFAULT },
    description,
    alternates: { canonical: "/" },
    openGraph: {
      url: absoluteUrl("/"),
      title: SITE_TITLE_DEFAULT,
      description,
    },
    twitter: {
      card: "summary_large_image",
      title: SITE_TITLE_DEFAULT,
      description,
    },
  };
}

export const dynamic = "force-dynamic";

const POPULAR_LIMIT = 12;

export default async function Home() {
  const all = await listCalculators();
  const popular = all.slice(0, POPULAR_LIMIT);

  const itemListJsonLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: `${SITE_TITLE_DEFAULT} — calculators`,
    numberOfItems: all.length,
    itemListElement: all.map((c, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: c.name,
      url: absoluteUrl(`/calculators/${c.slug}`),
    })),
  };

  return (
    <main className="w-full bg-white">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListJsonLd) }}
      />
      <HeroSection />
      <BrowseByCategorySection />
      <PopularCalculatorsSection calculators={popular} totalCount={all.length} />
      {/* <HomeInfoStrip /> */}
    </main>
  );
}
