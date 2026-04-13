import { Parser } from "expr-eval";
import type { Calculator, CalculatorField } from "@prisma/client";
import type { CalculatorOutputDef } from "@/lib/calculator-types";

function createParser() {
  return new Parser();
}

export function evaluateExpression(formula: string, scope: Record<string, number>): number {
  const parser = createParser();
  const value = parser.evaluate(formula, scope);
  if (typeof value !== "number" || !Number.isFinite(value)) {
    throw new Error("Result is not a finite number.");
  }
  return value;
}

export function evaluateValidation(expr: string | null | undefined, scope: Record<string, number>): boolean {
  if (!expr?.trim()) {
    return true;
  }
  const parser = createParser();
  try {
    const value = parser.evaluate(expr, scope);
    return Boolean(value);
  } catch {
    return false;
  }
}

export function normalizeFieldValues(
  fields: CalculatorField[],
  raw: Record<string, unknown>,
): { ok: true; values: Record<string, number> } | { ok: false; error: string } {
  const sorted = [...fields].sort((a, b) => a.sortOrder - b.sortOrder);
  const values: Record<string, number> = {};

  for (const f of sorted) {
    const rawVal = raw[f.key];
    let num: number;

    if (f.fieldType === "SELECT") {
      const opts = (f.selectOptions as { label: string; value: number }[] | null) ?? [];
      if (typeof rawVal === "number") {
        num = rawVal;
      } else if (typeof rawVal === "string") {
        num = Number.parseFloat(rawVal);
      } else {
        return { ok: false, error: `Missing value for “${f.label}”.` };
      }
      if (!Number.isFinite(num) || !opts.some((o) => o.value === num)) {
        return { ok: false, error: `Invalid option for “${f.label}”.` };
      }
    } else {
      if (typeof rawVal === "number") {
        num = rawVal;
      } else if (typeof rawVal === "string") {
        num = Number.parseFloat(rawVal);
      } else {
        return { ok: false, error: `Missing value for “${f.label}”.` };
      }
      if (!Number.isFinite(num)) {
        return { ok: false, error: `“${f.label}” must be a valid number.` };
      }
      if (f.min != null && num < f.min) {
        return { ok: false, error: `“${f.label}” is below the allowed minimum (${f.min}).` };
      }
      if (f.max != null && num > f.max) {
        return { ok: false, error: `“${f.label}” is above the allowed maximum (${f.max}).` };
      }
    }
    values[f.key] = num;
  }

  return { ok: true, values };
}

export function runCalculator(
  calculator: Pick<Calculator, "outputs" | "validationExpr" | "validationMessage">,
  fields: CalculatorField[],
  raw: Record<string, unknown>,
):
  | { ok: true; results: { label: string; unit: string; value: number }[] }
  | { ok: false; error: string } {
  const normalized = normalizeFieldValues(fields, raw);
  if (!normalized.ok) {
    return normalized;
  }
  const { values } = normalized;

  if (!evaluateValidation(calculator.validationExpr, values)) {
    return {
      ok: false,
      error:
        calculator.validationMessage ??
        "These inputs are not valid for this calculator. Check the measurements or values.",
    };
  }

  const outputs = calculator.outputs as CalculatorOutputDef[];
  if (!Array.isArray(outputs) || outputs.length === 0) {
    return { ok: false, error: "This calculator has no output formulas configured." };
  }

  try {
    const results = outputs.map((o) => {
      const rawValue = evaluateExpression(o.formula, values);
      const decimals = o.decimals ?? 1;
      const factor = 10 ** decimals;
      const rounded = Math.round(rawValue * factor) / factor;
      return { label: o.label, unit: o.unit, value: rounded };
    });
    return { ok: true, results };
  } catch (e) {
    const message = e instanceof Error ? e.message : "Could not evaluate formula.";
    return { ok: false, error: message };
  }
}
