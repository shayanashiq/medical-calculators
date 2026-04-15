import { auth } from "@/auth";
import { CalculatorAdminForm } from "@/components/admin/calculator-admin-form";
import { getAllCategories } from "@/lib/categories";
import { getAllUnitPresetsForAdmin } from "@/lib/unit-preset-queries";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function NewCalculatorPage() {
  const session = await auth();
  if (!session?.user) {
    redirect("/admin/login");
  }

  const [categoryList, unitPresets] = await Promise.all([getAllCategories(), getAllUnitPresetsForAdmin()]);

  return (
    <div className="p-6 lg:p-10">
      <div className="mx-auto max-w-4xl">
        <h1 className="text-2xl font-bold text-slate-900">New calculator</h1>
        <p className="mt-1 text-sm text-slate-600">Define inputs, outputs, and validation. Slug must be unique.</p>
        <div className="mt-8">
          <CalculatorAdminForm mode="create" categoryList={categoryList} unitPresets={unitPresets} key="new" />
        </div>
      </div>
    </div>
  );
}
