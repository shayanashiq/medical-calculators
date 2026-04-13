"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import type { PublicCalculator } from "@/lib/calculator-types";
import { NumberInput, ResultBox, SelectInput } from "@/components/calculators/form-controls";

type Props = { calculator: PublicCalculator };

function numberFieldsWithinLimits(calc: PublicCalculator, vals: Record<string, number>): boolean {
  for (const f of calc.fields) {
    if (f.fieldType !== "NUMBER") {
      continue;
    }
    const v = vals[f.key];
    if (typeof v !== "number" || !Number.isFinite(v)) {
      return false;
    }
    const min = f.min ?? 0;
    const max = f.max ?? Number.POSITIVE_INFINITY;
    if (v < min || v > max) {
      return false;
    }
  }
  return true;
}

export function DynamicCalculator({ calculator }: Props) {
  const initial = useMemo(() => {
    const v: Record<string, number> = {};
    for (const f of calculator.fields) {
      v[f.key] = f.defaultValue;
    }
    return v;
  }, [calculator.fields]);

  const [values, setValues] = useState<Record<string, number>>(initial);
  const [results, setResults] = useState<{ label: string; unit: string; value: number }[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  const run = useCallback(
    async (next: Record<string, number>) => {
      setPending(true);
      setError(null);
      try {
        const res = await fetch(`/api/calculators/${calculator.slug}/calculate`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ values: next }),
        });
        const data = (await res.json()) as { results?: { label: string; unit: string; value: number }[]; error?: string };
        if (!res.ok) {
          setResults(null);
          setError(data.error ?? "Could not calculate.");
          return;
        }
        setResults(data.results ?? null);
      } catch {
        setResults(null);
        setError("Network error. Try again.");
      } finally {
        setPending(false);
      }
    },
    [calculator.slug],
  );

  useEffect(() => {
    if (!numberFieldsWithinLimits(calculator, values)) {
      setPending(false);
      setError(null);
      setResults(null);
      return;
    }
    const t = setTimeout(() => {
      void run(values);
    }, 280);
    return () => clearTimeout(t);
  }, [values, run, calculator]);

  const setNumber = (key: string, n: number) => {
    setValues((prev) => ({ ...prev, [key]: n }));
  };

  const setSelect = (key: string, value: string) => {
    setNumber(key, Number.parseFloat(value));
  };

  return (
    <div>
      <div className="rounded-2xl border border-slate-200/90 bg-gradient-to-b from-slate-50/90 to-white p-5 shadow-[inset_0_1px_0_0_rgb(255_255_255_/_0.8)] sm:p-6">
        <div className="mb-4 flex items-center gap-2">
          <span
            className="flex h-8 w-8 items-center justify-center rounded-lg bg-sky-100 text-sky-800"
            aria-hidden
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"
              />
              <path strokeLinecap="round" strokeLinejoin="round" d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
            </svg>
          </span>
          <div>
            <h2 className="text-sm font-bold text-slate-900">Your inputs</h2>
            <p className="text-xs text-slate-500">Adjust values — results update automatically.</p>
          </div>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          {calculator.fields.map((f) =>
            f.fieldType === "SELECT" ? (
              <SelectInput
                key={f.key}
                label={f.label}
                value={String(values[f.key] ?? f.defaultValue)}
                onChange={(v) => setSelect(f.key, v)}
                options={(f.selectOptions ?? []).map((o) => ({
                  value: String(o.value),
                  label: o.label,
                }))}
              />
            ) : (
              <NumberInput
                key={f.key}
                label={f.label}
                value={values[f.key] ?? f.defaultValue}
                min={f.min ?? 0}
                max={f.max ?? 1e9}
                step={f.step}
                onChange={(n) => setNumber(f.key, n)}
              />
            ),
          )}
        </div>
      </div>

      {error ? (
        <ResultBox variant="error">{error}</ResultBox>
      ) : results && results.length > 0 ? (
        <div className="mt-5 space-y-2">
          <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-slate-500">Results</p>
          {results.map((r, idx) => (
            <ResultBox key={`${r.label}-${idx}`}>
              {r.label}: {r.value}
              {r.unit ? ` ${r.unit}` : ""}
            </ResultBox>
          ))}
          {pending ? (
            <p className="text-xs text-slate-400">Updating…</p>
          ) : null}
        </div>
      ) : (
        <p className="mt-5 text-sm text-slate-500">
          {pending
            ? "Calculating…"
            : numberFieldsWithinLimits(calculator, values)
              ? "Enter values to see results."
              : "Keep typing — values must stay within the allowed range for each field."}
        </p>
      )}
    </div>
  );
}
