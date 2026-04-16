import Link from "next/link";
import { CalculatorTileCard } from "@/components/cards/calculator-tile-card";
import type { CalculatorListItem } from "@/lib/calculator-types";

type Props = {
  calculators: CalculatorListItem[];
  totalCount: number;
};

export function PopularCalculatorsSection({ calculators, totalCount }: Props) {
  return (
    <section className="border-t border-slate-100 bg-white">
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <h2 className="text-center text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
          Popular calculators
        </h2>
        <p className="mx-auto mt-3 max-w-2xl text-center text-base text-slate-500">
          {totalCount === 0
            ? "Browse the catalog once calculators are added."
            : `A quick look at ${calculators.length} of ${totalCount} tools. Open any card for instant results.`}
        </p>
        <div className="mt-3 flex justify-center">
          <Link
            href="/calculators"
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-teal-700 transition-colors hover:text-teal-900"
          >
            Browse all calculators
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          </Link>
        </div>

        {calculators.length === 0 ? (
          <p className="mx-auto mt-12 max-w-md text-center text-sm text-slate-500">
            No calculators in the database yet.{" "}
            <Link href="/admin/calculators" className="font-semibold text-sky-700 hover:text-sky-900">
              Add some in admin
            </Link>
            .
          </p>
        ) : (
          <div className="mt-10 grid justify-items-center gap-5 sm:grid-cols-2 sm:justify-items-stretch lg:grid-cols-3 xl:grid-cols-4">
            {calculators.map((item, idx) => (
              <div key={item.slug} className="w-full max-w-[22rem] sm:max-w-none">
                <CalculatorTileCard calculator={item} />
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
