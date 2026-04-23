import { FieldType } from "@prisma/client";
import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { validateIncomingSharedField } from "@/lib/admin-shared-field-payload";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const rows = await prisma.sharedField.findMany({ orderBy: [{ label: "asc" }, { slug: "asc" }] });
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
    const row = await prisma.sharedField.create({
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
    return NextResponse.json(row, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Could not create shared field (slug may already exist)." }, { status: 400 });
  }
}
