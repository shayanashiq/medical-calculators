import { FieldType } from "@prisma/client";
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
      contentHtml: data.contentHtml ?? null,
      showOnHome: data.showOnHome,
      outputs: data.outputs,
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
