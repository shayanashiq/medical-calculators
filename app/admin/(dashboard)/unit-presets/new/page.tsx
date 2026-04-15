import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { UnitPresetAdminForm } from "@/components/admin/unit-preset-admin-form";

export const dynamic = "force-dynamic";

export default async function NewUnitPresetPage() {
  const session = await auth();
  if (!session?.user) {
    redirect("/admin/login");
  }

  return (
    <div className="p-6 lg:p-10">
      <div className="mx-auto max-w-4xl">
        <h1 className="text-2xl font-bold text-slate-900">New unit preset</h1>
        <p className="mt-1 text-sm text-slate-600">Create a named set of units and conversion factors for calculator inputs.</p>
        <div className="mt-8">
          <UnitPresetAdminForm mode="create" key="new" />
        </div>
      </div>
    </div>
  );
}
