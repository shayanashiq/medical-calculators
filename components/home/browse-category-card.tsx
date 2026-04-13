import Link from "next/link";
import type { CalculatorCategory } from "@/lib/categories";
import type { CalculatorListItem } from "@/lib/calculator-types";
import type { CategoryVisual } from "@/lib/category-visuals";

type BrowseCategoryCardProps = {
  category: CalculatorCategory;
  calculatorsInCategory: CalculatorListItem[];
  visual: CategoryVisual;
};

export function BrowseCategoryCard({
  category,
  calculatorsInCategory: catCalcs,
  visual,
}: BrowseCategoryCardProps) {
  const count = catCalcs.length;

  return (
    <div className="card-elevated relative flex flex-col overflow-hidden rounded-3xl border border-slate-200 bg-white p-6 transition-all duration-300 hover:-translate-y-1">
      <div
        className="pointer-events-none absolute right-0 top-0 h-28 w-28 opacity-30"
        style={{ background: visual.bg, borderRadius: "0 1.5rem 0 80%" }}
      />

      <div className="relative flex items-center gap-4 mb-4">
        <span
          className="inline-flex h-14 w-14 shrink-0 items-center justify-center rounded-full text-2xl"
          style={{ background: visual.bg }}
        >
          {visual.icon}
        </span>
        <div>
          <h3 className="text-lg font-bold text-slate-900 leading-tight">{category.name}</h3>
          <p className="text-sm text-slate-400">{count} calculators</p>
        </div>
      </div>

      <p className="relative text-sm leading-6 text-slate-600 mb-4">{category.description}</p>

      <ul className="relative mb-5 space-y-1.5">
        {catCalcs.slice(0, 3).map((calc) => (
          <li key={calc.slug} className="flex items-start gap-2 text-sm text-slate-600">
            <span
              className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full"
              style={{ background: visual.color }}
            />
            <span className="truncate">
              {calc.name} — {calc.formulaPlain}
            </span>
          </li>
        ))}
      </ul>

      <Link
        href={`/categories/${category.slug}`}
        className="relative mt-auto inline-flex items-center gap-1.5 text-sm font-semibold transition-opacity hover:opacity-75"
        style={{ color: visual.color }}
      >
        View all {count} calculators
        <svg
          className="h-4 w-4"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M5 12h14M12 5l7 7-7 7" />
        </svg>
      </Link>
    </div>
  );
}
