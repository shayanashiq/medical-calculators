"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { PublicCalculator } from "@/lib/calculator-types";
import { NumberInput, ResultBox, SelectInput, UnitToggleGroup } from "@/components/calculators/form-controls";

type Props = { calculator: PublicCalculator };

type UnitOption = NonNullable<NonNullable<PublicCalculator["fields"][number]["unitOptions"]>[number]>;

function toBase(x: number, opt: UnitOption): number {
  const add = typeof opt.add === "number" ? opt.add : 0;
  return (x + add) * opt.mul;
}

function fromBase(base: number, opt: UnitOption): number {
  const add = typeof opt.add === "number" ? opt.add : 0;
  return base / opt.mul - add;
}

function withDynamicUnitLabel(label: string, unitText?: string) {
  const cleaned = label.replace(/\s*\([^)]*\)\s*$/, "").trim();
  if (!unitText?.trim()) {
    return cleaned;
  }
  return `${cleaned} (${unitText.trim()})`;
}

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
  const [results, setResults] = useState<
    { label: string; unit: string; value: number; variant?: "good" | "warning" | "severe" | "neutral" }[] | null
  >(null);
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  const stickyRef = useRef<HTMLDivElement | null>(null);

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
        const data = (await res.json()) as {
          results?: {
            label: string;
            unit: string;
            value: number;
            variant?: "good" | "warning" | "severe" | "neutral";
          }[];
          error?: string;
        };
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

  const builtInUnitOptions = useMemo(() => {
    if (calculator.slug !== "bmi") return new Map<string, UnitOption[]>();
    const map = new Map<string, UnitOption[]>();
    // If admin didn't configure unit options, provide a sensible default for BMI.
    map.set("height_cm", [
      { key: "cm", label: "cm", suffix: "cm", mul: 1 },
      { key: "in", label: "in", suffix: "in", mul: 2.54 },
    ]);
    map.set("weight_kg", [
      { key: "kg", label: "kg", suffix: "kg", mul: 1 },
      { key: "lb", label: "lb", suffix: "lb", mul: 0.45359237 },
    ]);
    return map;
  }, [calculator.slug]);

  const unitOptionsByKey = useMemo(() => {
    const m = new Map<string, UnitOption[]>();
    for (const f of calculator.fields) {
      if (f.fieldType !== "NUMBER") continue;
      const opts = (f.unitOptions ?? null) as UnitOption[] | null;
      if (opts && opts.length >= 2) {
        m.set(f.key, opts);
      } else {
        const builtIn = builtInUnitOptions.get(f.key);
        if (builtIn) {
          m.set(f.key, builtIn);
        }
      }
    }
    return m;
  }, [calculator.fields, builtInUnitOptions]);

  const [unitChoice, setUnitChoice] = useState<Record<string, string>>({});

  useEffect(() => {
    setUnitChoice((prev) => {
      const next = { ...prev };
      for (const [key, opts] of unitOptionsByKey.entries()) {
        if (!next[key] || !opts.some((o) => o.key === next[key])) {
          next[key] = opts[0]?.key ?? "base";
        }
      }
      return next;
    });
  }, [unitOptionsByKey]);

  const isBmi = calculator.slug === "bmi";

  const bmiValue = useMemo(() => {
    if (!isBmi || !results || results.length === 0) {
      return null;
    }
    const r = results.find((x) => x.label.toLowerCase().includes("bmi")) ?? results[0];
    return typeof r?.value === "number" && Number.isFinite(r.value) ? r.value : null;
  }, [isBmi, results]);

  const bmiCategory = useMemo(() => {
    const v = bmiValue;
    if (v == null) {
      return null;
    }
    if (v < 18.5) return { label: "Underweight", tone: "text-amber-800 bg-amber-50 border-amber-200/90" };
    if (v < 25) return { label: "Normal", tone: "text-emerald-900 bg-emerald-50 border-emerald-200/90" };
    if (v < 30) return { label: "Overweight", tone: "text-orange-900 bg-orange-50 border-orange-200/90" };
    return { label: "Obese", tone: "text-red-900 bg-red-50 border-red-200/90" };
  }, [bmiValue]);

  const BmiScale = ({ value }: { value: number }) => {
    const clamped = Math.max(10, Math.min(40, value));
    const pct = ((clamped - 10) / (40 - 10)) * 100;
    const markerLeft = `clamp(12px, ${pct}%, calc(100% - 12px))`;
    return (
      <div className="mt-4">
        <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">Visual indicator</p>
        <div className="relative">
          <div className="grid grid-cols-4 overflow-hidden rounded-xl border border-slate-200 bg-white">
            <div className="bg-amber-100 px-2 py-2 text-center text-[11px] font-semibold text-amber-900">
              Under
            </div>
            <div className="bg-emerald-100 px-2 py-2 text-center text-[11px] font-semibold text-emerald-900">
              Normal
            </div>
            <div className="bg-orange-100 px-2 py-2 text-center text-[11px] font-semibold text-orange-900">
              Over
            </div>
            <div className="bg-red-100 px-2 py-2 text-center text-[11px] font-semibold text-red-900">
              Obese
            </div>
          </div>
          <div className="pointer-events-none absolute -top-2 -translate-x-1/2" style={{ left: markerLeft }}>
            <div>
              <div className="h-3 w-0 border-l-2 border-slate-900/70" />
              <p className="mt-1 -translate-x-1/2 whitespace-nowrap text-[11px] font-semibold text-slate-700">
                ↑ Your BMI
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div>
      <div className="rounded-2xl border border-slate-200 bg-white">
        <div className="border-b border-slate-100 p-5 sm:p-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-sm font-bold text-slate-900">Your inputs</h2>
              <p className="text-xs text-slate-500">Adjust values — results update automatically.</p>
            </div>
          </div>

          <div className="mt-4 grid gap-4 sm:grid-cols-2">
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
                <div key={f.key}>
                  {(() => {
                    const opts = unitOptionsByKey.get(f.key);
                    const chosen = opts?.find((o) => o.key === unitChoice[f.key]) ?? opts?.[0];
                    const base = values[f.key] ?? f.defaultValue;
                    const baseMin = f.min ?? 0;
                    const baseMax = f.max ?? 1e9;
                    const displayMin =
                      typeof chosen?.min === "number" ? chosen.min : chosen ? fromBase(baseMin, chosen) : baseMin;
                    const displayMax =
                      typeof chosen?.max === "number" ? chosen.max : chosen ? fromBase(baseMax, chosen) : baseMax;
                    const safeMin = Math.min(displayMin, displayMax);
                    const safeMax = Math.max(displayMin, displayMax);
                    const displayVal =
                      chosen && Number.isFinite(base) ? Math.round(fromBase(base, chosen) * 1000) / 1000 : base;
                    const suffix = chosen?.suffix;
                    const dynamicLabel = withDynamicUnitLabel(f.label, chosen?.suffix ?? chosen?.label);
                    return (
                      <NumberInput
                        label={dynamicLabel}
                        labelAccessory={
                          opts ? (
                            <UnitToggleGroup
                              options={opts.map((o) => ({ key: o.key, label: o.label }))}
                              value={unitChoice[f.key] ?? opts[0]!.key}
                              onChange={(k) => setUnitChoice((p) => ({ ...p, [f.key]: k }))}
                              ariaLabel={`${f.label} units`}
                            />
                          ) : undefined
                        }
                        value={displayVal}
                        min={safeMin}
                        max={safeMax}
                        step={f.step}
                        suffix={suffix}
                        onChange={(n) => {
                          if (chosen) {
                            setNumber(f.key, toBase(n, chosen));
                          } else {
                            setNumber(f.key, n);
                          }
                        }}
                      />
                    );
                  })()}
                </div>
              ),
            )}
          </div>
        </div>

        <div className="p-5 sm:p-6" ref={stickyRef}>
          {error ? (
            <ResultBox variant="error">{error}</ResultBox>
          ) : results && results.length > 0 ? (
            <div className="space-y-2">
              <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">Results</p>
              <div className="space-y-3">
                {results.map((r, idx) => (
                  <ResultBox key={`${r.label}-${idx}`} variant={r.variant ?? "good"}>
                    {r.label}: {r.value}
                    {r.unit ? ` ${r.unit}` : ""}
                  </ResultBox>
                ))}
              </div>
              {pending ? <p className="text-xs text-slate-400">Updating…</p> : null}

              {isBmi && bmiValue != null && bmiCategory ? (
                <div className="mt-4 rounded-2xl border border-slate-200 bg-slate-50/60 p-4">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <p className="text-sm font-bold text-slate-900">Result interpretation</p>
                    <span className={`rounded-full border px-3 py-1 text-xs font-bold ${bmiCategory.tone}`}>
                      {bmiCategory.label}
                    </span>
                  </div>

                  <div className="mt-3 grid gap-2 rounded-xl border border-slate-200 bg-white p-3 text-xs">
                    <div className="flex items-center justify-between gap-3">
                      <span className="font-semibold text-slate-700">Underweight</span>
                      <span className="text-slate-500">&lt; 18.5</span>
                    </div>
                    <div className="flex items-center justify-between gap-3">
                      <span className="font-semibold text-slate-700">Normal</span>
                      <span className="text-slate-500">18.5 – 24.9</span>
                    </div>
                    <div className="flex items-center justify-between gap-3">
                      <span className="font-semibold text-slate-700">Overweight</span>
                      <span className="text-slate-500">25 – 29.9</span>
                    </div>
                    <div className="flex items-center justify-between gap-3">
                      <span className="font-semibold text-slate-700">Obese</span>
                      <span className="text-slate-500">30+</span>
                    </div>
                  </div>

                  <BmiScale value={bmiValue} />

                  <div className="mt-4 rounded-xl border border-slate-200 bg-white p-3">
                    <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Health guidance</p>
                    <p className="mt-2 text-sm text-slate-700">
                      {bmiValue < 18.5
                        ? "You may be underweight. Consider discussing nutrition and healthy weight gain strategies with a clinician or dietitian."
                        : bmiValue < 25
                          ? "You’re in the normal range. Maintain your weight with a balanced diet, sleep, and regular activity."
                          : bmiValue < 30
                            ? "You’re in the overweight range. Small lifestyle changes can help—consider activity, nutrition, and portion habits."
                            : "You’re in the obese range. Consider a structured plan with a clinician; gradual changes are often more sustainable."}
                    </p>
                  </div>

                  <div className="mt-3 rounded-xl border border-slate-200 bg-white p-3">
                    <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Limitations</p>
                    <ul className="mt-2 list-disc pl-5 text-sm text-slate-700">
                      <li>BMI doesn’t measure body fat directly.</li>
                      <li>It may be less accurate for athletes, older adults, and during pregnancy.</li>
                      <li>Use it as a screening tool—not a diagnosis.</li>
                    </ul>
                  </div>
                </div>
              ) : null}
            </div>
          ) : (
            <p className="text-sm text-slate-500">
              {pending
                ? "Calculating…"
                : numberFieldsWithinLimits(calculator, values)
                  ? "Enter values to see results."
                  : "Keep typing — values must stay within the allowed range for each field."}
            </p>
          )}
        </div>
      </div>

      {isBmi && bmiValue != null && bmiCategory ? (
        <div className="fixed bottom-4 right-4 z-30 hidden max-w-[16rem] rounded-2xl border border-slate-200 bg-white/95 p-3 shadow-xl backdrop-blur sm:block">
          <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">BMI</p>
          <div className="mt-1 flex items-end justify-between gap-2">
            <p className="text-lg font-extrabold text-slate-900">{bmiValue}</p>
            <span className={`rounded-full border px-2 py-1 text-[11px] font-bold ${bmiCategory.tone}`}>
              {bmiCategory.label}
            </span>
          </div>
        </div>
      ) : null}
    </div>
  );
}
