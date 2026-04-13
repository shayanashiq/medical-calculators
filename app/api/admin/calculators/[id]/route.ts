import { FieldType } from "@prisma/client";
import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { validateIncomingCalculator } from "@/lib/admin-calculator-payload";
import { getCategorySlugSet } from "@/lib/categories";
import { prisma } from "@/lib/prisma";

export async function GET(_req: Request, context: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { id } = await context.params;
  const row = await prisma.calculator.findUnique({
    where: { id },
    include: { fields: { orderBy: { sortOrder: "asc" } } },
  });
  if (!row) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  return NextResponse.json(row);
}

export async function PUT(req: Request, context: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { id } = await context.params;

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

  const existing = await prisma.calculator.findUnique({ where: { id } });
  if (!existing) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const slugTaken = await prisma.calculator.findFirst({
    where: { slug: data.slug, NOT: { id } },
  });
  if (slugTaken) {
    return NextResponse.json({ error: "Another calculator already uses this slug." }, { status: 409 });
  }

  await prisma.$transaction(async (tx) => {
    await tx.calculatorField.deleteMany({ where: { calculatorId: id } });
    await tx.calculator.update({
      where: { id },
      data: {
        slug: data.slug,
        name: data.name,
        description: data.description,
        formulaPlain: data.formulaPlain,
        category: data.category,
        imageUrl: data.imageUrl,
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
          })),
        },
      },
    });
  });

  const updated = await prisma.calculator.findUnique({
    where: { id },
    include: { fields: { orderBy: { sortOrder: "asc" } } },
  });
  return NextResponse.json(updated);
}

export async function DELETE(_req: Request, context: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { id } = await context.params;
  try {
    await prisma.calculator.delete({ where: { id } });
  } catch {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  return NextResponse.json({ ok: true });
}
