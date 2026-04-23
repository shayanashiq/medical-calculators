import { FieldType } from "@prisma/client";
import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { validateIncomingSharedField } from "@/lib/admin-shared-field-payload";
import { prisma } from "@/lib/prisma";

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { id } = await params;
  const row = await prisma.sharedField.findUnique({ where: { id } });
  if (!row) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  return NextResponse.json(row);
}

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { id } = await params;
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }
  const parsed = validateIncomingSharedField(body);
  if (!parsed.ok) {
    return NextResponse.json({ error: parsed.error }, { status: 400 });
  }
  const { data } = parsed;
  if (data.unitPresetId) {
    const exists = await prisma.unitPreset.count({ where: { id: data.unitPresetId } });
    if (!exists) {
      return NextResponse.json({ error: "Selected unit preset no longer exists." }, { status: 400 });
    }
  }
  try {
    const row = await prisma.$transaction(async (tx) => {
      const updated = await tx.sharedField.update({
        where: { id },
        data: {
          slug: data.slug,
          key: data.key,
          label: data.label,
          fieldType: data.fieldType === "SELECT" ? FieldType.SELECT : FieldType.NUMBER,
          min: data.min,
          max: data.max,
          step: data.step,
          defaultValue: data.defaultValue,
          selectOptions: data.selectOptions ?? undefined,
          unitOptions: data.unitOptions ?? undefined,
          unitPresetId: data.unitPresetId ?? null,
          description: data.description,
        },
      });
      await tx.calculatorField.updateMany({
        where: { sharedFieldId: id },
        data: {
          key: data.key,
          label: data.label,
          fieldType: data.fieldType === "SELECT" ? FieldType.SELECT : FieldType.NUMBER,
          min: data.min,
          max: data.max,
          step: data.step,
          defaultValue: data.defaultValue,
          selectOptions: data.selectOptions ?? undefined,
          unitOptions: data.unitOptions ?? undefined,
          unitPresetId: data.unitPresetId ?? null,
        },
      });
      return updated;
    });
    return NextResponse.json(row);
  } catch {
    return NextResponse.json({ error: "Could not update shared field (check slug uniqueness)." }, { status: 400 });
  }
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { id } = await params;
  try {
    await prisma.sharedField.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
}
