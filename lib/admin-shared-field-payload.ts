import type { SharedFieldSelectOption } from "@/lib/shared-field-types";
import type { UnitPresetOption } from "@/lib/unit-preset-types";

const slugRe = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const keyRe = /^[a-zA-Z_][a-zA-Z0-9_]*$/;
const objectIdRe = /^[a-f\d]{24}$/i;

export type IncomingSharedFieldBody = {
  slug: string;
  key: string;
  label: string;
  fieldType: "NUMBER" | "SELECT";
  min: number | null;
  max: number | null;
  step: number;
  defaultValue: number;
  selectOptions: SharedFieldSelectOption[] | null;
  unitOptions: UnitPresetOption[] | null;
  unitPresetId: string | null;
  description: string | null;
};

export function validateIncomingSharedField(
  body: unknown,
): { ok: true; data: IncomingSharedFieldBody } | { ok: false; error: string } {
  if (!body || typeof body !== "object") {
    return { ok: false, error: "Invalid JSON body." };
  }
  const b = body as Record<string, unknown>;
  const slug = typeof b.slug === "string" ? b.slug.trim() : "";
  const key = typeof b.key === "string" ? b.key.trim() : "";
  const label = typeof b.label === "string" ? b.label.trim() : "";
  const fieldType = b.fieldType === "SELECT" || b.fieldType === "NUMBER" ? b.fieldType : null;
  const descriptionRaw = typeof b.description === "string" ? b.description.trim() : "";
  const description = descriptionRaw ? descriptionRaw : null;
  const min = typeof b.min === "number" && Number.isFinite(b.min) ? b.min : null;
  const max = typeof b.max === "number" && Number.isFinite(b.max) ? b.max : null;
  const step = typeof b.step === "number" && Number.isFinite(b.step) ? b.step : 1;
  const defaultValue = typeof b.defaultValue === "number" && Number.isFinite(b.defaultValue) ? b.defaultValue : 0;
  const unitPresetIdRaw = typeof b.unitPresetId === "string" ? b.unitPresetId.trim() : "";
  const unitPresetId = unitPresetIdRaw ? unitPresetIdRaw : null;
  if (unitPresetId && !objectIdRe.test(unitPresetId)) {
    return { ok: false, error: "Invalid unitPresetId." };
  }

  if (!slugRe.test(slug)) {
    return { ok: false, error: "Slug must be lowercase letters, numbers, and hyphens only." };
  }
  if (!keyRe.test(key)) {
    return { ok: false, error: "Field key must be a valid identifier (letters, numbers, underscore)." };
  }
  if (!label) {
    return { ok: false, error: "Label is required." };
  }
  if (!fieldType) {
    return { ok: false, error: "fieldType must be NUMBER or SELECT." };
  }

  let selectOptions: SharedFieldSelectOption[] | null = null;
  if (fieldType === "SELECT") {
    if (!Array.isArray(b.selectOptions) || b.selectOptions.length === 0) {
      return { ok: false, error: "Select fields need at least one option." };
    }
    selectOptions = [];
    for (const row of b.selectOptions) {
      if (!row || typeof row !== "object") {
        return { ok: false, error: "Invalid select option." };
      }
      const o = row as Record<string, unknown>;
      const optLabel = typeof o.label === "string" ? o.label.trim() : "";
      const value = typeof o.value === "number" && Number.isFinite(o.value) ? o.value : Number.NaN;
      if (!optLabel || !Number.isFinite(value)) {
        return { ok: false, error: "Select options need label and numeric value." };
      }
      selectOptions.push({ label: optLabel, value });
    }
    if (!selectOptions.some((o) => o.value === defaultValue)) {
      return { ok: false, error: "Default value must match one of the select option values." };
    }
  }

  let unitOptions: UnitPresetOption[] | null = null;
  if (fieldType === "NUMBER" && "unitOptions" in b && b.unitOptions != null) {
    if (!Array.isArray(b.unitOptions)) {
      return { ok: false, error: "unitOptions must be an array." };
    }
    const parsed: UnitPresetOption[] = [];
    const seen = new Set<string>();
    for (const row of b.unitOptions) {
      if (!row || typeof row !== "object") {
        return { ok: false, error: "Invalid unit option." };
      }
      const u = row as Record<string, unknown>;
      const unitKey = typeof u.key === "string" ? u.key.trim() : "";
      const unitLabel = typeof u.label === "string" ? u.label.trim() : "";
      const suffix = typeof u.suffix === "string" ? u.suffix : undefined;
      const mul = typeof u.mul === "number" && Number.isFinite(u.mul) ? u.mul : Number.NaN;
      const add = typeof u.add === "number" && Number.isFinite(u.add) ? u.add : undefined;
      const uMin = typeof u.min === "number" && Number.isFinite(u.min) ? u.min : undefined;
      const uMax = typeof u.max === "number" && Number.isFinite(u.max) ? u.max : undefined;
      if (!unitKey || !unitLabel || !Number.isFinite(mul)) {
        return { ok: false, error: "Each unit option needs key, label, and numeric mul." };
      }
      if (mul === 0) {
        return { ok: false, error: "Unit option mul cannot be 0." };
      }
      if (seen.has(unitKey)) {
        return { ok: false, error: `Duplicate unit option key “${unitKey}”.` };
      }
      seen.add(unitKey);
      parsed.push({ key: unitKey, label: unitLabel, suffix, mul, add, min: uMin, max: uMax });
    }
    if (parsed.length >= 2) {
      unitOptions = parsed;
    }
  }

  return {
    ok: true,
    data: {
      slug,
      key,
      label,
      fieldType,
      min: fieldType === "NUMBER" ? min : null,
      max: fieldType === "NUMBER" ? max : null,
      step,
      defaultValue,
      selectOptions,
      unitOptions,
      unitPresetId: fieldType === "NUMBER" ? unitPresetId : null,
      description,
    },
  };
}
