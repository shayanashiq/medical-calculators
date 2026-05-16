"use server";

import { FieldType, type Prisma } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import {
  validateIncomingCategory,
  validateIncomingCategoryPatch,
  type IncomingCategoryBody,
  type IncomingCategoryPatchBody,
} from "@/lib/admin-category-payload";
import {
  validateIncomingCalculator,
  type IncomingCalculatorBody,
} from "@/lib/admin-calculator-payload";
import {
  validateIncomingSharedField,
  type IncomingSharedFieldBody,
} from "@/lib/admin-shared-field-payload";
import {
  validateIncomingUnitPreset,
  type IncomingUnitPresetBody,
} from "@/lib/admin-unit-preset-payload";
import { getCategorySlugSet } from "@/lib/categories";
import { prisma } from "@/lib/prisma";

type ActionResult<T = void> = { ok: true; data: T } | { ok: false; error: string };
type EmptyResult = ActionResult<null>;

async function requireAdmin() {
  const session = await auth();
  if (!session?.user) {
    return { ok: false as const, error: "Unauthorized" };
  }
  return null;
}

function ok<T>(data: T): ActionResult<T> {
  return { ok: true, data };
}

function fail(error: string): EmptyResult {
  return { ok: false, error };
}

function revalidatePublicCalculatorPaths(slug: string, category: string) {
  revalidatePath("/");
  revalidatePath("/calculators");
  revalidatePath(`/calculators/${slug}`);
  revalidatePath("/categories");
  revalidatePath(`/categories/${category}`);
  revalidatePath("/sitemap.xml");
}

function normalizeKeywordList(raw: unknown, max = 60): string[] | undefined {
  if (!Array.isArray(raw)) return undefined;
  const out: string[] = [];
  const seen = new Set<string>();
  for (const v of raw) {
    if (typeof v !== "string") continue;
    const t = v.trim().replace(/\s+/g, " ");
    if (!t) continue;
    const k = t.toLowerCase();
    if (seen.has(k)) continue;
    seen.add(k);
    out.push(t);
    if (out.length >= max) break;
  }
  return out.length ? out : undefined;
}

function normalizeSeo(raw: unknown) {
  if (!raw || typeof raw !== "object") return null;
  const r = raw as Record<string, unknown>;
  const specific = normalizeKeywordList(r.specific);
  const problems = normalizeKeywordList(r.problems);
  const promos = normalizeKeywordList(r.promos);
  const longTail = normalizeKeywordList(r.longTail);
  const contentExpansion = normalizeKeywordList(r.contentExpansion);
  if (!specific && !problems && !promos && !longTail && !contentExpansion) return null;
  return {
    ...(specific ? { specific } : {}),
    ...(problems ? { problems } : {}),
    ...(promos ? { promos } : {}),
    ...(longTail ? { longTail } : {}),
    ...(contentExpansion ? { contentExpansion } : {}),
  };
}

async function ensureSharedAndPresetReferences(data: IncomingCalculatorBody) {
  const sharedIds = Array.from(
    new Set(data.fields.map((f) => f.sharedFieldId).filter((value): value is string => Boolean(value))),
  );
  if (sharedIds.length > 0) {
    const count = await prisma.sharedField.count({ where: { id: { in: sharedIds } } });
    if (count !== sharedIds.length) {
      return "One or more selected shared fields no longer exist.";
    }
  }

  const unitPresetIds = Array.from(
    new Set(data.fields.map((f) => f.unitPresetId).filter((value): value is string => Boolean(value))),
  );
  if (unitPresetIds.length > 0) {
    const count = await prisma.unitPreset.count({ where: { id: { in: unitPresetIds } } });
    if (count !== unitPresetIds.length) {
      return "One or more selected unit presets no longer exist.";
    }
  }

  return null;
}

function calculatorFieldsCreate(data: IncomingCalculatorBody) {
  return data.fields.map((f, idx) => ({
    key: f.key,
    label: f.label,
    fieldType: f.fieldType === "SELECT" ? FieldType.SELECT : FieldType.NUMBER,
    min: f.min,
    max: f.max,
    step: f.step,
    defaultValue: f.defaultValue,
    sharedFieldId: f.sharedFieldId ?? null,
    unitPresetId: f.unitPresetId ?? null,
    sortOrder: f.sortOrder ?? idx,
    selectOptions: f.selectOptions ?? undefined,
    unitOptions: f.unitOptions ?? undefined,
  }));
}

