import { notFound, redirect } from "next/navigation";
import { auth } from "@/auth";
import { UnitPresetAdminForm } from "@/components/admin/unit-preset-admin-form";
import { parseUnitPresetOptionsFromJson } from "@/lib/unit-preset-queries";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function EditUnitPresetPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user) {
    redirect("/admin/login");
  }

  const { id } = await params;
  const row = await prisma.unitPreset.findUnique({ where: { id } });
  if (!row) {
    notFound();
  }

  const initial = {
    slug: row.slug,
    name: row.name,
    description: row.description,
    options: parseUnitPresetOptionsFromJson(row.options),
  };

  return (
    <div className="p-6 lg:p-10">
      <div className="mx-auto max-w-4xl">
        <h1 className="text-2xl font-bold text-slate-900">Edit unit preset</h1>
        <p className="mt-1 text-sm text-slate-600">{row.name}</p>
        <div className="mt-8">
          <UnitPresetAdminForm mode="edit" presetId={row.id} initial={initial} key={row.id} />
        </div>
      </div>
    </div>
  );
}
