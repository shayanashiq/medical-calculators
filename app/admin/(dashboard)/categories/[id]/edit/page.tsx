import { notFound, redirect } from "next/navigation";
import { auth } from "@/auth";
import { EditCategoryForm } from "@/components/admin/edit-category-form";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function EditCategoryPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user) {
    redirect("/admin/login");
  }

  const { id } = await params;
  const row = await prisma.category.findUnique({ where: { id } });
  if (!row) {
    notFound();
  }

  return (
    <div className="p-6 lg:p-10">
      <div className="mx-auto max-w-4xl">
        <h1 className="text-2xl font-bold text-slate-900">Edit category</h1>
        <p className="mt-1 text-sm text-slate-600">{row.name}</p>
        <div className="mt-8">
          <EditCategoryForm
            categoryId={row.id}
            slug={row.slug}
            initialName={row.name}
            initialDescription={row.description}
            initialSortOrder={row.sortOrder}
          />
        </div>
      </div>
    </div>
  );
}
