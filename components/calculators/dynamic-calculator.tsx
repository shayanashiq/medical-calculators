"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import type { PublicCalculator } from "@/lib/calculator-types";
import { NumberInput, ResultBox, SelectInput, UnitToggleGroup } from "@/components/calculators/form-controls";
import { SiteSearchBar } from "@/components/ui/site-search-bar";
import { RangedValueIndicator } from "@/components/calculators/ranged-value-indicator";
import type { CalculatorResultRow } from "@/lib/public-calculator-eval";

type Props = { calculator: PublicCalculator; initialResults?: CalculatorResultRow[] };

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

export function DynamicCalculator({ calculator, initialResults = [] }: Props) {
  const router = useRouter();
  const initial = useMemo(() => {
    const v: Record<string, number> = {};
    for (const f of calculator.fields) {
      v[f.key] = f.defaultValue;
    }
    return v;
  }, [calculator.fields]);

  const [values, setValues] = useState<Record<string, number>>(initial);
  const [results, setResults] = useState<CalculatorResultRow[] | null>(
    initialResults.length > 0 ? initialResults : null,
  );
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
          setError(data.error ?? "Could not calculate.");
          return;
        }
        setResults(data.results ?? null);
      } catch {
        setError("Network error. Try again.");
      } finally {
        setPending(false);
      }
    },
    [calculator.slug],
  );

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

  const valuesWithinLimits = useMemo(
    () => numberFieldsWithinLimits(calculator, values),
    [calculator, values],
  );

  const onCalculateClick = () => {
    if (!valuesWithinLimits) {
      setError("Keep typing — values must stay within the allowed range for each field.");
      return;
    }
    void run(values);
  };

  const onResetClick = () => {
    setValues(initial);
    setError(null);
    setPending(false);
    setResults(initialResults.length > 0 ? initialResults : null);
  };

  const rangedResults = useMemo(
    () => (results ?? []).filter((r) => r.variant != null && r.variant !== "neutral"),
    [results],
  );

  const outputDefByLabel = useMemo(() => {
    const m = new Map<string, (typeof calculator.outputs)[number]>();
    for (const o of calculator.outputs) {
      m.set(o.label, o);
    }
    return m;
  }, [calculator.outputs]);

  const shouldShowIndicatorOnly = rangedResults.length > 0;

  const [searchQ, setSearchQ] = useState("");
  const submitSearch = useCallback(() => {
    const term = searchQ.trim();
    const params = new URLSearchParams();
    if (term) {
      params.set("q", term);
    }
    const qs = params.toString();
    router.push(`/calculators${qs ? `?${qs}` : ""}`);
  }, [router, searchQ]);

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1.7fr)_minmax(0,1.1fr)] lg:items-start">
      <div className="rounded-md border border-slate-200 bg-white">
        <div className="border-b border-slate-200 p-5 sm:p-6">
          <div>
            <div>
              <h2 className="text-lg font-bold text-slate-900">Patient parameters</h2>
              <p className="text-xs text-slate-500">Adjust values, then click Calculate.</p>
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

          <div className="mt-4 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onResetClick}
              className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 cursor-pointer"
            >
              Reset
            </button>
            <button
              type="button"
              onClick={onCalculateClick}
              disabled={pending}
              className="rounded-lg border border-teal-600 bg-teal-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-teal-700 disabled:cursor-not-allowed disabled:opacity-60 cursor-pointer"
            >
              {pending ? "Calculating..." : "Calculate"}
            </button>
          </div>
        </div>

        <div className="p-5 sm:p-6">
          {error ? (
            <ResultBox variant="error">{error}</ResultBox>
          ) : results && results.length > 0 ? (
            <div className="space-y-2">
              <p className={`mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500 ${shouldShowIndicatorOnly ? "mb-10" : ""}`}>
                {shouldShowIndicatorOnly ? "Visual indicator" : "Results"}
              </p>
              {shouldShowIndicatorOnly ? (
                <div className="space-y-5">
                  {rangedResults.map((r, idx) => {
                    const resultIndex = (results ?? []).findIndex((x) => x.label === r.label);
                    const def =
                      outputDefByLabel.get(r.label) ?? (resultIndex >= 0 ? calculator.outputs[resultIndex] : undefined);
                    const ranges = def?.ranges;
                    const hasRanges = Array.isArray(ranges) && ranges.length > 0;
                    return (
                      <div key={`${r.label}-${idx}`}>
                      
                        {hasRanges ? (
                          <RangedValueIndicator
                            label={r.label}
                            unit={r.unit}
                            value={r.value}
                            variant={r.variant}
                            ranges={ranges}
                            decimals={def?.decimals}
                          />
                        ) : (
                          <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                            <div className="grid h-3 grid-cols-3">
                              <div className="bg-gradient-to-r from-amber-200 to-amber-100" />
                              <div className="bg-gradient-to-r from-emerald-200 to-emerald-100" />
                              <div className="bg-gradient-to-r from-red-200 to-red-100" />
                            </div>
                          </div>
                        )}
                        
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="space-y-3">
                  {results.map((r, idx) => (
                    <ResultBox key={`${r.label}-${idx}`} variant={r.variant ?? "neutral"}>
                      {r.label}: {r.value}
                      {r.unit ? ` ${r.unit}` : ""}
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
                : valuesWithinLimits
                  ? "Enter values to see results."
                  : "Keep typing — values must stay within the allowed range for each field."}
            </p>
          )}
        </div>
      </div>
      <aside className="space-y-4 lg:sticky lg:top-4">
        <div className="rounded-md border border-slate-200 bg-white p-4">
          <p className="text-lg font-bold text-slate-900">Search calculators</p>
          <p className="mt-1 text-xs text-slate-500">Jump to another calculator without leaving this page.</p>
          <div className="mt-3">
            <SiteSearchBar
              variant="surface"
              align="left"
              value={searchQ}
              onChange={setSearchQ}
              onSubmit={submitSearch}
              placeholder="Search calculators…"
              className="max-w-none"
              inputId={`calculator-side-search-${calculator.slug}`}
              buttonLabel="Go"
            />
          </div>
        </div>
      </aside>

    </div>
  );
}
