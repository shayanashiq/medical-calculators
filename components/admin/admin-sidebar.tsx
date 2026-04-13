"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { AdminSignOut } from "@/components/admin/admin-sign-out";
import { SITE_DOMAIN, SITE_MARK } from "@/lib/site-brand";

const nav = [
  { href: "/admin", label: "Dashboard", icon: "◆" },
  { href: "/admin/calculators", label: "Calculators", icon: "⎔" },
  { href: "/admin/categories", label: "Categories", icon: "▦" },
] as const;

export function AdminSidebar() {
  const pathname = usePathname();

  return (
    <aside className="flex w-full shrink-0 flex-col border-b border-slate-800 bg-slate-950 text-slate-200 lg:w-60 lg:border-b-0 lg:border-r">
      <div className="flex items-center justify-between gap-3 px-4 py-4 lg:flex-col lg:items-stretch lg:px-0">
        <Link
          href="/admin"
          className="flex items-center gap-2 px-4 text-left font-bold tracking-tight text-white lg:px-5"
        >
          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-600 text-xs font-semibold uppercase tracking-wide text-white">
            {SITE_MARK}
          </span>
          <span className="min-w-0 text-sm leading-tight">
            <span className="block truncate" title={SITE_DOMAIN}>
              {SITE_DOMAIN}
            </span>
            <span className="block text-[10px] font-medium uppercase tracking-wider text-slate-500">Admin</span>
          </span>
        </Link>
        <div className="lg:border-t lg:border-slate-800 lg:px-3 lg:py-3">
          <AdminSignOut className="w-full rounded-lg px-3 py-2 text-left text-sm font-semibold text-slate-300 hover:bg-slate-900 hover:text-white lg:w-auto" />
        </div>
      </div>

      <nav className="flex flex-wrap gap-1 px-2 pb-3 lg:flex-col lg:px-3 lg:pb-6">
        {nav.map((item) => {
          const active = pathname === item.href || (item.href !== "/admin" && pathname.startsWith(item.href));
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-2 rounded-lg px-3 py-2.5 text-sm font-semibold transition-colors lg:px-3 ${
                active ? "bg-slate-800 text-white shadow-sm" : "text-slate-400 hover:bg-slate-900 hover:text-slate-100"
              }`}
            >
              <span className="text-base opacity-80" aria-hidden>
                {item.icon}
              </span>
              {item.label}
            </Link>
          );
        })}
        <Link
          href="/"
          className="mt-1 flex items-center gap-2 rounded-lg px-3 py-2.5 text-sm font-semibold text-slate-500 hover:bg-slate-900 hover:text-slate-300 lg:mt-2"
        >
          <span aria-hidden>↗</span>
          View site
        </Link>
      </nav>
    </aside>
  );
}
