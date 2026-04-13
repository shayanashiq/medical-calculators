import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { DynamicCalculator } from "@/components/calculators/dynamic-calculator";
import { getCategoryBySlug } from "@/lib/categories";
import { getCalculatorBySlug } from "@/lib/calculator-queries";
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

  return (
    <main className="mx-auto w-full max-w-3xl bg-white px-4 py-10 sm:px-6 lg:px-8">
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

      <article className="glass-panel rounded-3xl border border-slate-200 p-6 sm:p-8">
        {calculator.imageUrl?.trim() ? (
          <div className="relative -mx-2 -mt-2 mb-6 aspect-[2.2/1] max-h-52 overflow-hidden rounded-2xl sm:mx-0 sm:mt-0">
            <img
              src={calculator.imageUrl.trim()}
              alt={calculator.name}
              className="h-full w-full object-cover"
            />
          </div>
        ) : null}
        <h1 className="section-title text-3xl font-bold text-slate-900">{calculator.name}</h1>
        <p className="mt-2 text-sm leading-7 text-slate-600">{calculator.description}</p>
        <p className="mt-2 inline-block rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
          {calculator.formulaPlain}
        </p>
        <div className="mt-6">
          <DynamicCalculator calculator={calculator} />
        </div>
        <p className="mt-8 border-t border-slate-100 pt-6 text-xs leading-relaxed text-slate-500">
          For educational use only. Results are estimates and do not replace professional medical advice,
          diagnosis, or treatment.
        </p>
      </article>
    </main>
  );
}
