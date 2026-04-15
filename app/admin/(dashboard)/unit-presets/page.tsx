import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { DeleteUnitPresetButton } from "@/components/admin/delete-unit-preset-button";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function UnitPresetsAdminPage() {
  const session = await auth();
  if (!session?.user) {
    redirect("/admin/login");
  }

  const rows = await prisma.unitPreset.findMany({ orderBy: { name: "asc" } });

  return (
    <div className="p-6 lg:p-10">
      <div className="mx-auto max-w-4xl">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Unit presets</h1>
            <p className="mt-1 text-sm text-slate-600">
              Define reusable unit sets and conversions. When editing a calculator, load a preset into a number field’s
              unit options.
            </p>
          </div>
          <Link
            href="/admin/unit-presets/new"
            className="rounded-xl bg-emerald-700 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-emerald-800"
          >
            New preset
          </Link>
        </div>

        <ul className="mt-8 divide-y divide-slate-100 rounded-2xl border border-slate-200 bg-white shadow-sm">
          {rows.length === 0 ? (
            <li className="p-6 text-sm text-slate-500">No presets yet. Create one to use on calculator fields.</li>
          ) : (
            rows.map((r) => (
              <li key={r.id} className="flex flex-wrap items-center justify-between gap-3 px-4 py-4 sm:px-5">
                <div className="min-w-0">
                  <p className="font-semibold text-slate-900">{r.name}</p>
                  <p className="truncate font-mono text-xs text-slate-500">{r.slug}</p>
                  {r.description ? <p className="mt-1 text-xs text-slate-600">{r.description}</p> : null}
                </div>
                <div className="flex shrink-0 items-center gap-3">
                  <Link href={`/admin/unit-presets/${r.id}/edit`} className="text-sm font-semibold text-sky-700 hover:text-sky-900">
                    Edit
                  </Link>
                  <DeleteUnitPresetButton id={r.id} name={r.name} />
                </div>
              </li>
            ))
          )}
        </ul>
      </div>
    </div>
  );
}
