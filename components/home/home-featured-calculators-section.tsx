import Link from "next/link";
import { CalculatorTileCard } from "@/components/cards/calculator-tile-card";
import type { CalculatorListItem } from "@/lib/calculator-types";
import { calculatorCardGradients } from "@/lib/home-gradients";

type Props = {
  calculators: CalculatorListItem[];
};

export function HomeFeaturedCalculatorsSection({ calculators: items }: Props) {
  return (
    <section className="border-t border-slate-100 bg-gradient-to-b from-slate-50/80 to-white">
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <h2 className="text-center text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
          Featured calculators
        </h2>
        <p className="mx-auto mt-3 max-w-2xl text-center text-base text-slate-500">
          Hand-picked tools on the home page. Admins can toggle &ldquo;Show on home&rdquo; for any calculator.
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

        {items.length === 0 ? (
          <p className="mx-auto mt-12 max-w-md text-center text-sm text-slate-500">
            No calculators are marked for the home page yet.{" "}
            <Link href="/calculators" className="font-semibold text-sky-700 hover:text-sky-900">
              View the full catalog
            </Link>
            .
          </p>
        ) : (
          <div className="mt-10 grid justify-items-center gap-5 sm:grid-cols-2 sm:justify-items-stretch lg:grid-cols-3 xl:grid-cols-4">
            {items.map((item, idx) => (
              <div key={item.slug} className="w-full max-w-[22rem] sm:max-w-none">
                <CalculatorTileCard
                  calculator={item}
                  gradientClass={calculatorCardGradients[idx % calculatorCardGradients.length]}
                />
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
