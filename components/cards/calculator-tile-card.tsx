import Link from "next/link";
import type { CalculatorListItem } from "@/lib/calculator-types";
import { getCategoryVisual } from "@/lib/category-visuals";

export type CalculatorTileCardProps = {
  calculator: CalculatorListItem;
};

export function CalculatorTileCard({ calculator }: CalculatorTileCardProps) {
  const visual = getCategoryVisual(calculator.category);

  return (
    <Link
      href={`/calculators/${calculator.slug}`}
      className="card-elevated group relative flex h-full flex-col overflow-hidden rounded-2xl border border-slate-200/90 bg-white transition-all duration-300 hover:-translate-y-1 hover:border-teal-200 hover:shadow-lg"
      style={{ borderLeftWidth: 4, borderLeftColor: visual.color }}
    >
      <div className="flex flex-1 flex-col p-5">
        <span
          className="mb-3 inline-flex w-fit items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide"
          style={{ background: visual.bg, color: visual.color }}
        >
          <span aria-hidden>{visual.icon}</span>
          {calculator.category.replace(/-/g, " ")}
        </span>
        <h3 className="line-clamp-2 text-base font-semibold leading-snug text-slate-900 transition-colors group-hover:text-teal-800">
          {calculator.name}
        </h3>
        <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-slate-600">{calculator.description}</p>
        <div className="mt-auto pt-4">
          <p className="rounded-xl border border-slate-100 bg-slate-50/80 px-3 py-2 text-xs font-medium text-slate-600">
            {calculator.formulaPlain}
          </p>
        </div>
      </div>
    </Link>
  );
}
