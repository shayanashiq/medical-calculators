import { FieldType } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import type { SharedFieldListItem } from "@/lib/shared-field-types";
import type { UnitPresetOption } from "@/lib/unit-preset-types";

function parseUnitOptionsFromJson(raw: unknown): UnitPresetOption[] | null {
  if (!Array.isArray(raw)) return null;
  const out: UnitPresetOption[] = [];
  for (const row of raw) {
    if (!row || typeof row !== "object") continue;
    const u = row as Record<string, unknown>;
    const key = typeof u.key === "string" ? u.key : "";
    const label = typeof u.label === "string" ? u.label : "";
    const mul = typeof u.mul === "number" && Number.isFinite(u.mul) ? u.mul : Number.NaN;
    if (!key || !label || !Number.isFinite(mul) || mul === 0) continue;
    const suffix = typeof u.suffix === "string" ? u.suffix : undefined;
    const add = typeof u.add === "number" && Number.isFinite(u.add) ? u.add : undefined;
    const min = typeof u.min === "number" && Number.isFinite(u.min) ? u.min : undefined;
    const max = typeof u.max === "number" && Number.isFinite(u.max) ? u.max : undefined;
    out.push({ key, label, suffix, mul, add, min, max });
  }
  return out.length ? out : null;
}

function parseSelectOptionsFromJson(raw: unknown): { label: string; value: number }[] | null {
  if (!Array.isArray(raw)) return null;
  const out: { label: string; value: number }[] = [];
  for (const row of raw) {
    if (!row || typeof row !== "object") continue;
    const o = row as Record<string, unknown>;
    const label = typeof o.label === "string" ? o.label : "";
    const value = typeof o.value === "number" && Number.isFinite(o.value) ? o.value : Number.NaN;
    if (!label || !Number.isFinite(value)) continue;
    out.push({ label, value });
  }
  return out.length ? out : null;
}

function mapFieldType(v: FieldType): "NUMBER" | "SELECT" {
  return v === FieldType.SELECT ? "SELECT" : "NUMBER";
}

export async function getAllSharedFieldsForAdmin(): Promise<SharedFieldListItem[]> {
  const rows = await prisma.sharedField.findMany({ orderBy: [{ label: "asc" }, { slug: "asc" }] });
  return rows.map((r) => ({
    id: r.id,
    slug: r.slug,
    key: r.key,
    label: r.label,
    fieldType: mapFieldType(r.fieldType),
    min: r.min,
    max: r.max,
    step: r.step,
    defaultValue: r.defaultValue,
    selectOptions: parseSelectOptionsFromJson(r.selectOptions),
    unitOptions: parseUnitOptionsFromJson(r.unitOptions),
    unitPresetId: r.unitPresetId ?? null,
    description: r.description,
  }));
}
