import type { CalculatorOutputDef, PublicCalculator } from "@/lib/calculator-types";
import { evaluateExpression } from "@/lib/calculator-eval";

export type CalculatorResultRow = {
  label: string;
  unit: string;
  value: number;
  variant?: "good" | "warning" | "severe" | "neutral";
  guidance?: string;
  limitations?: string;
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
  return outputs.map((o) => {
    const rawValue = evaluateExpression(o.formula, values);
    const decimals = o.decimals ?? 1;
    const factor = 10 ** decimals;
    const rounded = Math.round(rawValue * factor) / factor;

    let variant: "good" | "warning" | "severe" | "neutral" = "neutral";
    let guidance = typeof o.guidance === "string" && o.guidance.trim() ? o.guidance.trim() : undefined;
    const limitations =
      typeof o.limitations === "string" && o.limitations.trim() ? o.limitations.trim() : undefined;

    if (Array.isArray(o.ranges) && o.ranges.length > 0) {
      let matched = false;
      for (const r of o.ranges) {
        const minOk = typeof r.min === "number" ? rounded >= r.min : true;
        const maxOk = typeof r.max === "number" ? rounded <= r.max : true;
        if (minOk && maxOk) {
          variant = r.variant;
          if (typeof r.guidance === "string" && r.guidance.trim()) {
            guidance = r.guidance.trim();
          }
          matched = true;
          break;
        }
      }
      if (!matched) {
        variant = "warning";
      }
    }

    return { label: o.label, unit: o.unit, value: rounded, variant, guidance, limitations };
  });
}
