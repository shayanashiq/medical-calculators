import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { CalculatorTileCard } from "@/components/cards/calculator-tile-card";
import { DynamicCalculator } from "@/components/calculators/dynamic-calculator";
import { ShareCalculatorButton } from "@/components/ui/share-calculator-button";
import { getCategoryBySlug } from "@/lib/categories";
import {
  getCalculatorBySlug,
  getRelatedCalculatorsByCategory,
} from "@/lib/calculator-queries";
import { defaultValuesFromFields, evaluatePublicOutputs } from "@/lib/public-calculator-eval";
import { absoluteUrl } from "@/lib/absolute-url";
import { SITE_BRAND, SITE_DOMAIN } from "@/lib/site-brand";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const calculator = await getCalculatorBySlug(slug);
  if (!calculator) {
    return { title: "Calculator" };
  }
  const path = `/calculators/${slug}`;
  const description =
    calculator.description?.trim() ||
    `Free ${calculator.name} — ${SITE_BRAND} on ${SITE_DOMAIN}. Instant results in your browser.`;
  const ogTitle = `${calculator.name} | ${SITE_DOMAIN}`;
  return {
    title: calculator.name,
    description,
    alternates: { canonical: path },
    openGraph: {
      url: absoluteUrl(path),
      title: ogTitle,
      description,
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: ogTitle,
      description,
    },
  };
}

export default async function CalculatorPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const calculator = await getCalculatorBySlug(slug);
  if (!calculator) {
    notFound();
  }

  const category = await getCategoryBySlug(calculator.category);
  const relatedCalculators = await getRelatedCalculatorsByCategory(calculator.category, calculator.slug, 6);
  const initialValues = defaultValuesFromFields(calculator.fields);
  const initialResults = evaluatePublicOutputs(calculator.outputs, initialValues);

  return (
    <main className="mx-auto w-full max-w-5xl bg-white px-4 py-10 sm:px-6 lg:px-8">
      <div className="mb-5 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm">
        <Link href="/" className="font-semibold text-sky-700 hover:text-sky-800">
          Home
        </Link>
        <span className="text-slate-300">/</span>
        <Link
          href={`/categories/${calculator.category}`}
          className="font-semibold text-sky-700 hover:text-sky-800"
        >
          {category?.name ?? "Category"}
        </Link>
      </div>

      <header className="mb-6 flex flex-col gap-3 sm:mb-8">
        {calculator.imageUrl?.trim() ? (
          <div className="relative overflow-hidden rounded-2xl border border-slate-200">
            <div className="aspect-[2.2/1] max-h-56 w-full">
              <img
                src={calculator.imageUrl.trim()}
                alt={calculator.name}
                className="h-full w-full object-cover"
              />
            </div>
          </div>
        ) : null}

        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="min-w-0">
            <h1 className="section-title text-3xl font-bold text-slate-900 sm:text-4xl">{calculator.name}</h1>
            <p className="mt-2 text-sm leading-7 text-slate-600">{calculator.description}</p>
            <p className="mt-2 inline-block rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
              {calculator.formulaPlain}
            </p>
          </div>

          <div className="shrink-0">
            <ShareCalculatorButton />
          </div>
        </div>
      </header>

      <section className="mb-8">
        <DynamicCalculator calculator={calculator} initialResults={initialResults} />
      </section>

      {calculator.contentHtml?.trim() ? (
        <section className="calc-html calc-html--article">
          <div dangerouslySetInnerHTML={{ __html: calculator.contentHtml }} />
        </section>
      ) : null}

      {relatedCalculators.length > 0 ? (
        <section className="mt-8 md:mt-12 rounded-2xl border border-teal-100 bg-gradient-to-r from-emerald-50/70 via-cyan-50/60 to-blue-50/70 p-4 sm:p-5">
          <div className="mb-4 flex items-center justify-between gap-3">
            <h2 className="text-xl font-bold text-slate-900 sm:text-2xl">Related calculators</h2>
            <Link href={`/categories/${calculator.category}`} className="text-sm font-semibold text-teal-700 hover:text-teal-900">
              View all
            </Link>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {relatedCalculators.map((item) => (
              <CalculatorTileCard key={item.slug} calculator={item} />
            ))}
          </div>
        </section>
      ) : null}

      <p className="mt-8 border-t border-slate-100 pt-6 text-xs leading-relaxed text-slate-500">
        For educational use only. Results are estimates and do not replace professional medical advice,
        diagnosis, or treatment.
      </p>
    </main>
  );
}
