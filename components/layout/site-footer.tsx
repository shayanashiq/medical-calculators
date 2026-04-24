import Link from "next/link";
import Image from "next/image";
import { getAllCategories } from "@/lib/categories";
import { SITE_DOMAIN, SITE_TITLE_DEFAULT } from "@/lib/site-brand";

const footerLinkClass =
  "inline-flex rounded-md text-slate-600 transition-colors hover:text-teal-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/30 focus-visible:ring-offset-2";

export async function SiteFooter() {
  const categories = await getAllCategories();

  return (
    <footer className="mt-14 border-t border-slate-200 bg-gradient-to-b from-white to-slate-50/80 text-slate-700">
      <div className="mx-auto w-full max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid gap-10 text-sm sm:grid-cols-2 lg:grid-cols-4">
          <div className="lg:pr-6">
            <div className="flex items-center gap-3">
              <Image
                src="/logo.png"
                alt={`${SITE_TITLE_DEFAULT} — ${SITE_DOMAIN}`}
                width={160}
                height={45}
                sizes="160px"
                className="h-10 w-auto"
              />
              <div className="min-w-0">
                <p className="text-md font-bold tracking-tight text-slate-900">{SITE_TITLE_DEFAULT}</p>
                <p className="mt-0.5 text-xs font-semibold text-slate-500">{SITE_DOMAIN}</p>
              </div>
            </div>

            <p className="mt-4 leading-6 text-slate-600">
              Free calculators for medication dosing, nutrition, labs, and fitness — instant results in your browser.
            </p>

            <div className="mt-5 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs font-semibold text-slate-500">
              <span className="inline-flex items-center gap-1.5">
                <span className="inline-block h-1.5 w-1.5 rounded-full bg-teal-500" />
                100% Private
              </span>
              <span className="inline-flex items-center gap-1.5">
                <span className="inline-block h-1.5 w-1.5 rounded-full bg-cyan-500" />
                Free tools
              </span>
            </div>
          </div>

          <div>
            <p className="text-sm font-bold tracking-tight text-slate-900">Popular calculators</p>
            <ul className="mt-4 space-y-2.5">
              <li>
                <Link href="/calculators/bmi" className={footerLinkClass}>
                  BMI Calculator
                </Link>
              </li>
              <li>
                <Link href="/calculators/tdee" className={footerLinkClass}>
                  TDEE Calculator
                </Link>
              </li>
              <li>
                <Link href="/calculators/target-heart-rate" className={footerLinkClass}>
                  Heart Rate Zones
                </Link>
              </li>
              <li>
                <Link href="/calculators/anion-gap" className={footerLinkClass}>
                  Anion Gap
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <p className="text-sm font-bold tracking-tight text-slate-900">Health categories</p>
            <ul className="mt-4 space-y-2.5">
              {categories.map((c) => (
                <li key={c.slug}>
                  <Link href={`/categories/${c.slug}`} className={footerLinkClass}>
                    {c.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <p className="text-sm font-bold tracking-tight text-slate-900">Resources</p>
            <ul className="mt-4 space-y-2.5">
              <li>
                <Link href="/about" className={footerLinkClass}>
                  About
                </Link>
                <Link href="/blog" className={footerLinkClass}>
                  Blog
                </Link>
              </li>
              <li>
                <Link href="/calculators" className={footerLinkClass}>
                  All calculators
                </Link>
              </li>
              <li>
                <Link href="/privacy" className={footerLinkClass}>
                  Privacy policy
                </Link>
              </li>
              <li>
                <Link href="/terms" className={footerLinkClass}>
                  Terms of use
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-10 border-t border-slate-200/70 pt-6">
          <div className="text-center text-xs text-slate-500">
            <p className="leading-relaxed">
              © {new Date().getFullYear()} {SITE_TITLE_DEFAULT}. All rights reserved. For informational purposes only —
              not a substitute for professional medical advice.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
