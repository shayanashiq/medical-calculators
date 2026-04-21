import type { CalculatorField } from "@prisma/client";
import { FieldType } from "@prisma/client";
import { runCalculator } from "@/lib/calculator-eval";

const slugRe = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const keyRe = /^[a-zA-Z_][a-zA-Z0-9_]*$/;
const objectIdRe = /^[a-f\d]{24}$/i;

export type IncomingOutput = {
  label: string;
  unit: string;
  formula: string;
  guidance?: string;
  limitations?: string;
  decimals?: number;
  ranges?: Array<{
    min?: number;
    max?: number;
    variant: "good" | "warning" | "severe";
    guidance?: string;
    [fieldKey: string]: unknown;
  }>;
};

export type IncomingField = {
  sharedFieldId?: string | null;
  key: string;
  label: string;
  fieldType: "NUMBER" | "SELECT";
  min?: number | null;
  max?: number | null;
  step?: number;
  defaultValue?: number;
  sortOrder?: number;
  selectOptions?: { label: string; value: number }[] | null;
  unitOptions?: Array<{
    key: string;
    label: string;
    suffix?: string;
    mul: number;
    add?: number;
    min?: number;
    max?: number;
  }> | null;
};

export type IncomingCalculatorBody = {
  slug: string;
  name: string;
  description: string;
  formulaPlain: string;
  category: string;
  imageUrl: string | null;
  seo?: {
    specific?: string[];
    problems?: string[];
    promos?: string[];
  } | null;
  contentHtml?: string | null;
  limitationsDetailed?: string | null;
  showOnHome: boolean;
  outputs: IncomingOutput[];
  fields: IncomingField[];
  validationExpr?: string | null;
  validationMessage?: string | null;
};

function normalizeKeywordList(raw: unknown, max = 60): string[] | undefined {
  if (!Array.isArray(raw)) return undefined;
  const out: string[] = [];
  const seen = new Set<string>();
  for (const v of raw) {
    if (typeof v !== "string") continue;
    const t = v.trim();
    if (!t) continue;
    const k = t.toLowerCase();
    if (seen.has(k)) continue;
    seen.add(k);
    out.push(t);
    if (out.length >= max) break;
  }
  return out.length ? out : undefined;
}

function normalizeSeo(raw: unknown): IncomingCalculatorBody["seo"] {
  if (raw === undefined) return undefined;
  if (raw == null) return null;
  if (typeof raw !== "object") return null;
  const r = raw as Record<string, unknown>;
  const specific = normalizeKeywordList(r.specific);
  const problems = normalizeKeywordList(r.problems);
  const promos = normalizeKeywordList(r.promos);
  if (!specific && !problems && !promos) return null;
  return {
    ...(specific ? { specific } : {}),
    ...(problems ? { problems } : {}),
    ...(promos ? { promos } : {}),
  };
}

/** Accepts https?:// URLs or same-origin paths like /calculator-images/…. */
export function normalizeImageUrl(raw: unknown): string | null {
  if (raw == null) {
    return null;
  }
  if (typeof raw !== "string") {
    return null;
  }
  const t = raw.trim();
  if (!t) {
    return null;
  }
  if (t.length > 2048) {
    return null;
  }
  if (t.startsWith("/")) {
    if (t.startsWith("//")) {
      return null;
    }
    return t;
  }
  try {
    const u = new URL(t);
    if (u.protocol !== "http:" && u.protocol !== "https:") {
      return null;
    }
    return t;
  } catch {
    return null;
  }
}

function toTempFields(rows: IncomingField[]): CalculatorField[] {
  return rows.map((f, i) => ({
    id: `tmp-${i}`,
    calculatorId: "tmp",
    sharedFieldId: null,
    key: f.key,
    label: f.label,
    fieldType: f.fieldType === "SELECT" ? FieldType.SELECT : FieldType.NUMBER,
    min: f.min ?? null,
    max: f.max ?? null,
    step: f.step ?? 1,
    defaultValue: f.defaultValue ?? 0,
    selectOptions: f.selectOptions ?? null,
    unitOptions: f.unitOptions ?? null,
    sortOrder: f.sortOrder ?? i,
  }));
}

