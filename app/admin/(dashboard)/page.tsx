import Link from "next/link";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function AdminHomePage() {
  const session = await auth();
  if (!session?.user) {
    redirect("/admin/login");
  }

  const [calculatorCount, categoryCount] = await Promise.all([
    prisma.calculator.count(),
    prisma.category.count(),
  ]);

  const cards = [
    {
      title: "Calculators",
      count: calculatorCount,
      href: "/admin/calculators",
      hint: "Create, edit, and remove tools",
      accent: "from-sky-500 to-indigo-600",
    },
    {
      title: "Categories",
      count: categoryCount,
      href: "/admin/categories",
      hint: "Topics shown on the public site",
      accent: "from-emerald-500 to-teal-600",
    },
  ] as const;

  return (
    <div className="p-6 lg:p-10">
      <div className="mx-auto max-w-4xl">
        <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Overview</p>
        <h1 className="mt-1 text-3xl font-bold tracking-tight text-slate-900">Dashboard</h1>
        <p className="mt-2 max-w-xl text-sm text-slate-600">
          Manage database-backed calculators and the category catalog. Changes apply to the public site immediately.
        </p>

        <div className="mt-10 grid gap-5 sm:grid-cols-2">
          {cards.map((c) => (
            <Link
              key={c.href}
              href={c.href}
              className="group relative overflow-hidden rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm transition hover:border-slate-300 hover:shadow-md"
            >
              <div
                className={`absolute -right-6 -top-6 h-28 w-28 rounded-full bg-gradient-to-br ${c.accent} opacity-[0.12] blur-2xl transition group-hover:opacity-20`}
              />
              <p className="text-sm font-semibold text-slate-500">{c.title}</p>
              <p className="mt-2 text-4xl font-bold tabular-nums text-slate-900">{c.count}</p>
              <p className="mt-2 text-sm text-slate-600">{c.hint}</p>
              <span className="mt-4 inline-flex items-center text-sm font-semibold text-sky-700 group-hover:text-sky-900">
                Open →
              </span>
            </Link>
          ))}
        </div>

        <div className="mt-10 rounded-2xl border border-dashed border-slate-300 bg-white/60 p-6">
          <h2 className="text-sm font-bold text-slate-800">Quick links</h2>
          <ul className="mt-3 flex flex-wrap gap-3 text-sm font-semibold">
            <li>
              <Link href="/admin/calculators/new" className="text-emerald-700 hover:text-emerald-900">
                + New calculator
              </Link>
            </li>
            <li>
              <Link href="/admin/categories" className="text-emerald-700 hover:text-emerald-900">
                + New category
              </Link>
            </li>
            <li>
              <Link href="/" className="text-slate-600 hover:text-slate-900">
                Public home
              </Link>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
