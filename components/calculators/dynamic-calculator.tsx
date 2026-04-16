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

function variantBubbleClass(variant: "good" | "warning" | "severe" | "neutral" | undefined) {
  if (variant === "severe") {
    return "border-red-200 bg-red-500 text-white";
  }
  if (variant === "warning") {
    return "border-amber-200 bg-amber-500 text-white";
  }
  if (variant === "good") {
    return "border-emerald-200 bg-emerald-500 text-white";
  }
  return "border-slate-200 bg-white text-slate-800";
}

function variantArrowClass(variant: "good" | "warning" | "severe" | "neutral" | undefined) {
  if (variant === "severe") {
    return "border-t-red-500";
  }
  if (variant === "warning") {
    return "border-t-amber-500";
  }
  if (variant === "good") {
    return "border-t-emerald-500";
  }
  return "border-t-white";
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
    {
      label: string;
      unit: string;
      value: number;
      variant?: "good" | "warning" | "severe" | "neutral";
      guidance?: string;
      limitations?: string;
    }[] | null
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
            guidance?: string;
            limitations?: string;
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

  const unitOptionsByKey = useMemo(() => {
    const m = new Map<string, UnitOption[]>();
    for (const f of calculator.fields) {
      if (f.fieldType !== "NUMBER") continue;
      const opts = (f.unitOptions ?? null) as UnitOption[] | null;
      if (opts && opts.length >= 2) {
        m.set(f.key, opts);
      }
    }
    return m;
  }, [calculator.fields]);

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

  const rangedResults = useMemo(
    () => (results ?? []).filter((r) => r.variant != null && r.variant !== "neutral"),
    [results],
  );
  const isBmi = calculator.slug === "bmi";
  const bmiValue = useMemo(() => {
    if (!isBmi || !results || results.length === 0) {
      return null;
    }
    const r = results.find((x) => x.label.toLowerCase().includes("bmi")) ?? results[0];
    return typeof r?.value === "number" && Number.isFinite(r.value) ? r.value : null;
  }, [isBmi, results]);
  const primaryResult = useMemo(() => rangedResults[0] ?? results?.[0] ?? null, [rangedResults, results]);
  const hasSideContent = Boolean(primaryResult?.guidance || primaryResult?.limitations);

  const shouldShowIndicatorOnly = rangedResults.length > 0;
  const BmiScale = ({
    value,
    variant,
    bubbleText,
  }: {
    value: number;
    variant?: "good" | "warning" | "severe" | "neutral";
    bubbleText?: string;
  }) => {
    const clamped = Math.max(10, Math.min(40, value));
    let pct = 0;
    if (clamped < 18.5) {
      pct = ((clamped - 10) / (18.5 - 10)) * 25;
    } else if (clamped < 25) {
      pct = 25 + ((clamped - 18.5) / (25 - 18.5)) * 25;
    } else if (clamped < 30) {
      pct = 50 + ((clamped - 25) / (30 - 25)) * 25;
    } else {
      pct = 75 + ((clamped - 30) / (40 - 30)) * 25;
    }
    const markerLeft = `clamp(14px, ${pct}%, calc(100% - 14px))`;
    return (
      <div className="mt-4">
        <div className="relative">
          <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="h-3 w-full">
              <div className="grid h-full grid-cols-4">
                <div className="bg-gradient-to-r from-amber-200 to-amber-100" />
                <div className="bg-gradient-to-r from-emerald-200 to-emerald-100" />
                <div className="bg-gradient-to-r from-orange-200 to-orange-100" />
                <div className="bg-gradient-to-r from-red-200 to-red-100" />
              </div>
            </div>
            <div className="grid grid-cols-4 border-t border-slate-100 px-3 py-2 text-[11px]">
              <div className="pr-2 text-left font-semibold text-amber-900">
                Under
                <span className="ml-1 font-medium text-amber-900/70">&lt;18.5</span>
              </div>
              <div className="px-2 text-center font-semibold text-emerald-900">
                Normal
                <span className="ml-1 font-medium text-emerald-900/70">18.5-24.9</span>
              </div>
              <div className="px-2 text-center font-semibold text-orange-900">
                Over
                <span className="ml-1 font-medium text-orange-900/70">25-29.9</span>
              </div>
              <div className="pl-2 text-right font-semibold text-red-900">
                Obese
                <span className="ml-1 font-medium text-red-900/70">30+</span>
              </div>
            </div>
          </div>

          <div className="pointer-events-none absolute -top-7 -translate-x-1/2" style={{ left: markerLeft }}>
            <div className="flex flex-col items-center">
              <div className={`rounded-full border px-2 py-1 text-[11px] font-bold shadow-sm ${variantBubbleClass(variant)}`}>
                {bubbleText ?? `BMI ${Math.round(value * 10) / 10}`}
              </div>
              <div
                className={`-mt-1 h-0 w-0 border-l-[6px] border-r-[6px] border-t-[8px] border-l-transparent border-r-transparent drop-shadow-[0_1px_0_rgba(148,163,184,0.9)] ${variantArrowClass(variant)}`}
              />
              <div className="-mt-1 h-4 w-0 border-l-2 border-slate-900/70" />
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1.7fr)_minmax(0,1.1fr)] lg:items-start">
      <div className="rounded-2xl border border-slate-200 bg-white">
        <div className="border-b border-slate-100 p-5 sm:p-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-sm font-bold text-slate-900">Patient parameters</h2>
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
              <p className={`mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500 ${shouldShowIndicatorOnly ? "mb-10" : ""}`}>
                {shouldShowIndicatorOnly ? "Visual indicator" : "Results"}
              </p>
              {shouldShowIndicatorOnly ? (
                <div className="space-y-5">
                  {isBmi && bmiValue != null ? (
                    <BmiScale
                      value={bmiValue}
                      variant={results?.find((r) => r.label.toLowerCase().includes("bmi"))?.variant}
                      bubbleText={`BMI ${Math.round(bmiValue * 10) / 10}`}
                    />
                  ) : (
                    rangedResults.map((r, idx) => (
                      <div key={`${r.label}-${idx}`} className="rounded-2xl border border-slate-200 bg-slate-50/60 p-4">
                        <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                          <p className="text-sm font-bold text-slate-900">{r.label}</p>
                          <span className={`rounded-full border px-3 py-1 text-xs font-bold ${variantBubbleClass(r.variant)}`}>
                            {r.variant}
                          </span>
                        </div>
                        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                          <div className="grid h-3 grid-cols-3">
                            <div className="bg-gradient-to-r from-amber-200 to-amber-100" />
                            <div className="bg-gradient-to-r from-emerald-200 to-emerald-100" />
                            <div className="bg-gradient-to-r from-red-200 to-red-100" />
                          </div>
                        </div>
                        <div className="mt-3 space-y-2">
                          <span className={`inline-flex rounded-full border px-3 py-1 text-xs font-bold ${variantBubbleClass(r.variant)}`}>
                            {r.value}
                            {r.unit ? ` ${r.unit}` : ""}
                          </span>
                          {r.guidance ? <p className="text-sm text-slate-700">{r.guidance}</p> : null}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              ) : (
                <div className="space-y-3">
                  {results.map((r, idx) => (
                    <ResultBox key={`${r.label}-${idx}`} variant={r.variant ?? "neutral"}>
                      {r.label}: {r.value}
                      {r.unit ? ` ${r.unit}` : ""}
                      {r.guidance ? <span className="mt-2 block text-sm font-normal">{r.guidance}</span> : null}
                    </ResultBox>
                  ))}
                </div>
              )}
              {pending ? <p className="text-xs text-slate-400">Updating…</p> : null}
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
      <aside className="space-y-4 lg:sticky lg:top-4">
        {hasSideContent ? (
          <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <p className="text-sm font-bold text-slate-900">Result guidance</p>
              {primaryResult?.variant ? (
                <span className={`rounded-full border px-3 py-1 text-xs font-bold ${variantBubbleClass(primaryResult.variant)}`}>
                  {primaryResult.variant}
                </span>
              ) : null}
            </div>

            {primaryResult?.guidance ? (
              <div className="mt-4 rounded-xl border border-slate-200 bg-white p-3">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Health guidance</p>
                <p className="mt-2 text-sm text-slate-700">{primaryResult.guidance}</p>
              </div>
            ) : null}

            {primaryResult?.limitations ? (
              <div className="mt-3 rounded-xl border border-slate-200 bg-white p-3">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Limitations</p>
                <p className="mt-2 text-sm text-slate-700 whitespace-pre-line">{primaryResult.limitations}</p>
              </div>
            ) : null}
          </div>
        ) : null}
      </aside>

    </div>
  );
}
