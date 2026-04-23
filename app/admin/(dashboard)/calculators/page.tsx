import Link from "next/link";
import { auth } from "@/auth";
import { DeleteCalculatorButton } from "@/components/admin/delete-calculator-button";
import { PaginationBar } from "@/components/ui/pagination-bar";
import { prisma } from "@/lib/prisma";
import { CALCULATORS_PAGE_SIZE, parsePageParam, totalPages } from "@/lib/list-pagination";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function AdminCalculatorsPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; q?: string }>;
}) {
  const session = await auth();
  if (!session?.user) {
    redirect("/admin/login");
  }

  const sp = await searchParams;
  const page = parsePageParam(sp.page);
  const qRaw = typeof sp.q === "string" ? sp.q : "";
  const q = qRaw.trim();
  const where = q
    ? {
        OR: [
          { name: { contains: q, mode: "insensitive" as const } },
          { slug: { contains: q, mode: "insensitive" as const } },
          { description: { contains: q, mode: "insensitive" as const } },
          { category: { contains: q, mode: "insensitive" as const } },
        ],
      }
    : {};
  const total = await prisma.calculator.count({ where });
  const pages = totalPages(total, CALCULATORS_PAGE_SIZE);
  const safePage = Math.min(page, pages);
  const skip = (safePage - 1) * CALCULATORS_PAGE_SIZE;

  const rows = await prisma.calculator.findMany({
    where,
    orderBy: { name: "asc" },
    skip,
    take: CALCULATORS_PAGE_SIZE,
    select: { id: true, slug: true, name: true, category: true, updatedAt: true },
  });

  const from = total === 0 ? 0 : skip + 1;
  const to = Math.min(skip + rows.length, total);

  return (
    <div className="p-6 lg:p-10">
      <div className="mx-auto max-w-5xl">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Calculators</h1>
            <p className="mt-1 text-sm text-slate-600">
              {total} total
              {total > 0 ? (
                <span className="text-slate-400">
                  {" "}
                  · Showing {from}–{to}
                </span>
              ) : null}
            </p>
          </div>
          <Link
            href="/admin/calculators/new"
            className="rounded-xl bg-emerald-700 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-emerald-800"
          >
            Add calculator
          </Link>
        </div>
        <form className="mt-4">
          <input
            type="search"
            name="q"
            defaultValue={qRaw}
            placeholder="Search calculators..."
            className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm shadow-sm"
          />
        </form>

        <div className="mt-8 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-slate-200 bg-slate-50 text-xs font-semibold uppercase tracking-wide text-slate-500">
              <tr>
                <th className="px-4 py-3">Name</th>
                <th className="px-4 py-3">Slug</th>
                <th className="px-4 py-3">Category</th>
                <th className="px-4 py-3">Updated</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {rows.map((row) => (
                <tr key={row.id} className="hover:bg-slate-50/80">
                  <td className="px-4 py-3 font-medium text-slate-900">{row.name}</td>
                  <td className="px-4 py-3 font-mono text-xs text-slate-600">{row.slug}</td>
                  <td className="px-4 py-3 text-slate-600">{row.category}</td>
                  <td className="px-4 py-3 text-slate-500">{row.updatedAt.toISOString().slice(0, 10)}</td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex justify-end gap-3">
                      <Link
                        href={`/admin/calculators/${row.id}/edit`}
                        className="font-semibold text-sky-700 hover:text-sky-900"
                      >
                        Edit
                      </Link>
                      <DeleteCalculatorButton id={row.id} name={row.name} />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <PaginationBar
          page={safePage}
          totalPages={pages}
          basePath="/admin/calculators"
          query={q ? { q } : undefined}
        />
      </div>
    </div>
  );
}
