import { FieldType, type Prisma } from "@prisma/client";
import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { validateIncomingCalculator } from "@/lib/admin-calculator-payload";
import { getCategorySlugSet } from "@/lib/categories";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const rows = await prisma.calculator.findMany({
    include: { fields: { orderBy: { sortOrder: "asc" } } },
    orderBy: { name: "asc" },
  });
  return NextResponse.json(rows);
}

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const allowedCategorySlugs = await getCategorySlugSet();
  const parsed = validateIncomingCalculator(body, { allowedCategorySlugs });
  if (!parsed.ok) {
    return NextResponse.json({ error: parsed.error }, { status: 400 });
  }

  const { data } = parsed;

  const sharedIds = Array.from(
    new Set(data.fields.map((f) => f.sharedFieldId).filter((v): v is string => Boolean(v))),
  );
  if (sharedIds.length > 0) {
    const count = await prisma.sharedField.count({ where: { id: { in: sharedIds } } });
    if (count !== sharedIds.length) {
      return NextResponse.json({ error: "One or more selected shared fields no longer exist." }, { status: 400 });
    }
  }

  const exists = await prisma.calculator.findUnique({ where: { slug: data.slug } });
  if (exists) {
    return NextResponse.json({ error: "A calculator with this slug already exists." }, { status: 409 });
  }

  const created = await prisma.calculator.create({
    data: {
      slug: data.slug,
      name: data.name,
      description: data.description,
      formulaPlain: data.formulaPlain,
      category: data.category,
      imageUrl: data.imageUrl,
      seo: (data.seo ?? null) as Prisma.InputJsonValue,
      contentHtml: data.contentHtml ?? null,
      limitationsDetailed: data.limitationsDetailed ?? null,
      showOnHome: data.showOnHome,
      outputs: data.outputs as Prisma.InputJsonValue,
      validationExpr: data.validationExpr,
      validationMessage: data.validationMessage,
      fields: {
        create: data.fields.map((f, idx) => ({
          key: f.key,
          label: f.label,
          fieldType: f.fieldType === "SELECT" ? FieldType.SELECT : FieldType.NUMBER,
          min: f.min,
          max: f.max,
          step: f.step,
          defaultValue: f.defaultValue,
          sharedFieldId: f.sharedFieldId ?? null,
          sortOrder: f.sortOrder ?? idx,
          selectOptions: f.selectOptions ?? undefined,
          unitOptions: f.unitOptions ?? undefined,
        })),
      },
    },
    include: { fields: true },
  });

  return NextResponse.json(created, { status: 201 });
}
