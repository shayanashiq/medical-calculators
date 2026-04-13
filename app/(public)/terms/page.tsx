import Link from "next/link";
import type { Metadata } from "next";
import { absoluteUrl } from "@/lib/absolute-url";
import { SITE_BRAND, SITE_DOMAIN } from "@/lib/site-brand";

const termsDescription = `Terms of use for ${SITE_BRAND} (${SITE_DOMAIN}) — educational tools, not medical advice.`;

export const metadata: Metadata = {
  title: "Terms of use",
  description: termsDescription,
  alternates: { canonical: "/terms" },
  openGraph: {
    url: absoluteUrl("/terms"),
    title: `Terms of use | ${SITE_DOMAIN}`,
    description: termsDescription,
  },
  robots: { index: true, follow: true },
};

export default function TermsPage() {
  return (
    <main className="mx-auto w-full max-w-3xl bg-white px-4 py-12 sm:px-6 lg:px-8">
      <div className="mb-6 text-sm">
        <Link href="/" className="font-semibold text-sky-700 hover:text-sky-800">
          Home
        </Link>
      </div>
      <article className="glass-panel rounded-3xl border border-slate-200 p-8 sm:p-10">
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">Terms of use</h1>
        <p className="mt-6 text-sm leading-7 text-slate-600">
          <strong className="text-slate-800">Not medical advice.</strong> This site provides educational
          calculators only. Results are estimates and may not apply to your situation. Always consult a qualified
          clinician for diagnosis, treatment, or medication decisions.
        </p>
        <p className="mt-4 text-sm leading-7 text-slate-600">
          <strong className="text-slate-800">No warranty.</strong> Tools are provided “as is” without guarantees
          of accuracy or fitness for a particular purpose. You use them at your own risk.
        </p>
        <p className="mt-4 text-sm leading-7 text-slate-600">
          <strong className="text-slate-800">Acceptable use.</strong> Do not attempt to disrupt the service,
          scrape it in a way that harms performance, or use it for unlawful purposes.
        </p>
        <p className="mt-6 text-xs text-slate-500">Last updated: April 2026</p>
      </article>
    </main>
  );
}
