import Link from "next/link";
import type { CalculatorListItem } from "@/lib/calculator-types";

export type CalculatorTileCardProps = {
  calculator: CalculatorListItem;
};

export function CalculatorTileCard({ calculator }: CalculatorTileCardProps) {
  return (
    <Link
      href={`/calculators/${calculator.slug}`}
      className="card-elevated group flex h-full flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white transition-all duration-300 hover:-translate-y-1 hover:border-slate-300"
    >
      <div className="flex flex-1 flex-col p-4">
        <h3 className="line-clamp-2 text-sm font-semibold leading-snug text-slate-900 transition-colors group-hover:text-teal-700">
          {calculator.name}
        </h3>
        <p className="mt-1 line-clamp-2 text-xs text-slate-600">{calculator.description}</p>
        <div className="mt-auto pt-3">
          <p className="rounded-lg bg-slate-50 px-2.5 py-2 text-xs font-medium text-slate-500">
            {calculator.formulaPlain}
          </p>
        </div>
      </div>
    </Link>
  );
}
