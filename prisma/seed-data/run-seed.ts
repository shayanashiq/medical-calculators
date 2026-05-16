import { FieldType, type Prisma } from "@prisma/client";
import { PrismaClient } from "@prisma/client";
import { buildCalculatorContentHtml } from "@/lib/seed/calculator-content";
import { seedCategories } from "./categories";
import { allCalculators } from "./calculators";
import { seedSharedFields } from "./shared-fields";
import { seedUnitPresets } from "./unit-presets";
import type { SeedCalculator, SeedFieldRef } from "./types";

export async function runDatabaseSeed(prisma: PrismaClient) {
  await prisma.calculator.deleteMany();

  const presetIdBySlug = new Map<string, string>();
  const sharedIdBySlug = new Map<string, string>();

  for (let i = 0; i < seedCategories.length; i++) {
    const c = seedCategories[i]!;
    await prisma.category.upsert({
      where: { slug: c.slug },
      create: {
        slug: c.slug,
        name: c.name,
        description: c.description,
        sortOrder: i,
      },
      update: {
        name: c.name,
        description: c.description,
        sortOrder: i,
      },
    });
  }

  for (const preset of seedUnitPresets) {
    const row = await prisma.unitPreset.upsert({
      where: { slug: preset.slug },
      create: {
        slug: preset.slug,
        name: preset.name,
        description: preset.description,
        options: preset.options as Prisma.InputJsonValue,
      },
      update: {
        name: preset.name,
        description: preset.description,
        options: preset.options as Prisma.InputJsonValue,
      },
    });
    presetIdBySlug.set(preset.slug, row.id);
  }

  for (const field of seedSharedFields) {
    const row = await prisma.sharedField.upsert({
      where: { slug: field.slug },
      create: {
        slug: field.slug,
        key: field.key,
        label: field.label,
        fieldType: field.fieldType,
        min: field.min ?? null,
        max: field.max ?? null,
        step: field.step ?? 1,
        defaultValue: field.defaultValue ?? 0,
        selectOptions: field.selectOptions ?? undefined,
        unitOptions: field.unitOptions ?? undefined,
        unitPresetId: field.unitPresetSlug ? presetIdBySlug.get(field.unitPresetSlug) ?? null : null,
        description: field.description ?? null,
      },
      update: {
        key: field.key,
        label: field.label,
        fieldType: field.fieldType,
        min: field.min ?? null,
        max: field.max ?? null,
        step: field.step ?? 1,
        defaultValue: field.defaultValue ?? 0,
        selectOptions: field.selectOptions ?? undefined,
        unitOptions: field.unitOptions ?? undefined,
        unitPresetId: field.unitPresetSlug ? presetIdBySlug.get(field.unitPresetSlug) ?? null : null,
        description: field.description ?? null,
      },
    });
    sharedIdBySlug.set(field.slug, row.id);
  }

  const sharedFieldBySlug = new Map(seedSharedFields.map((f) => [f.slug, f]));

  /** Generator/catalog slug aliases → canonical shared-field slug */
  const sharedSlugAliases: Record<string, string> = {
    nRBC: "nrbc",
    rbc_millions: "rbc-millions",
    neut_pct: "neut-pct",
    sbp: "systolic-bp",
    plt: "platelet-count",
    bilirubin: "total-bilirubin",
    hb: "hemoglobin",
  };

  function resolveField(ref: SeedFieldRef, sortOrder: number) {
    if ("shared" in ref) {
      const sharedSlug = sharedSlugAliases[ref.shared] ?? ref.shared;
      const base = sharedFieldBySlug.get(sharedSlug);
      if (!base) {
        throw new Error(`Unknown shared field slug: ${ref.shared}`);
      }
      return {
        sharedFieldId: sharedIdBySlug.get(sharedSlug) ?? null,
        key: base.key,
        label: base.label,
        fieldType: base.fieldType,
        min: base.min ?? null,
        max: base.max ?? null,
        step: base.step ?? 1,
        defaultValue: base.defaultValue ?? 0,
        selectOptions: base.selectOptions ?? undefined,
        unitOptions: base.unitOptions ?? undefined,
        unitPresetId: base.unitPresetSlug ? presetIdBySlug.get(base.unitPresetSlug) ?? null : null,
        sortOrder: ref.sortOrder ?? sortOrder,
      };
    }
    return {
      sharedFieldId: null,
      key: ref.key,
      label: ref.label,
      fieldType: ref.fieldType === "SELECT" ? FieldType.SELECT : FieldType.NUMBER,
      min: ref.min ?? null,
      max: ref.max ?? null,
      step: ref.step ?? 1,
      defaultValue: ref.defaultValue ?? 0,
      selectOptions: ref.selectOptions ?? undefined,
      unitOptions: ref.unitOptions ?? undefined,
      unitPresetId: ref.unitPresetSlug ? presetIdBySlug.get(ref.unitPresetSlug) ?? null : null,
      sortOrder: ref.sortOrder ?? sortOrder,
    };
  }

  let created = 0;
  let updated = 0;

  for (const calc of allCalculators) {
    const contentHtml = buildCalculatorContentHtml(calc);
    const seenFieldKeys = new Set<string>();
    const fieldCreates = calc.fields
      .map((f, i) => resolveField(f, i))
      .filter((f) => {
        if (seenFieldKeys.has(f.key)) {
          return false;
        }
        seenFieldKeys.add(f.key);
        return true;
      });

    const data = {
      slug: calc.slug,
      name: calc.name,
      description: calc.description,
      formulaPlain: calc.formulaPlain,
      category: calc.category,
      contentHtml,
      showOnHome: calc.showOnHome ?? false,
      isPublished: calc.isPublished ?? true,
      outputs: calc.outputs as Prisma.InputJsonValue,
      validationExpr: calc.validationExpr ?? null,
      validationMessage: calc.validationMessage ?? null,
      seo: {
        specific: [
          `${calc.name} calculator`,
          `${calc.name} online`,
          `free ${calc.name.toLowerCase()} calculator`,
        ],
        problems: [`how to calculate ${calc.name.toLowerCase()}`, `${calc.name.toLowerCase()} formula`],
        promos: [`best ${calc.name.toLowerCase()} calculator`, `online medical ${calc.category.replace(/-/g, " ")} tools`],
      } as Prisma.InputJsonValue,
    };

    const existing = await prisma.calculator.findUnique({ where: { slug: calc.slug } });
    if (existing) {
      await prisma.$transaction(async (tx) => {
        await tx.calculatorField.deleteMany({ where: { calculatorId: existing.id } });
        await tx.calculator.update({
          where: { id: existing.id },
          data: {
            ...data,
            fields: { create: fieldCreates },
          },
        });
      });
      updated += 1;
    } else {
      await prisma.calculator.create({
        data: {
          ...data,
          fields: { create: fieldCreates },
        },
      });
      created += 1;
    }
  }

  return {
    categories: seedCategories.length,
    unitPresets: seedUnitPresets.length,
    sharedFields: seedSharedFields.length,
    calculators: allCalculators.length,
    created,
    updated,
  };
}
