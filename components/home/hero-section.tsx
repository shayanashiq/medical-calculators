import Link from "next/link";
import type { ReactNode } from "react";
import { HeroSearchBar } from "@/components/home/hero-search-bar";
import { SITE_TITLE_DEFAULT } from "@/lib/site-brand";

const trustBadges: { label: string; path: ReactNode }[] = [
  {
    label: "100% Private",
    path: <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />,
  },
  {
    label: "Evidence-Based",
    path: (
      <>
        <path d="M12 2a10 10 0 1 0 0 20A10 10 0 0 0 12 2z" />
        <path d="M12 8v4l3 3" />
      </>
    ),
  },
  {
    label: "Trusted Daily",
    path: (
      <>
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
        <path d="M16 3.13a4 4 0 0 1 0 7.75" />
      </>
    ),
  },
  {
    label: "Instant Results",
    path: <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />,
  },
];

export function HeroSection() {
  return (
    <section
      className="relative flex min-h-screen items-center justify-center overflow-hidden px-4 py-20 sm:px-6"
      style={{
        background: "linear-gradient(135deg, #0d9488 0%, #0891b2 50%, #0284c7 100%)",
      }}
    >
      <div
        className="pointer-events-none absolute -top-24 -right-24 h-96 w-96 rounded-full animate-[floatUp_8s_ease-in-out_infinite]"
        style={{ background: "rgba(255,255,255,0.07)" }}
      />
      <div
        className="pointer-events-none absolute -bottom-20 -left-16 h-72 w-72 rounded-full animate-[floatUp_10s_ease-in-out_infinite_reverse]"
        style={{ background: "rgba(255,255,255,0.05)" }}
      />

      <div className="relative z-10 text-center w-full">
        <h1 className="mb-4 animate-[fadeUp_0.6s_ease_both] text-balance text-4xl font-extrabold leading-tight tracking-tight text-white sm:text-5xl md:text-6xl">
          {SITE_TITLE_DEFAULT}
        </h1>

        <p className="text-lg sm:text-xl text-white/90 mb-8 leading-relaxed animate-[fadeUp_0.6s_0.1s_ease_both]">
          Free dosage, calorie, weight &amp; lab calculators — instant results, no signup
        </p>

        <p className="text-base font-semibold text-white mb-4 animate-[fadeUp_0.6s_0.18s_ease_both]">
          Find your calculator — dosage, nutrition, labs, fitness &amp; more
        </p>

        <div className="animate-[fadeUp_0.6s_0.26s_ease_both]">
          <HeroSearchBar />
        </div>

        <div className="animate-[fadeUp_0.6s_0.34s_ease_both] mb-7 mt-7">
          <Link
            href="/blog"
            className="inline-flex items-center gap-2.5 rounded-full border border-white/35 px-6 py-3 text-sm font-medium text-white backdrop-blur-sm transition hover:bg-white/25 hover:scale-105 active:scale-95"
            style={{ background: "rgba(255,255,255,0.15)" }}
          >
            <svg
              className="h-4 w-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={1.8}
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
              <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
            </svg>
            Blog
            <span className="rounded-full bg-teal-500 px-2.5 py-0.5 text-xs font-bold text-white">
              New
            </span>
          </Link>
        </div>

        <div className="animate-[fadeUp_0.6s_0.42s_ease_both] flex flex-wrap items-center justify-center gap-6">
          {trustBadges.map(({ label, path }) => (
            <span key={label} className="flex items-center gap-2 text-sm font-medium text-white/95">
              <svg
                className="h-4 w-4 opacity-90"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                {path}
              </svg>
              {label}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