export async function createCategoryAction(
  input: IncomingCategoryBody,
): Promise<ActionResult<{ id: string }>> {
  const unauthorized = await requireAdmin();
  if (unauthorized) return unauthorized;

  const parsed = validateIncomingCategory(input);
  if (!parsed.ok) {
    return { ok: false, error: parsed.error };
  }

  const exists = await prisma.category.findUnique({ where: { slug: parsed.data.slug } });
  if (exists) {
    return { ok: false, error: "A category with this slug already exists." };
  }

  const created = await prisma.category.create({ data: parsed.data });
  revalidatePath("/categories");
  revalidatePath("/admin/categories");
  return ok({ id: created.id });
}

export async function updateCategoryAction(
  id: string,
  input: IncomingCategoryPatchBody,
): Promise<ActionResult<{ id: string }>> {
  const unauthorized = await requireAdmin();
  if (unauthorized) return unauthorized;

  const parsed = validateIncomingCategoryPatch(input);
  if (!parsed.ok) {
    return { ok: false, error: parsed.error };
  }

  const existing = await prisma.category.findUnique({ where: { id } });
  if (!existing) {
    return { ok: false, error: "Not found" };
  }

  const updated = await prisma.category.update({
    where: { id },
    data: parsed.data,
  });

  revalidatePath("/categories");
  revalidatePath(`/categories/${existing.slug}`);
  revalidatePath("/admin/categories");
  return ok({ id: updated.id });
}

export async function deleteCategoryAction(id: string): Promise<EmptyResult> {
  const unauthorized = await requireAdmin();
  if (unauthorized) return unauthorized;

  const row = await prisma.category.findUnique({ where: { id } });
  if (!row) {
    return fail("Not found");
  }

  const inUse = await prisma.calculator.count({ where: { category: row.slug } });
  if (inUse > 0) {
    return fail(`Cannot delete: ${inUse} calculator(s) still use this category slug.`);
  }

  await prisma.category.delete({ where: { id } });
  revalidatePath("/categories");
  revalidatePath(`/categories/${row.slug}`);
  revalidatePath("/admin/categories");
  return ok(null);
}

export async function createUnitPresetAction(
  input: IncomingUnitPresetBody,
): Promise<ActionResult<{ id: string }>> {
  const unauthorized = await requireAdmin();
  if (unauthorized) return unauthorized;

  const parsed = validateIncomingUnitPreset(input);
  if (!parsed.ok) {
    return { ok: false, error: parsed.error };
  }

  try {
    const row = await prisma.unitPreset.create({
      data: {
        slug: parsed.data.slug,
        name: parsed.data.name,
        description: parsed.data.description,
        options: parsed.data.options as Prisma.InputJsonValue,
      },
    });
    revalidatePath("/admin/unit-presets");
    return ok({ id: row.id });
  } catch {
    return { ok: false, error: "Could not create preset (slug may already exist)." };
  }
}

export async function updateUnitPresetAction(
  id: string,
  input: IncomingUnitPresetBody,
): Promise<ActionResult<{ id: string }>> {
  const unauthorized = await requireAdmin();
  if (unauthorized) return unauthorized;

  const parsed = validateIncomingUnitPreset(input);
  if (!parsed.ok) {
    return { ok: false, error: parsed.error };
  }

  try {
    const row = await prisma.$transaction(async (tx) => {
      const updated = await tx.unitPreset.update({
        where: { id },
        data: {
          slug: parsed.data.slug,
          name: parsed.data.name,
          description: parsed.data.description,
          options: parsed.data.options as Prisma.InputJsonValue,
        },
      });
      await tx.sharedField.updateMany({
        where: { unitPresetId: id },
        data: { unitOptions: parsed.data.options as Prisma.InputJsonValue },
      });
      await tx.calculatorField.updateMany({
        where: { unitPresetId: id },
        data: { unitOptions: parsed.data.options as Prisma.InputJsonValue },
      });
      return updated;
    });
    revalidatePath("/admin/unit-presets");
    return ok({ id: row.id });
  } catch {
    return { ok: false, error: "Could not update preset (check slug is unique)." };
  }
}

export async function deleteUnitPresetAction(id: string): Promise<EmptyResult> {
  const unauthorized = await requireAdmin();
  if (unauthorized) return unauthorized;

  try {
    await prisma.unitPreset.delete({ where: { id } });
    revalidatePath("/admin/unit-presets");
    return ok(null);
  } catch {
    return fail("Not found");
  }
}

