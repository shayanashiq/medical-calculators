import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { DeleteSharedFieldButton } from "@/components/admin/delete-shared-field-button";
import { ImportExistingFieldsButton } from "@/components/admin/import-existing-fields-button";
import { PaginationBar } from "@/components/ui/pagination-bar";
import { CALCULATORS_PAGE_SIZE, parsePageParam, totalPages } from "@/lib/list-pagination";
import { getAllSharedFieldsForAdmin } from "@/lib/shared-field-queries";

export const dynamic = "force-dynamic";

export default async function SharedFieldsAdminPage({
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
  const q = qRaw.trim().toLowerCase();
  const allRows = await getAllSharedFieldsForAdmin();
  const filtered = q
    ? allRows.filter(
        (r) =>
          r.label.toLowerCase().includes(q) ||
          r.slug.toLowerCase().includes(q) ||
          r.key.toLowerCase().includes(q),
      )
    : allRows;
  const pages = totalPages(filtered.length, CALCULATORS_PAGE_SIZE);
  const safePage = Math.min(page, pages);
  const skip = (safePage - 1) * CALCULATORS_PAGE_SIZE;
  const rows = filtered.slice(skip, skip + CALCULATORS_PAGE_SIZE);

  return (
    <div className="p-6 lg:p-10">
      <div className="mx-auto max-w-5xl">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Fields</h1>
            <p className="mt-1 text-sm text-slate-600">
              Reusable input fields for calculators (height, weight, sex, and more).
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <ImportExistingFieldsButton />
            <Link
              href="/admin/shared-fields/new"
              className="rounded-xl bg-emerald-700 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-emerald-800"
            >
              New field
            </Link>
          </div>
        </div>
        <form className="mt-4">
          <input
            type="search"
            name="q"
            defaultValue={qRaw}
            placeholder="Search fields..."
            className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm shadow-sm"
          />
        </form>

        <ul className="mt-8 divide-y divide-slate-100 rounded-2xl border border-slate-200 bg-white shadow-sm">
          {rows.length === 0 ? (
            <li className="p-6 text-sm text-slate-500">
              No fields yet. Create one and reuse it across calculators.
            </li>
          ) : (
            rows.map((r) => (
              <li key={r.id} className="flex flex-wrap items-center justify-between gap-3 px-4 py-4 sm:px-5">
                <div className="min-w-0">
                  <p className="font-semibold text-slate-900">{r.label}</p>
                  <p className="truncate font-mono text-xs text-slate-500">
                    {r.slug} · key: {r.key} · {r.fieldType}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <Link
                    href={`/admin/shared-fields/${r.id}/edit`}
                    className="text-sm font-semibold text-sky-700 hover:text-sky-900"
                  >
                    Edit
                  </Link>
                  <DeleteSharedFieldButton id={r.id} label={r.label} />
                </div>
              </li>
            ))
          )}
        </ul>
        <PaginationBar
          page={safePage}
          totalPages={pages}
          basePath="/admin/shared-fields"
          query={q ? { q } : undefined}
        />
      </div>
    </div>
  );
}
