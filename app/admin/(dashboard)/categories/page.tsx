import Link from "next/link";
import { auth } from "@/auth";
import { DeleteCategoryButton } from "@/components/admin/delete-category-button";
import { NewCategoryForm } from "@/components/admin/new-category-form";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function AdminCategoriesPage() {
  const session = await auth();
  if (!session?.user) {
    redirect("/admin/login");
  }

  const rows = await prisma.category.findMany({
    orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
  });

  const counts = await Promise.all(
    rows.map((r) => prisma.calculator.count({ where: { category: r.slug } })),
  );

  return (
    <div className="p-6 lg:p-10">
      <div className="mx-auto max-w-4xl">
        <h1 className="text-2xl font-bold text-slate-900">Categories</h1>
        <p className="mt-1 text-sm text-slate-600">
          Categories drive browse pages and the calculator category dropdown. Slugs are stored on each calculator.
        </p>

        <div className="mt-8">
          <NewCategoryForm />
        </div>

        <div className="mt-10 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-slate-200 bg-slate-50 text-xs font-semibold uppercase tracking-wide text-slate-500">
              <tr>
                <th className="px-4 py-3">Name</th>
                <th className="px-4 py-3">Slug</th>
                <th className="px-4 py-3">Calculators</th>
                <th className="px-4 py-3">Order</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {rows.map((row, i) => (
                <tr key={row.id} className="hover:bg-slate-50/80">
                  <td className="px-4 py-3 font-medium text-slate-900">{row.name}</td>
                  <td className="px-4 py-3 font-mono text-xs text-slate-600">{row.slug}</td>
                  <td className="px-4 py-3 text-slate-600">{counts[i]}</td>
                  <td className="px-4 py-3 text-slate-500">{row.sortOrder}</td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex flex-wrap items-center justify-end gap-2">
                      <Link
                        href={`/admin/categories/${row.id}/edit`}
                        className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold text-slate-800 shadow-sm transition hover:border-sky-400 hover:bg-sky-50"
                      >
                        Edit
                      </Link>
                      <DeleteCategoryButton id={row.id} name={row.name} />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {rows.length === 0 ? (
            <p className="px-4 py-8 text-center text-sm text-slate-500">No categories yet. Add one above.</p>
          ) : null}
        </div>
      </div>
    </div>
  );
}
