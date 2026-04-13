import Link from "next/link";
import Image from "next/image";
import { SITE_BRAND, SITE_DOMAIN } from "@/lib/site-brand";

const navLinkClass =
  "rounded-lg px-3 py-2 text-sm font-semibold text-slate-600 transition-colors hover:bg-emerald-50/90 hover:text-emerald-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/30 focus-visible:ring-offset-2";

export function SiteHeader() {
  return (
    <header className="top-0 z-40 border-b border-slate-200/90 bg-white/85 shadow-[0_1px_0_rgba(15,23,42,0.04)] backdrop-blur-md supports-[backdrop-filter]:bg-white/70">
      <div className="mx-auto flex min-h-[4.25rem] max-w-7xl items-center justify-between gap-4 px-4 sm:min-h-[4.75rem] sm:px-6 lg:min-h-[5.25rem] lg:px-8">
        <Link
          href="/"
          className="group flex shrink-0 items-center gap-2 py-1.5 outline-none ring-emerald-500/30 focus-visible:rounded-lg focus-visible:ring-2 focus-visible:ring-offset-2 sm:gap-3 sm:py-2"
        >
          <Image
            src="/logo.png"
            alt={`${SITE_BRAND} — ${SITE_DOMAIN}`}
            width={320}
            height={90}
            sizes="(max-width: 640px) 240px, (max-width: 1024px) 280px, 320px"
            className="h-12 w-auto max-w-[15rem] shrink-0 object-left sm:h-14 sm:max-w-[18rem] lg:h-16 lg:max-w-[20rem]"
          />
          <span className="min-w-0 bg-gradient-to-br from-teal-600 via-cyan-600 to-sky-600 bg-clip-text text-lg font-bold leading-tight tracking-tight text-transparent sm:text-xl lg:text-2xl">
            Medical Calculators
          </span>
        </Link>

        <nav className="flex shrink-0 items-center gap-0.5 sm:gap-1" aria-label="Main navigation">
          <Link href="/" className={navLinkClass}>
            Home
          </Link>
          <Link href="/categories" className={navLinkClass}>
            Categories
          </Link>
          <Link href="/calculators" className={navLinkClass}>
            <span className="hidden sm:inline">All calculators</span>
            <span className="sm:hidden">All</span>
          </Link>
        </nav>
      </div>
    </header>
  );
}
