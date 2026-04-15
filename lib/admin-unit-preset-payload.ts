import type { UnitPresetOption } from "@/lib/unit-preset-types";

const slugRe = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export type IncomingUnitPresetBody = {
  slug: string;
  name: string;
  description: string | null;
  options: UnitPresetOption[];
};

export function validateIncomingUnitPreset(body: unknown): { ok: true; data: IncomingUnitPresetBody } | { ok: false; error: string } {
  if (!body || typeof body !== "object") {
    return { ok: false, error: "Invalid JSON body." };
  }
  const b = body as Record<string, unknown>;

  const slug = typeof b.slug === "string" ? b.slug.trim() : "";
  const name = typeof b.name === "string" ? b.name.trim() : "";
  const descriptionRaw = typeof b.description === "string" ? b.description.trim() : "";
  const description = descriptionRaw ? descriptionRaw : null;

  if (!slugRe.test(slug)) {
    return { ok: false, error: "Slug must be lowercase letters, numbers, and hyphens only." };
  }
  if (!name) {
    return { ok: false, error: "Name is required." };
  }

  if (!Array.isArray(b.options)) {
    return { ok: false, error: "Options must be an array." };
  }
  if (b.options.length < 2) {
    return { ok: false, error: "Add at least two units (e.g. cm and in)." };
  }

  const options: UnitPresetOption[] = [];
  const seen = new Set<string>();
  for (const opt of b.options) {
    if (!opt || typeof opt !== "object") {
      return { ok: false, error: "Each unit must be an object." };
    }
    const u = opt as Record<string, unknown>;
    const key = typeof u.key === "string" ? u.key.trim() : "";
    const label = typeof u.label === "string" ? u.label.trim() : "";
    const suffix = typeof u.suffix === "string" ? u.suffix : undefined;
    const mul = typeof u.mul === "number" && Number.isFinite(u.mul) ? u.mul : Number.NaN;
    const add = typeof u.add === "number" && Number.isFinite(u.add) ? u.add : undefined;
    const min = typeof u.min === "number" && Number.isFinite(u.min) ? u.min : undefined;
    const max = typeof u.max === "number" && Number.isFinite(u.max) ? u.max : undefined;
    if (!key || !label || !Number.isFinite(mul)) {
      return { ok: false, error: "Each unit needs key, label, and a finite mul." };
    }
    if (mul === 0) {
      return { ok: false, error: "mul cannot be 0." };
    }
    if (seen.has(key)) {
      return { ok: false, error: `Duplicate unit key “${key}”.` };
    }
    seen.add(key);
    options.push({ key, label, suffix, mul, add, min, max });
  }

  return { ok: true, data: { slug, name, description, options } };
}
