import { FieldType } from "@prisma/client";
import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

function fieldSignature(row: {
  key: string;
  label: string;
  fieldType: FieldType;
  min: number | null;
  max: number | null;
  step: number;
  defaultValue: number;
  selectOptions: unknown;
  unitOptions: unknown;
}): string {
  return JSON.stringify({
    key: row.key.trim(),
    label: row.label.trim(),
    fieldType: row.fieldType,
    min: row.min,
    max: row.max,
    step: row.step,
    defaultValue: row.defaultValue,
    selectOptions: row.selectOptions ?? null,
    unitOptions: row.unitOptions ?? null,
  });
}

function toSlug(label: string, key: string, idx: number): string {
  const base = `${label}-${key}`
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
  return base ? `${base}-${idx}` : `shared-field-${idx}`;
}

export async function POST() {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const calcFields = await prisma.calculatorField.findMany({
    orderBy: [{ label: "asc" }, { key: "asc" }],
  });
  const existingShared = await prisma.sharedField.findMany();

  const bySig = new Map<string, string>();
  for (const row of existingShared) {
    bySig.set(
      fieldSignature({
        key: row.key,
        label: row.label,
        fieldType: row.fieldType,
        min: row.min,
        max: row.max,
        step: row.step,
        defaultValue: row.defaultValue,
        selectOptions: row.selectOptions,
        unitOptions: row.unitOptions,
      }),
      row.id,
    );
  }

  let created = 0;
  let linked = 0;
  let scanned = 0;
  let slugCounter = 1;
  const usedSlugs = new Set(existingShared.map((s) => s.slug));

  for (const fld of calcFields) {
    scanned += 1;
    const sig = fieldSignature(fld);
    let sharedId = bySig.get(sig);

    if (!sharedId) {
      let slug = toSlug(fld.label, fld.key, slugCounter);
      while (usedSlugs.has(slug)) {
        slugCounter += 1;
        slug = toSlug(fld.label, fld.key, slugCounter);
      }
      usedSlugs.add(slug);
      slugCounter += 1;
      const createdRow = await prisma.sharedField.create({
        data: {
          slug,
          key: fld.key,
          label: fld.label,
          fieldType: fld.fieldType,
          min: fld.min,
          max: fld.max,
          step: fld.step,
          defaultValue: fld.defaultValue,
          selectOptions: fld.selectOptions ?? undefined,
          unitOptions: fld.unitOptions ?? undefined,
          description: null,
        },
      });
      sharedId = createdRow.id;
      bySig.set(sig, sharedId);
      created += 1;
    }

    if (fld.sharedFieldId !== sharedId) {
      await prisma.calculatorField.update({
        where: { id: fld.id },
        data: { sharedFieldId: sharedId },
      });
      linked += 1;
    }
  }

  return NextResponse.json({ scanned, created, linked });
}
