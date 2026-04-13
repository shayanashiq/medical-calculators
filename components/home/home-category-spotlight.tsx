"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { BrowseCategoryCard } from "@/components/home/browse-category-card";
import { getCategoryVisual } from "@/lib/category-visuals";
import type { CalculatorCategory } from "@/lib/categories";
import type { CalculatorListItem } from "@/lib/calculator-types";

const PER_SLIDE = 3;

function chunkCategories<T>(items: T[], size: number): T[][] {
  const out: T[][] = [];
  for (let i = 0; i < items.length; i += size) {
    out.push(items.slice(i, i + size));
  }
  return out;
}

type Props = {
  categories: CalculatorCategory[];
  calculators: CalculatorListItem[];
};

export function HomeCategorySpotlight({ categories, calculators }: Props) {
  const [active, setActive] = useState(0);

  const slides = useMemo(() => chunkCategories(categories, PER_SLIDE), [categories]);
  const slideCount = slides.length;

  const bySlug = useMemo(() => {
    const m = new Map<string, CalculatorListItem[]>();
    for (const c of calculators) {
      const list = m.get(c.category) ?? [];
      list.push(c);
      m.set(c.category, list);
    }
    return m;
  }, [calculators]);

  useEffect(() => {
    setActive((a) => Math.min(a, Math.max(0, slideCount - 1)));
  }, [slideCount]);

  const goPrev = useCallback(() => {
    setActive((a) => (a - 1 + slideCount) % slideCount);
  }, [slideCount]);

  const goNext = useCallback(() => {
    setActive((a) => (a + 1) % slideCount);
  }, [slideCount]);

  if (categories.length === 0) {
    return null;
  }

  const chunk = slides[active] ?? [];
  const arrowBtn =
    "flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-slate-200 bg-white text-lg font-semibold text-slate-700 shadow-sm transition hover:border-sky-300 hover:bg-sky-50 hover:text-sky-900 sm:h-11 sm:w-11 sm:text-xl";

  return (
    <section className="relative pt-12 pb-14 sm:pt-16 sm:pb-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <h2 className="text-center text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
          Browse by category
        </h2>
        <p className="mx-auto mt-3 max-w-2xl text-center text-base text-slate-500">
          Three categories per view. Use the side arrows to switch groups.
        </p>

        <div className="mt-10">
          <div className="flex items-center gap-2 sm:gap-4">
            {slideCount > 1 ? (
              <button type="button" onClick={goPrev} className={arrowBtn} aria-label="Previous categories">
                ‹
              </button>
            ) : null}

            <div className="min-w-0 flex-1">
              <div className="grid grid-cols-3 gap-3 sm:gap-6">
                {chunk.map((category) => (
                  <div key={category.slug} className="min-w-0">
                    <BrowseCategoryCard
                      category={category}
                      calculatorsInCategory={bySlug.get(category.slug) ?? []}
                      visual={getCategoryVisual(category.slug)}
                    />
                  </div>
                ))}
                {chunk.length < PER_SLIDE
                  ? Array.from({ length: PER_SLIDE - chunk.length }, (_, k) => (
                      <div key={`pad-${active}-${k}`} className="min-w-0" aria-hidden />
                    ))
                  : null}
              </div>
            </div>

            {slideCount > 1 ? (
              <button type="button" onClick={goNext} className={arrowBtn} aria-label="Next categories">
                ›
              </button>
            ) : null}
          </div>

        </div>
      </div>
    </section>
  );
}