export function validateIncomingCalculator(
  body: unknown,
  opts: { allowedCategorySlugs: Set<string> },
): { ok: true; data: IncomingCalculatorBody } | { ok: false; error: string } {
  if (!body || typeof body !== "object") {
    return { ok: false, error: "Invalid JSON body." };
  }
  const b = body as Record<string, unknown>;

  const slug = typeof b.slug === "string" ? b.slug.trim() : "";
  const name = typeof b.name === "string" ? b.name.trim() : "";
  const description = typeof b.description === "string" ? b.description.trim() : "";
  const formulaPlain = typeof b.formulaPlain === "string" ? b.formulaPlain.trim() : "";
  const category = typeof b.category === "string" ? b.category.trim() : "";

  if (!slugRe.test(slug)) {
    return { ok: false, error: "Slug must be lowercase letters, numbers, and hyphens only." };
  }
  if (!name) {
    return { ok: false, error: "Name is required." };
  }
  if (!description) {
    return { ok: false, error: "Description is required." };
  }
  if (!formulaPlain) {
    return { ok: false, error: "Formula (display) is required." };
  }
  if (!opts.allowedCategorySlugs.has(category)) {
    return { ok: false, error: "Invalid or unknown category." };
  }

  const imageUrl = normalizeImageUrl(b.imageUrl);
  if (b.imageUrl != null && String(b.imageUrl).trim() !== "" && !imageUrl) {
    return {
      ok: false,
      error: "Image URL must be empty, a valid http(s) link, or a path starting with / (e.g. /calculator-images/…).",
    };
  }

  const seo = normalizeSeo(b.seo);

  const contentHtmlRaw = typeof b.contentHtml === "string" ? b.contentHtml : null;
  const contentHtml = contentHtmlRaw?.trim() ? contentHtmlRaw : null;
  if (contentHtml && contentHtml.length > 50_000) {
    return { ok: false, error: "Content HTML is too long (max 50,000 characters)." };
  }

  let limitationsDetailed: string | null | undefined = undefined;
  if ("limitationsDetailed" in b) {
    const limitationsDetailedRaw =
      typeof b.limitationsDetailed === "string" ? b.limitationsDetailed : null;
    limitationsDetailed = limitationsDetailedRaw?.trim() ? limitationsDetailedRaw.trim() : null;
    if (limitationsDetailed && limitationsDetailed.length > 50_000) {
      return { ok: false, error: "Detailed limitations text is too long (max 50,000 characters)." };
    }
  }

  if (!Array.isArray(b.outputs) || b.outputs.length === 0) {
    return { ok: false, error: "At least one output with a formula is required." };
  }

  const outputs: IncomingOutput[] = [];
  for (const o of b.outputs) {
    if (!o || typeof o !== "object") {
      return { ok: false, error: "Each output must be an object." };
    }
    const out = o as Record<string, unknown>;
    const label = typeof out.label === "string" ? out.label.trim() : "";
    const unit = typeof out.unit === "string" ? out.unit : "";
    const formula = typeof out.formula === "string" ? out.formula.trim() : "";
    const guidance = typeof out.guidance === "string" ? out.guidance.trim() : undefined;
    const limitations = typeof out.limitations === "string" ? out.limitations.trim() : undefined;
    if (!label || !formula) {
      return { ok: false, error: "Each output needs a label and formula." };
    }
    const decimals = typeof out.decimals === "number" && Number.isFinite(out.decimals) ? out.decimals : undefined;

    let ranges: IncomingOutput["ranges"] = undefined;
    if ("ranges" in out && out.ranges != null) {
      if (!Array.isArray(out.ranges)) {
        return { ok: false, error: "Output ranges must be an array." };
      }
      ranges = [];
      for (const r of out.ranges) {
        if (!r || typeof r !== "object") {
          return { ok: false, error: "Each range must be an object." };
        }
        const rr = r as Record<string, unknown>;
        const min = typeof rr.min === "number" && Number.isFinite(rr.min) ? rr.min : undefined;
        const max = typeof rr.max === "number" && Number.isFinite(rr.max) ? rr.max : undefined;
        const variant = rr.variant === "good" || rr.variant === "warning" || rr.variant === "severe" ? rr.variant : null;
        const rangeGuidance = typeof rr.guidance === "string" ? rr.guidance.trim() : undefined;
        if (!variant) {
          return { ok: false, error: "Each range needs variant: good | warning | severe." };
        }
        if (min == null && max == null) {
          return { ok: false, error: "Each range must have at least min or max." };
        }
        const rest: Record<string, number> = {};
        for (const [k, v] of Object.entries(rr)) {
          if (k === "min" || k === "max" || k === "variant" || k === "guidance") continue;
          if (typeof v !== "number" || !Number.isFinite(v)) {
            return { ok: false, error: `Range condition “${k}” must be a finite number.` };
          }
          rest[k] = v;
        }
        ranges.push({ min, max, variant, guidance: rangeGuidance, ...rest });
      }
    }

    outputs.push({ label, unit, formula, guidance, limitations, decimals, ranges });
  }

  if (!Array.isArray(b.fields) || b.fields.length === 0) {
    return { ok: false, error: "At least one input field is required." };
  }

  const fields: IncomingField[] = [];
  const keys = new Set<string>();
  let i = 0;
  for (const row of b.fields) {
    if (!row || typeof row !== "object") {
      return { ok: false, error: "Each field must be an object." };
    }
    const f = row as Record<string, unknown>;
    const sharedFieldIdRaw = typeof f.sharedFieldId === "string" ? f.sharedFieldId.trim() : "";
    const sharedFieldId = sharedFieldIdRaw ? sharedFieldIdRaw : null;
    if (sharedFieldId && !objectIdRe.test(sharedFieldId)) {
      return { ok: false, error: "Invalid sharedFieldId." };
    }
    const key = typeof f.key === "string" ? f.key.trim() : "";
    const label = typeof f.label === "string" ? f.label.trim() : "";
    const fieldType = f.fieldType === "SELECT" || f.fieldType === "NUMBER" ? f.fieldType : null;
    if (!keyRe.test(key)) {
      return { ok: false, error: `Invalid field key: ${key || "(empty)"}` };
    }
    if (keys.has(key)) {
      return { ok: false, error: `Duplicate field key: ${key}` };
    }
    keys.add(key);
    if (!label || !fieldType) {
      return { ok: false, error: "Each field needs a label and fieldType (NUMBER or SELECT)." };
    }

    let min: number | null = null;
    let max: number | null = null;
    if (fieldType === "NUMBER") {
      if (typeof f.min === "number" && Number.isFinite(f.min)) {
        min = f.min;
      }
      if (typeof f.max === "number" && Number.isFinite(f.max)) {
        max = f.max;
      }
    }

    const step = typeof f.step === "number" && Number.isFinite(f.step) ? f.step : 1;
    const defaultValue = typeof f.defaultValue === "number" && Number.isFinite(f.defaultValue) ? f.defaultValue : 0;
    const sortOrder = typeof f.sortOrder === "number" && Number.isFinite(f.sortOrder) ? f.sortOrder : i;

    let selectOptions: { label: string; value: number }[] | null = null;
    if (fieldType === "SELECT") {
      if (!Array.isArray(f.selectOptions) || f.selectOptions.length === 0) {
        return { ok: false, error: `Select field “${label}” needs selectOptions.` };
      }
      selectOptions = [];
      for (const opt of f.selectOptions) {
        if (!opt || typeof opt !== "object") {
          return { ok: false, error: "Invalid select option." };
        }
        const op = opt as Record<string, unknown>;
        const ol = typeof op.label === "string" ? op.label : "";
        const ov = typeof op.value === "number" && Number.isFinite(op.value) ? op.value : Number.NaN;
        if (!ol || !Number.isFinite(ov)) {
          return { ok: false, error: "Select options need label and numeric value." };
        }
        selectOptions.push({ label: ol, value: ov });
      }
      if (!selectOptions.some((o) => o.value === defaultValue)) {
        return { ok: false, error: `Default value for “${label}” must match one of the select option values.` };
      }
    }

    let unitOptions: IncomingField["unitOptions"] = null;
    if (fieldType === "NUMBER" && "unitOptions" in f && f.unitOptions != null) {
      if (!Array.isArray(f.unitOptions)) {
        return { ok: false, error: `unitOptions for “${label}” must be an array.` };
      }
      unitOptions = [];
      const seenUnitKeys = new Set<string>();
      for (const opt of f.unitOptions) {
        if (!opt || typeof opt !== "object") {
          return { ok: false, error: `Invalid unit option for “${label}”.` };
        }
        const u = opt as Record<string, unknown>;
        const uKey = typeof u.key === "string" ? u.key.trim() : "";
        const uLabel = typeof u.label === "string" ? u.label.trim() : "";
        const suffix = typeof u.suffix === "string" ? u.suffix : undefined;
        const mul = typeof u.mul === "number" && Number.isFinite(u.mul) ? u.mul : Number.NaN;
        const add = typeof u.add === "number" && Number.isFinite(u.add) ? u.add : undefined;
        const min = typeof u.min === "number" && Number.isFinite(u.min) ? u.min : undefined;
        const max = typeof u.max === "number" && Number.isFinite(u.max) ? u.max : undefined;
        if (!uKey || !uLabel || !Number.isFinite(mul)) {
          return { ok: false, error: `Each unit option for “${label}” needs key, label, and numeric mul.` };
        }
        if (mul === 0) {
          return { ok: false, error: `Unit option mul cannot be 0 for “${label}”.` };
        }
        if (seenUnitKeys.has(uKey)) {
          return { ok: false, error: `Duplicate unit option key “${uKey}” for “${label}”.` };
        }
        seenUnitKeys.add(uKey);
        unitOptions.push({ key: uKey, label: uLabel, suffix, mul, add, min, max });
      }
      // Allow a single unit option (no conversion / switching).
      if (unitOptions.length < 1) {
        unitOptions = null;
      }
    }

    fields.push({
      sharedFieldId,
      key,
      label,
      fieldType,
      min,
      max,
      step,
      defaultValue,
      sortOrder,
      selectOptions,
      unitOptions,
    });
    i += 1;
  }

  const validationExpr =
    typeof b.validationExpr === "string" && b.validationExpr.trim() ? b.validationExpr.trim() : null;
  const validationMessage =
    typeof b.validationMessage === "string" && b.validationMessage.trim() ? b.validationMessage.trim() : null;

  if (validationExpr && !validationMessage) {
    return { ok: false, error: "Provide a validation message when using a validation expression." };
  }

  const showOnHome = b.showOnHome === true;

  const data: IncomingCalculatorBody = {
    slug,
    name,
    description,
    formulaPlain,
    category,
    imageUrl,
    seo,
    contentHtml,
    showOnHome,
    outputs,
    fields,
    validationExpr,
    validationMessage,
  };
  if (limitationsDetailed !== undefined) {
    data.limitationsDetailed = limitationsDetailed;
  }

  const tempFields = toTempFields(fields);
  const testValues: Record<string, unknown> = {};
  for (const f of fields) {
    testValues[f.key] = f.defaultValue;
  }

  const dry = runCalculator(
    {
      outputs,
      validationExpr,
      validationMessage,
    },
    tempFields,
    testValues,
  );

  if (!dry.ok) {
    return { ok: false, error: `Formula check with default values failed: ${dry.error}` };
  }

  return { ok: true, data };
}
