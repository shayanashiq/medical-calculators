"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useId, useState } from "react";
import { SITE_BRAND, SITE_DOMAIN } from "@/lib/site-brand";

const navLinkClass =
  "rounded-lg px-3 py-2 text-sm font-semibold text-slate-600 transition-colors hover:bg-emerald-50/90 hover:text-emerald-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/30 focus-visible:ring-offset-2";

const mobileNavLinkClass =
  "block rounded-xl px-3 py-3 text-sm font-semibold text-slate-700 transition-colors hover:bg-teal-50 hover:text-teal-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/40 focus-visible:ring-offset-2";

export function SiteHeader() {
  const [open, setOpen] = useState(false);
  const menuId = useId();

  useEffect(() => {
    if (!open) {
      return;
    }
    document.body.style.overflow = "hidden";
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(false);
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  return (
    <>
      <header className="sticky top-0 z-40 border-b border-slate-200/90 bg-white/85 shadow-[0_1px_0_rgba(15,23,42,0.04)] backdrop-blur-md supports-[backdrop-filter]:bg-white/70">
        <div className="mx-auto flex min-h-[4.25rem] max-w-7xl items-center justify-between gap-4 px-4 sm:min-h-[4.75rem] sm:px-6 lg:min-h-[5.25rem] lg:px-8">
          <Link
            href="/"
            className="group flex shrink-0 items-center gap-2 py-1.5 outline-none ring-emerald-500/30 focus-visible:rounded-lg focus-visible:ring-2 focus-visible:ring-offset-2 sm:gap-3 sm:py-2"
            onClick={() => setOpen(false)}
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

          <div className="flex shrink-0 items-center gap-2">
            <nav className="hidden shrink-0 items-center gap-0.5 sm:flex sm:gap-1" aria-label="Main navigation">
              <Link href="/" className={navLinkClass}>
                Home
              </Link>
              <Link href="/about" className={navLinkClass}>
                About
              </Link>
              <Link href="/categories" className={navLinkClass}>
                Categories
              </Link>
              <Link href="/calculators" className={navLinkClass}>
                All calculators
              </Link>
            </nav>

            <button
              type="button"
              className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-transparent text-teal-700 transition hover:bg-teal-50 hover:text-teal-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/30 focus-visible:ring-offset-2 sm:hidden"
              aria-label={open ? "Close menu" : "Open menu"}
              aria-expanded={open}
              aria-controls={menuId}
              onClick={() => setOpen((v) => !v)}
            >
              {open ? (
                <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              )}
            </button>
          </div>
        </div>
      </header>

      <div
        className={`fixed inset-0 z-[1000] overflow-hidden sm:hidden ${open ? "" : "pointer-events-none"}`}
        aria-hidden={!open}
      >
        <button
          type="button"
          className={`absolute inset-0 z-[1000] bg-slate-900/45 backdrop-blur-[1px] transition-opacity ${
            open ? "opacity-100" : "opacity-0"
          }`}
          aria-label="Close menu"
          onClick={() => setOpen(false)}
          tabIndex={open ? 0 : -1}
        />

        <aside
          id={menuId}
          className={`absolute right-0 top-0 z-[1001] h-full w-[18rem] max-w-[85vw] border-l border-slate-200 bg-white opacity-100 shadow-2xl [backdrop-filter:none] transition-transform ${
            open ? "translate-x-0" : "translate-x-full"
          }`}
          style={{ backgroundColor: "#fff" }}
          role="dialog"
          aria-modal="true"
          aria-label="Menu"
        >
          <div className="bg-gradient-to-r from-teal-600 via-cyan-600 to-sky-600 px-4 py-4 text-white">
            <div className="flex items-center justify-between">
              <div className="flex justify-center min-w-0">
                <p className="text-lg font-bold tracking-tight">Menu</p>
              </div>
            <button
              type="button"
              className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-white/10 text-white transition hover:bg-white/15 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/40 focus-visible:ring-offset-2 focus-visible:ring-offset-teal-700"
              aria-label="Close menu"
              onClick={() => setOpen(false)}
              tabIndex={open ? 0 : -1}
            >
              <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            </div>
          </div>

          <nav aria-label="Mobile navigation" className="p-3">
            <Link href="/" className={mobileNavLinkClass} onClick={() => setOpen(false)}>
              Home
            </Link>
            <Link href="/categories" className={mobileNavLinkClass} onClick={() => setOpen(false)}>
              Categories
            </Link>
            <Link href="/calculators" className={mobileNavLinkClass} onClick={() => setOpen(false)}>
              All calculators
            </Link>
          </nav>
        </aside>
      </div>
    </>
  );
}
