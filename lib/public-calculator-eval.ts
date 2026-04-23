import type { CalculatorOutputDef, PublicCalculator } from "@/lib/calculator-types";
import { evaluateExpression } from "@/lib/calculator-eval";

export type CalculatorResultRow = {
  label: string;
  unit: string;
  value: number;
  variant?: "good" | "warning" | "severe" | "neutral";
};

export function defaultValuesFromFields(
  fields: PublicCalculator["fields"],
): Record<string, number> {
  const values: Record<string, number> = {};
  for (const f of fields) {
    values[f.key] = f.defaultValue;
  }
  return values;
}

export function evaluatePublicOutputs(
  outputs: CalculatorOutputDef[],
  values: Record<string, number>,
): CalculatorResultRow[] {
  const rangeMatches = (
    range: Record<string, unknown>,
    value: number,
    scope: Record<string, number>,
  ) => {
    const minOk = typeof range.min === "number" ? value >= range.min : true;
    const maxOk = typeof range.max === "number" ? value <= range.max : true;
    if (!minOk || !maxOk) return false;
    for (const [k, v] of Object.entries(range)) {
      if (k === "min" || k === "max" || k === "variant" || k === "guidance") continue;
      if (typeof v !== "number" || !Number.isFinite(v)) continue;
      if (scope[k] !== v) return false;
    }
    return true;
  };

  return outputs.map((o) => {
    const rawValue = evaluateExpression(o.formula, values);
    const decimals = o.decimals ?? 1;
    const factor = 10 ** decimals;
    const rounded = Math.round(rawValue * factor) / factor;

    let variant: "good" | "warning" | "severe" | "neutral" = "neutral";
    if (Array.isArray(o.ranges) && o.ranges.length > 0) {
      let matched = false;
      for (const r of o.ranges) {
        if (rangeMatches(r as Record<string, unknown>, rounded, values)) {
          variant = r.variant;
          matched = true;
          break;
        }
      }
      if (!matched) {
        variant = "warning";
      }
    }

    return { label: o.label, unit: o.unit, value: rounded, variant };
  });
}
