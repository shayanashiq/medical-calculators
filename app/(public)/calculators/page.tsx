import type { Metadata } from "next";
import { CalculatorsBrowseClient } from "@/components/calculators/calculators-browse-client";
import { browseCalculatorsChunk, getCalculatorCount } from "@/lib/calculator-queries";
import { absoluteUrl } from "@/lib/absolute-url";
import { SITE_BRAND, SITE_DOMAIN } from "@/lib/site-brand";

export async function generateMetadata(): Promise<Metadata> {
  const total = await getCalculatorCount();
  const title = "All medical calculators";
  const calculatorsDescription = `Browse all ${total} free online medical calculators and clinical tools on ${SITE_DOMAIN}. Search by name; private, instant results in your browser.`;
  const ogTitle = `${title} | ${SITE_DOMAIN}`;
  const keywords = [
    "medical calculator",
    "medical calculators",
    "health calculator",
    "health calculators",
    "clinical calculator",
    "health assessment tools",
    "online medical tools",
    "medical calculation tools",
    "free online health calculators",
    "medical calculators free",
    "online clinical calculators list",
    "medical calculators list",
    "health calculators collection",
    `${SITE_BRAND}`,
    SITE_DOMAIN,
  ];
  return {
    title,
    description: calculatorsDescription,
    keywords,
    alternates: { canonical: "/calculators" },
    openGraph: {
      url: absoluteUrl("/calculators"),
      title: ogTitle,
      description: calculatorsDescription,
    },
    twitter: {
      card: "summary_large_image",
      title: ogTitle,
      description: calculatorsDescription,
    },
  };
}

export const dynamic = "force-dynamic";

const INITIAL = 12;

export default async function CalculatorsIndexPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const sp = await searchParams;
  const qRaw = typeof sp.q === "string" ? sp.q : "";
  const q = qRaw.trim() || undefined;
  const { items, total } = await browseCalculatorsChunk(0, INITIAL, q);

  return (
    <main className="mx-auto w-full max-w-7xl bg-white px-4 py-6 sm:px-6 lg:px-8">
      <section className="mb-6 max-w-3xl">
        <p className="text-sm leading-7 text-slate-600">
          Browse our collection of free online medical calculators and health assessment tools. Each clinical
          calculator includes clear inputs, instant results, and supporting guidance to help you understand the
          calculation.
        </p>
      </section>
      <CalculatorsBrowseClient initialItems={items} initialTotal={total} initialSearch={qRaw} />
    </main>
  );
}
