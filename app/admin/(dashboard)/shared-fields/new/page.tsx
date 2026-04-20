import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { SharedFieldAdminForm } from "@/components/admin/shared-field-admin-form";
import { getAllUnitPresetsForAdmin } from "@/lib/unit-preset-queries";

export const dynamic = "force-dynamic";

export default async function NewSharedFieldPage() {
  const session = await auth();
  if (!session?.user) {
    redirect("/admin/login");
  }
  const unitPresets = await getAllUnitPresetsForAdmin();

  return (
    <div className="p-6 lg:p-10">
      <div className="mx-auto max-w-4xl">
        <h1 className="text-2xl font-bold text-slate-900">New field</h1>
        <p className="mt-1 text-sm text-slate-600">Create a reusable input field for calculator forms.</p>
        <div className="mt-8">
          <SharedFieldAdminForm mode="create" unitPresets={unitPresets} key="new" />
        </div>
      </div>
    </div>
  );
}
