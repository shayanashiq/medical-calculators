import Link from "next/link";
import type { CalculatorListItem } from "@/lib/calculator-types";
import { categoryEmojiForCalculator } from "@/lib/category-visuals";

export type CalculatorTileCardProps = {
  calculator: CalculatorListItem;
  gradientClass: string;
};

export function CalculatorTileCard({ calculator, gradientClass }: CalculatorTileCardProps) {
  const emoji = categoryEmojiForCalculator(calculator.category);
  const imageUrl = calculator.imageUrl?.trim();

  return (
    <Link
      href={`/calculators/${calculator.slug}`}
      className="card-elevated group flex flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white transition-all duration-300 hover:-translate-y-1"
    >
      <div
        className={`relative h-40 w-full shrink-0 overflow-hidden ${
          imageUrl ? "bg-slate-200" : `bg-gradient-to-br ${gradientClass}`
        }`}
      >
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={calculator.name}
            className="absolute inset-0 h-full w-full object-cover transition duration-300 group-hover:scale-[1.03]"
            loading="lazy"
          />
        ) : (
          <span className="flex h-full w-full items-center justify-center text-4xl opacity-60">{emoji}</span>
        )}
      </div>
      <div className="flex flex-1 flex-col p-4">
        <h3 className="text-sm font-semibold leading-snug text-slate-800 transition-colors group-hover:text-teal-700 line-clamp-2">
          {calculator.name}
        </h3>
        <p className="mt-1 text-xs text-slate-400 line-clamp-2">{calculator.description}</p>
        <p className="mt-auto pt-3 text-xs font-medium text-slate-400">{calculator.formulaPlain}</p>
      </div>
    </Link>
  );
}
