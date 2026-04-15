import { notFound, redirect } from "next/navigation";
import { auth } from "@/auth";
import { CalculatorAdminForm } from "@/components/admin/calculator-admin-form";
import { getAllCategories } from "@/lib/categories";
import { prisma } from "@/lib/prisma";
import { getAllUnitPresetsForAdmin } from "@/lib/unit-preset-queries";

export const dynamic = "force-dynamic";

export default async function EditCalculatorPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user) {
    redirect("/admin/login");
  }

  const { id } = await params;
  const [row, categoryList, unitPresets] = await Promise.all([
    prisma.calculator.findUnique({
      where: { id },
      include: { fields: { orderBy: { sortOrder: "asc" } } },
    }),
    getAllCategories(),
    getAllUnitPresetsForAdmin(),
  ]);
  if (!row) {
    notFound();
  }

  return (
    <div className="p-6 lg:p-10">
      <div className="mx-auto max-w-4xl">
        <h1 className="text-2xl font-bold text-slate-900">Edit calculator</h1>
        <p className="mt-1 text-sm text-slate-600">{row.name}</p>
        <div className="mt-8">
          <CalculatorAdminForm
            mode="edit"
            calculatorId={row.id}
            initialRow={row}
            categoryList={categoryList}
            unitPresets={unitPresets}
            key={row.id}
          />
        </div>
      </div>
    </div>
  );
}