export async function createSharedFieldAction(
  input: IncomingSharedFieldBody,
): Promise<ActionResult<{ id: string }>> {
  const unauthorized = await requireAdmin();
  if (unauthorized) return unauthorized;

  const parsed = validateIncomingSharedField(input);
  if (!parsed.ok) {
    return { ok: false, error: parsed.error };
  }

  if (parsed.data.unitPresetId) {
    const exists = await prisma.unitPreset.count({ where: { id: parsed.data.unitPresetId } });
    if (!exists) {
      return { ok: false, error: "Selected unit preset no longer exists." };
    }
  }

  try {
    const row = await prisma.sharedField.create({
      data: {
        slug: parsed.data.slug,
        key: parsed.data.key,
        label: parsed.data.label,
        fieldType: parsed.data.fieldType === "SELECT" ? FieldType.SELECT : FieldType.NUMBER,
        min: parsed.data.min,
        max: parsed.data.max,
        step: parsed.data.step,
        defaultValue: parsed.data.defaultValue,
        selectOptions: parsed.data.selectOptions ?? undefined,
        unitOptions: parsed.data.unitOptions ?? undefined,
        unitPresetId: parsed.data.unitPresetId ?? null,
        description: parsed.data.description,
      },
    });
    revalidatePath("/admin/shared-fields");
    return ok({ id: row.id });
  } catch {
    return { ok: false, error: "Could not create shared field (slug may already exist)." };
  }
}

export async function updateSharedFieldAction(
  id: string,
  input: IncomingSharedFieldBody,
): Promise<ActionResult<{ id: string }>> {
  const unauthorized = await requireAdmin();
  if (unauthorized) return unauthorized;

  const parsed = validateIncomingSharedField(input);
  if (!parsed.ok) {
    return { ok: false, error: parsed.error };
  }

  if (parsed.data.unitPresetId) {
    const exists = await prisma.unitPreset.count({ where: { id: parsed.data.unitPresetId } });
    if (!exists) {
      return { ok: false, error: "Selected unit preset no longer exists." };
    }
  }

  try {
    const row = await prisma.$transaction(async (tx) => {
      const updated = await tx.sharedField.update({
        where: { id },
        data: {
          slug: parsed.data.slug,
          key: parsed.data.key,
          label: parsed.data.label,
          fieldType: parsed.data.fieldType === "SELECT" ? FieldType.SELECT : FieldType.NUMBER,
          min: parsed.data.min,
          max: parsed.data.max,
          step: parsed.data.step,
          defaultValue: parsed.data.defaultValue,
          selectOptions: parsed.data.selectOptions ?? undefined,
          unitOptions: parsed.data.unitOptions ?? undefined,
          unitPresetId: parsed.data.unitPresetId ?? null,
          description: parsed.data.description,
        },
      });
      await tx.calculatorField.updateMany({
        where: { sharedFieldId: id },
        data: {
          key: parsed.data.key,
          label: parsed.data.label,
          fieldType: parsed.data.fieldType === "SELECT" ? FieldType.SELECT : FieldType.NUMBER,
          min: parsed.data.min,
          max: parsed.data.max,
          step: parsed.data.step,
          defaultValue: parsed.data.defaultValue,
          selectOptions: parsed.data.selectOptions ?? undefined,
          unitOptions: parsed.data.unitOptions ?? undefined,
          unitPresetId: parsed.data.unitPresetId ?? null,
        },
      });
      return updated;
    });
    revalidatePath("/admin/shared-fields");
    return ok({ id: row.id });
  } catch {
    return { ok: false, error: "Could not update shared field (check slug uniqueness)." };
  }
}

export async function deleteSharedFieldAction(id: string): Promise<EmptyResult> {
  const unauthorized = await requireAdmin();
  if (unauthorized) return unauthorized;

  try {
    await prisma.sharedField.delete({ where: { id } });
    revalidatePath("/admin/shared-fields");
    return ok(null);
  } catch {
    return fail("Not found");
  }
}

export async function importExistingFieldsAction(): Promise<
  ActionResult<{ scanned: number; created: number; linked: number }>
> {
  const unauthorized = await requireAdmin();
  if (unauthorized) return unauthorized;

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

  revalidatePath("/admin/shared-fields");
  return ok({ scanned, created, linked });
}

