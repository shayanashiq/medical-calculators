import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { CalculatorTileCard } from "@/components/cards/calculator-tile-card";
import { CategoryCalculatorsSearch } from "@/components/categories/category-calculators-search";
import { PaginationBar } from "@/components/ui/pagination-bar";
import { getCategoryVisual } from "@/lib/category-visuals";
import { getCategoryBySlug } from "@/lib/categories";
import { getCalculatorsByCategoryPaginated } from "@/lib/calculator-queries";
import { parsePageParam } from "@/lib/list-pagination";
import { prisma } from "@/lib/prisma";
import { absoluteUrl } from "@/lib/absolute-url";
import { SITE_BRAND, SITE_DOMAIN } from "@/lib/site-brand";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ category: string }>;
}): Promise<Metadata> {
  const { category: categorySlug } = await params;
  const category = await getCategoryBySlug(categorySlug);
  if (!category) {
    return { title: "Category" };
  }
  const path = `/categories/${categorySlug}`;
  const description =
    category.description?.trim() ||
    `${category.name} — ${SITE_BRAND} on ${SITE_DOMAIN}. Browse calculators by category.`;
  const ogTitle = `${category.name} | ${SITE_DOMAIN}`;
  const keywords = [
    category.name,
    `${category.name} calculators`,
    `${category.name} medical calculators`,
    SITE_BRAND,
  ];
  return {
    title: category.name,
    description,
    keywords,
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

export default async function CategoryPage({
  params,
  searchParams,
}: {
  params: Promise<{ category: string }>;
  searchParams: Promise<{ page?: string; q?: string }>;
}) {
  const { category: categorySlug } = await params;
  const category = await getCategoryBySlug(categorySlug);
  if (!category) {
    notFound();
  }

  const sp = await searchParams;
  const pageParam = parsePageParam(sp.page);
  const searchQuery = typeof sp.q === "string" ? sp.q : undefined;
  const searchTrimmed = searchQuery?.trim() ?? "";

  const [categoryCalculatorCount, { items, total, page, pageSize, totalPages }] = await Promise.all([
    prisma.calculator.count({ where: { category: category.slug } }),
    getCalculatorsByCategoryPaginated(category.slug, pageParam, searchTrimmed || undefined),
  ]);
  const from = total === 0 ? 0 : (page - 1) * pageSize + 1;
  const to = Math.min(page * pageSize, total);
  const basePath = `/categories/${category.slug}`;
  const paginationQuery =
    searchTrimmed.length > 0 ? { q: searchTrimmed } : undefined;
  const visual = getCategoryVisual(category.slug);

  return (
    <main className="min-h-screen w-full bg-gradient-to-b from-slate-50 via-white to-slate-50/80">
      <div className="relative overflow-hidden border-b border-slate-200/80">
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.55]"
          style={{
            background: `radial-gradient(900px 420px at 15% 0%, ${visual.bg} 0%, transparent 55%),
              radial-gradient(700px 380px at 85% 20%, ${visual.color}18 0%, transparent 50%)`,
          }}
        />
        <div className="pointer-events-none absolute -right-20 top-10 h-56 w-56 rounded-full bg-white/40 blur-3xl" />
        <div className="pointer-events-none absolute -left-16 bottom-0 h-44 w-44 rounded-full bg-white/30 blur-2xl" />

        <div className="relative mx-auto w-full max-w-7xl px-4 pb-12 pt-10 sm:px-6 lg:px-8">
          <div className="mb-6 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm">
            <Link href="/" className="font-semibold text-sky-700 hover:text-sky-800">
              Home
            </Link>
            <span className="text-slate-300">/</span>
            <Link href="/categories" className="font-semibold text-sky-700 hover:text-sky-800">
              Categories
            </Link>
            <span className="text-slate-300">/</span>
            <span className="font-medium text-slate-500">{category.name}</span>
          </div>

          <div className="glass-panel relative overflow-hidden rounded-3xl border border-slate-200/90 shadow-lg">
            <div
              className="absolute inset-x-0 top-0 h-1.5"
              style={{
                background: `linear-gradient(90deg, ${visual.color}, ${visual.bg})`,
              }}
            />
            <div className="relative grid gap-8 p-8 sm:grid-cols-[1fr_auto] sm:items-start sm:p-10">
              <div className="min-w-0">
                <p className="mb-3 inline-flex items-center gap-2 rounded-full border border-slate-200/80 bg-white/80 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-slate-600 backdrop-blur-sm">
                  <span className="text-base leading-none" aria-hidden>
                    {visual.icon}
                  </span>
                  Category
                </p>
                <h1 className="section-title text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
                  {category.name}
                </h1>
                <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-600 sm:text-base">
                  {category.description}
                </p>
                <div className="mt-6 flex flex-wrap gap-3">
                  <span className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-800 shadow-sm">
                    <span className="text-sky-600">{categoryCalculatorCount}</span>
                    <span className="font-medium text-slate-500">calculator{categoryCalculatorCount === 1 ? "" : "s"}</span>
                  </span>
                  {categoryCalculatorCount > 0 && total > 0 ? (
                    <span className="inline-flex items-center rounded-xl border border-slate-200 bg-slate-50 px-4 py-2 text-sm text-slate-600">
                      Showing <span className="mx-1 font-semibold text-slate-800">{from}</span>–
                      <span className="ml-1 font-semibold text-slate-800">{to}</span>
                      {searchTrimmed ? (
                        <>
                          {" "}
                          <span className="text-slate-400">·</span> filtered
                        </>
                      ) : null}
                    </span>
                  ) : null}
                </div>

                {categoryCalculatorCount > 0 ? (
                  <div className="mt-8 w-full border-t border-slate-200/70 pt-8">
                    <p className="mb-3 text-sm font-medium text-slate-600">Search this category</p>
                    <CategoryCalculatorsSearch
                      categorySlug={category.slug}
                      categoryName={category.name}
                      initialQuery={searchTrimmed}
                    />
                  </div>
                ) : null}
              </div>
              <div
                className="flex h-28 w-full shrink-0 items-center justify-center rounded-2xl border border-white/60 text-6xl shadow-inner sm:h-36 sm:w-36"
                style={{ background: visual.bg }}
                aria-hidden
              >
                {visual.icon}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto w-full max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        {categoryCalculatorCount === 0 ? (
          <p className="text-center text-sm text-slate-500">No calculators in this category yet.</p>
        ) : (
          <>
            <div className="mb-8">
              <h2 className="text-lg font-bold text-slate-900">Tools in this category</h2>
              <p className="mt-1 text-sm text-slate-500">Open any calculator — results are instant and private.</p>
            </div>

            {total === 0 ? (
              <p className="text-sm text-slate-600">
                No calculators match &ldquo;{searchTrimmed}&rdquo;. Try another keyword or{" "}
                <Link href={basePath} className="font-semibold text-sky-700 hover:text-sky-900">
                  clear search
                </Link>
                .
              </p>
            ) : (
              <section className="grid gap-5 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                {items.map((item, idx) => (
                  <CalculatorTileCard
                    key={item.slug}
                    calculator={item}
                  />
                ))}
              </section>
            )}

            <PaginationBar
              page={page}
              totalPages={totalPages}
              basePath={basePath}
              query={paginationQuery}
            />
          </>
        )}
      </div>
    </main>
  );
}
