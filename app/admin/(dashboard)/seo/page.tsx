import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { SeoKeywordsAdmin } from "@/components/admin/seo-keywords-admin";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function AdminSeoPage() {
  const session = await auth();
  if (!session?.user) {
    redirect("/admin/login");
  }

  const calculators = await prisma.calculator.findMany({
    orderBy: { name: "asc" },
    select: { id: true, slug: true, name: true, category: true, seo: true, updatedAt: true },
  });

  return (
    <div className="p-6 lg:p-10">
      <div className="mx-auto max-w-6xl">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">SEO Keywords</h1>
            <p className="mt-1 text-sm text-slate-600">
              Manage calculator-specific keywords (chips), problem-based queries, and best/free/online variations.
            </p>
          </div>
        </div>

        <div className="mt-8">
          <SeoKeywordsAdmin calculators={calculators} />
        </div>
      </div>
    </div>
  );
}

