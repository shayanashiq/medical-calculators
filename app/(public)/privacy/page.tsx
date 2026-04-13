import Link from "next/link";
import type { Metadata } from "next";
import { absoluteUrl } from "@/lib/absolute-url";
import { SITE_BRAND, SITE_DOMAIN } from "@/lib/site-brand";

const privacyDescription = `Privacy policy for ${SITE_BRAND} on ${SITE_DOMAIN} — privacy-first, client-side medical calculators.`;

export const metadata: Metadata = {
  title: "Privacy policy",
  description: privacyDescription,
  alternates: { canonical: "/privacy" },
  openGraph: {
    url: absoluteUrl("/privacy"),
    title: `Privacy policy | ${SITE_DOMAIN}`,
    description: privacyDescription,
  },
  robots: { index: true, follow: true },
};

export default function PrivacyPage() {
  return (
    <main className="mx-auto w-full max-w-3xl bg-white px-4 py-12 sm:px-6 lg:px-8">
      <div className="mb-6 text-sm">
        <Link href="/" className="font-semibold text-sky-700 hover:text-sky-800">
          Home
        </Link>
      </div>
      <article className="glass-panel rounded-3xl border border-slate-200 p-8 sm:p-10">
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">Privacy policy</h1>
        <p className="mt-6 text-sm leading-7 text-slate-600">
          <strong className="text-slate-800">Local processing.</strong> Calculators on this site run in your
          browser. Values you enter are not sent to our servers for calculation because the math is performed on
          your device.
        </p>
        <p className="mt-4 text-sm leading-7 text-slate-600">
          <strong className="text-slate-800">No accounts.</strong> We do not require sign-up. Do not submit
          personally identifiable information into fields unless you are comfortable storing that data in your own
          browser session.
        </p>
        <p className="mt-4 text-sm leading-7 text-slate-600">
          <strong className="text-slate-800">Hosting and analytics.</strong> Like most websites, our hosting
          provider may process standard technical data (for example, IP address in server logs) according to their
          own policies. We aim to keep third-party tracking minimal.
        </p>
        <p className="mt-4 text-sm leading-7 text-slate-600">
          <strong className="text-slate-800">Contact.</strong> For privacy questions, reach out through the contact
          channel you use for this project (email or form), if applicable.
        </p>
        <p className="mt-6 text-xs text-slate-500">Last updated: April 2026</p>
      </article>
    </main>
  );
}
