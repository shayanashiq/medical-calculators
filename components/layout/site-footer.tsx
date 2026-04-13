import Link from "next/link";
import { getAllCategories } from "@/lib/categories";
import { SITE_DOMAIN, SITE_TITLE_DEFAULT } from "@/lib/site-brand";

export async function SiteFooter() {
  const categories = await getAllCategories();

  return (
    <footer className="mt-14 border-t border-slate-200 bg-white">
      <div className="mx-auto w-full max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="grid gap-8 text-sm text-slate-600 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <p className="text-base font-bold text-slate-900">{SITE_TITLE_DEFAULT}</p>
            <p className="mt-1 text-xs font-medium text-slate-500">{SITE_DOMAIN}</p>
            <p className="mt-3 leading-6">
              Free tools for body metrics, fitness, and clinical calculations — instant,
              browser-based results on {SITE_DOMAIN}.
            </p>
          </div>
          <div>
            <p className="font-semibold text-slate-900">Popular Calculators</p>
            <ul className="mt-3 space-y-2">
              <li><Link href="/calculators/bmi">BMI Calculator</Link></li>
              <li><Link href="/calculators/tdee">TDEE Calculator</Link></li>
              <li><Link href="/calculators/target-heart-rate">Heart Rate Zones</Link></li>
              <li><Link href="/calculators/anion-gap">Anion Gap</Link></li>
            </ul>
          </div>
          <div>
            <p className="font-semibold text-slate-900">Categories</p>
            <ul className="mt-3 space-y-2">
              {categories.map((c) => (
                <li key={c.slug}>
                  <Link href={`/categories/${c.slug}`}>{c.name}</Link>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <p className="font-semibold text-slate-900">Resources</p>
            <ul className="mt-3 space-y-2">
              <li><Link href="/">Home</Link></li>
              <li><Link href="/calculators">All calculators</Link></li>
              <li><Link href="/privacy">Privacy policy</Link></li>
              <li><Link href="/terms">Terms of use</Link></li>
            </ul>
          </div>
        </div>

        <div className="mt-8 border-t border-slate-200 pt-4 text-xs text-slate-500">
          <p>For informational purposes only - not a substitute for professional medical advice.</p>
        </div>
      </div>
    </footer>
  );
}
