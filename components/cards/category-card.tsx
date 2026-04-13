import Link from "next/link";
import type { CalculatorCategory } from "@/lib/categories";
import { getCategoryVisual } from "@/lib/category-visuals";

export function CategoryCard({
  category,
  calculatorCount,
}: {
  category: CalculatorCategory;
  calculatorCount: number;
}) {
  const visual = getCategoryVisual(category.slug);
  const count = calculatorCount;

  return (
    <Link
      href={`/categories/${category.slug}`}
      className="card-elevated group relative flex h-full min-h-[200px] flex-col overflow-hidden rounded-2xl border border-slate-200/90 bg-white p-5 transition-all duration-300 hover:-translate-y-0.5 hover:border-sky-200 hover:shadow-lg"
    >
      <div
        className="pointer-events-none absolute -right-8 -top-8 h-36 w-36 rounded-full opacity-50"
        style={{ background: visual.bg }}
      />
      <div
        className="pointer-events-none absolute -bottom-10 -left-10 h-28 w-28 rounded-full opacity-30"
        style={{ background: visual.bg }}
      />

      <div className="relative flex flex-1 flex-col">
        <div className="flex items-start gap-3">
          <span
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-lg shadow-sm ring-1 ring-black/[0.04] sm:h-12 sm:w-12 sm:text-xl"
            style={{ background: visual.bg }}
          >
            {visual.icon}
          </span>
          <div className="min-w-0 flex-1 pt-0.5">
            <h3 className="text-base font-bold tracking-tight text-slate-900 transition-colors group-hover:text-sky-800 sm:text-lg">
              {category.name}
            </h3>
            <p className="mt-1.5 line-clamp-3 text-sm leading-relaxed text-slate-600">{category.description}</p>
          </div>
        </div>

        <div className="relative mt-auto flex flex-wrap items-center justify-between gap-2 border-t border-slate-100 pt-4">
          <span
            className="inline-flex items-center rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wider"
            style={{ background: visual.bg, color: visual.color }}
          >
            {count} {count === 1 ? "calculator" : "calculators"}
          </span>
          <span
            className="inline-flex items-center gap-1.5 text-sm font-semibold transition-all group-hover:gap-2.5"
            style={{ color: visual.color }}
          >
            View tools
            <svg
              className="h-4 w-4 shrink-0 transition-transform group-hover:translate-x-0.5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2.2}
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden
            >
              <path d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          </span>
        </div>
      </div>
    </Link>
  );
}
