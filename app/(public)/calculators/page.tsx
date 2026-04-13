import Link from "next/link";
import type { Metadata } from "next";
import { CalculatorsBrowseClient } from "@/components/calculators/calculators-browse-client";
import { browseCalculatorsChunk } from "@/lib/calculator-queries";
import { absoluteUrl } from "@/lib/absolute-url";
import { SITE_DOMAIN } from "@/lib/site-brand";

const calculatorsDescription = `Browse every free online medical calculator on ${SITE_DOMAIN}: BMI, BMR, TDEE, body fat, hydration, heart rate zones, creatinine clearance, anion gap, and more.`;

export const metadata: Metadata = {
  title: "All calculators",
  description: calculatorsDescription,
  alternates: { canonical: "/calculators" },
  openGraph: {
    url: absoluteUrl("/calculators"),
    title: `All calculators | ${SITE_DOMAIN}`,
    description: calculatorsDescription,
  },
};

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
    <main className="mx-auto w-full max-w-7xl bg-white px-4 py-10 sm:px-6 lg:px-8">
      <div className="mb-5 text-sm">
        <Link href="/" className="font-semibold text-sky-700 hover:text-sky-800">
          Home
        </Link>
      </div>

      <CalculatorsBrowseClient initialItems={items} initialTotal={total} initialSearch={qRaw} />
    </main>
  );
}
