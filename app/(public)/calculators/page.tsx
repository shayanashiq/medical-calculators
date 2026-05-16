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

export default async function CalculatorsIndexPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const sp = await searchParams;
  const qRaw = typeof sp.q === "string" ? sp.q : "";
  const q = qRaw.trim() || undefined;
  const { items, total } = await browseCalculatorsChunk(0, Number.MAX_SAFE_INTEGER, q);

  return (
    <main className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <section className="mb-8 overflow-hidden rounded-3xl border border-teal-100 bg-gradient-to-br from-teal-50 via-white to-cyan-50 px-6 py-8 shadow-sm sm:px-10">
        <h1 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">All medical calculators</h1>
        <p className="mt-3 max-w-2xl text-base leading-relaxed text-slate-600">
          Search {total} free clinical and wellness tools with instant, private results. Each calculator includes
          plain-language guidance, formulas, and limitations for informed use.
        </p>
      </section>
      <CalculatorsBrowseClient initialItems={items} initialTotal={total} initialSearch={qRaw} />
    </main>
  );
}