export async function saveCalculatorAction(
  input: IncomingCalculatorBody,
  calculatorId?: string,
): Promise<ActionResult<{ id: string; slug: string }>> {
  const unauthorized = await requireAdmin();
  if (unauthorized) return unauthorized;

  const allowedCategorySlugs = await getCategorySlugSet();
  const parsed = validateIncomingCalculator(input, { allowedCategorySlugs });
  if (!parsed.ok) {
    return { ok: false, error: parsed.error };
  }

  const referenceError = await ensureSharedAndPresetReferences(parsed.data);
  if (referenceError) {
    return { ok: false, error: referenceError };
  }

  const existingBySlug = await prisma.calculator.findUnique({ where: { slug: parsed.data.slug } });
  if (!calculatorId && existingBySlug) {
    return { ok: false, error: "A calculator with this slug already exists." };
  }

  if (calculatorId) {
    const existing = await prisma.calculator.findUnique({ where: { id: calculatorId } });
    if (!existing) {
      return { ok: false, error: "Not found" };
    }
    if (existingBySlug && existingBySlug.id !== calculatorId) {
      return { ok: false, error: "Another calculator already uses this slug." };
    }

    await prisma.$transaction(async (tx) => {
      await tx.calculatorField.deleteMany({ where: { calculatorId } });
      await tx.calculator.update({
        where: { id: calculatorId },
        data: {
          slug: parsed.data.slug,
          name: parsed.data.name,
          description: parsed.data.description,
          formulaPlain: parsed.data.formulaPlain,
          category: parsed.data.category,
          seo: (parsed.data.seo ?? null) as Prisma.InputJsonValue,
          contentHtml: parsed.data.contentHtml ?? null,
          ...(parsed.data.limitationsDetailed !== undefined
            ? { limitationsDetailed: parsed.data.limitationsDetailed }
            : {}),
          showOnHome: parsed.data.showOnHome,
          isPublished: parsed.data.isPublished,
          outputs: parsed.data.outputs as Prisma.InputJsonValue,
          validationExpr: parsed.data.validationExpr,
          validationMessage: parsed.data.validationMessage,
          fields: { create: calculatorFieldsCreate(parsed.data) },
        },
      });
    });

    revalidatePath("/admin/calculators");
    revalidatePath("/admin/seo");
    revalidatePublicCalculatorPaths(existing.slug, existing.category);
    if (existing.slug !== parsed.data.slug || existing.category !== parsed.data.category) {
      revalidatePublicCalculatorPaths(parsed.data.slug, parsed.data.category);
    }
    return ok({ id: calculatorId, slug: parsed.data.slug });
  }

  const created = await prisma.calculator.create({
    data: {
      slug: parsed.data.slug,
      name: parsed.data.name,
      description: parsed.data.description,
      formulaPlain: parsed.data.formulaPlain,
      category: parsed.data.category,
      seo: (parsed.data.seo ?? null) as Prisma.InputJsonValue,
      contentHtml: parsed.data.contentHtml ?? null,
      limitationsDetailed: parsed.data.limitationsDetailed ?? null,
      showOnHome: parsed.data.showOnHome,
      isPublished: parsed.data.isPublished,
      outputs: parsed.data.outputs as Prisma.InputJsonValue,
      validationExpr: parsed.data.validationExpr,
      validationMessage: parsed.data.validationMessage,
      fields: { create: calculatorFieldsCreate(parsed.data) },
    },
  });

  revalidatePath("/admin/calculators");
  revalidatePath("/admin/seo");
  revalidatePublicCalculatorPaths(parsed.data.slug, parsed.data.category);
  return ok({ id: created.id, slug: created.slug });
}

export async function deleteCalculatorAction(id: string): Promise<EmptyResult> {
  const unauthorized = await requireAdmin();
  if (unauthorized) return unauthorized;

  const existing = await prisma.calculator.findUnique({
    where: { id },
    select: { slug: true, category: true },
  });
  if (!existing) {
    return fail("Not found");
  }

  await prisma.calculator.delete({ where: { id } });
  revalidatePath("/admin/calculators");
  revalidatePath("/admin/seo");
  revalidatePublicCalculatorPaths(existing.slug, existing.category);
  return ok(null);
}

export async function saveCalculatorSeoAction(
  id: string,
  input: {
    seo?: unknown;
  },
): Promise<EmptyResult> {
  const unauthorized = await requireAdmin();
  if (unauthorized) return unauthorized;

  const exists = await prisma.calculator.findUnique({
    where: { id },
    select: { id: true, slug: true, category: true },
  });
  if (!exists) {
    return fail("Not found");
  }

  await prisma.calculator.update({
    where: { id },
    data: { seo: normalizeSeo(input.seo) as Prisma.InputJsonValue | null },
  });

  revalidatePath("/admin/seo");
  revalidatePublicCalculatorPaths(exists.slug, exists.category);
  return ok(null);
}
