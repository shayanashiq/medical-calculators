import { notFound, redirect } from "next/navigation";
import { auth } from "@/auth";
import { SharedFieldAdminForm } from "@/components/admin/shared-field-admin-form";
import { getAllSharedFieldsForAdmin } from "@/lib/shared-field-queries";
import { prisma } from "@/lib/prisma";
import { getAllUnitPresetsForAdmin } from "@/lib/unit-preset-queries";

export const dynamic = "force-dynamic";

export default async function EditSharedFieldPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user) {
    redirect("/admin/login");
  }

  const { id } = await params;
  const [row, allShared, unitPresets] = await Promise.all([
    prisma.sharedField.findUnique({ where: { id } }),
    getAllSharedFieldsForAdmin(),
    getAllUnitPresetsForAdmin(),
  ]);
  if (!row) {
    notFound();
  }
  const initial = allShared.find((s) => s.id === row.id);
  if (!initial) {
    notFound();
  }

  return (
    <div className="p-6 lg:p-10">
      <div className="mx-auto max-w-4xl">
        <h1 className="text-2xl font-bold text-slate-900">Edit field</h1>
        <p className="mt-1 text-sm text-slate-600">{row.label}</p>
        <div className="mt-8">
          <SharedFieldAdminForm mode="edit" fieldId={row.id} initial={initial} unitPresets={unitPresets} key={row.id} />
        </div>
      </div>
    </div>
  );
}
