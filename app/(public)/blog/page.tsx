import Link from "next/link";
import type { Metadata } from "next";
import { absoluteUrl } from "@/lib/absolute-url";
import { SITE_BRAND, SITE_DOMAIN } from "@/lib/site-brand";

const blogDescription = `Guides from ${SITE_BRAND} (${SITE_DOMAIN}) on using medical calculators responsibly and understanding common health metrics.`;

export const metadata: Metadata = {
  title: "Blog",
  description: blogDescription,
  alternates: { canonical: "/blog" },
  openGraph: {
    url: absoluteUrl("/blog"),
    title: `Blog | ${SITE_DOMAIN}`,
    description: blogDescription,
  },
};

export default function BlogPage() {
  return (
    <main className="mx-auto w-full max-w-3xl bg-white px-4 py-12 sm:px-6 lg:px-8">
      <div className="mb-6 text-sm">
        <Link href="/" className="font-semibold text-sky-700 hover:text-sky-800">
          Home
        </Link>
      </div>
      <article className="glass-panel rounded-3xl border border-slate-200 p-8 sm:p-10">
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">Blog</h1>
        <p className="mt-4 text-sm leading-7 text-slate-600">
          We are preparing practical guides on BMI, energy needs, hydration, and how to interpret common lab-based
          calculators. Check back soon, or use the calculators from the home page today.
        </p>
        <p className="mt-6">
          <Link
            href="/calculators"
            className="text-sm font-semibold text-sky-700 hover:text-sky-800"
          >
            Browse all calculators →
          </Link>
        </p>
      </article>
    </main>
  );
}
