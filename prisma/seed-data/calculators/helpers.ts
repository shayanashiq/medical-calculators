import type { SeedCalculator, SeedContentHints, SeedFieldRef, SeedOutput } from "../types";

export function calc(
  slug: string,
  name: string,
  category: string,
  formulaPlain: string,
  description: string,
  fields: SeedFieldRef[],
  outputs: SeedOutput[],
  opts?: {
    content?: SeedContentHints;
    validationExpr?: string | null;
    validationMessage?: string | null;
    showOnHome?: boolean;
    isPublished?: boolean;
  },
): SeedCalculator {
  return {
    slug,
    name,
    category,
    formulaPlain,
    description,
    fields,
    outputs,
    content: opts?.content,
    validationExpr: opts?.validationExpr,
    validationMessage: opts?.validationMessage,
    showOnHome: opts?.showOnHome ?? false,
    isPublished: opts?.isPublished ?? true,
  };
}

export function shared(...slugs: string[]): SeedFieldRef[] {
  return slugs.map((sharedSlug, sortOrder) => ({ shared: sharedSlug, sortOrder }));
}

export function num(
  key: string,
  label: string,
  min: number,
  max: number,
  defaultValue: number,
  opts?: { step?: number; unitPresetSlug?: string; sortOrder?: number },
): SeedFieldRef {
  return {
    key,
    label,
    fieldType: "NUMBER",
    min,
    max,
    step: opts?.step ?? 1,
    defaultValue,
    unitPresetSlug: opts?.unitPresetSlug ?? null,
    sortOrder: opts?.sortOrder,
  };
}

export function sel(
  key: string,
  label: string,
  options: { label: string; value: number }[],
  defaultValue: number,
  sortOrder?: number,
): SeedFieldRef {
  return {
    key,
    label,
    fieldType: "SELECT",
    selectOptions: options,
    defaultValue,
    sortOrder,
  };
}

export function out(label: string, unit: string, formula: string, decimals = 1): SeedOutput {
  return { label, unit, formula, decimals };
}
