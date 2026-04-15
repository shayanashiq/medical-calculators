import { prisma } from "@/lib/prisma";
import type { UnitPresetListItem, UnitPresetOption } from "@/lib/unit-preset-types";

export function parseUnitPresetOptionsFromJson(raw: unknown): UnitPresetOption[] {
  if (!Array.isArray(raw)) {
    return [];
  }
  const out: UnitPresetOption[] = [];
  for (const item of raw) {
    if (!item || typeof item !== "object") {
      continue;
    }
    const u = item as Record<string, unknown>;
    const key = typeof u.key === "string" ? u.key : "";
    const label = typeof u.label === "string" ? u.label : "";
    const mul = typeof u.mul === "number" && Number.isFinite(u.mul) ? u.mul : Number.NaN;
    if (!key || !label || !Number.isFinite(mul) || mul === 0) {
      continue;
    }
    const suffix = typeof u.suffix === "string" ? u.suffix : undefined;
    const add = typeof u.add === "number" && Number.isFinite(u.add) ? u.add : undefined;
    const min = typeof u.min === "number" && Number.isFinite(u.min) ? u.min : undefined;
    const max = typeof u.max === "number" && Number.isFinite(u.max) ? u.max : undefined;
    out.push({ key, label, suffix, mul, add, min, max });
  }
  return out;
}

export async function getAllUnitPresetsForAdmin(): Promise<UnitPresetListItem[]> {
  const rows = await prisma.unitPreset.findMany({ orderBy: { name: "asc" } });
  return rows.map((r) => ({
    id: r.id,
    slug: r.slug,
    name: r.name,
    description: r.description,
    options: parseUnitPresetOptionsFromJson(r.options),
  }));
}
