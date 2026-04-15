"use client";

import type { ReactNode } from "react";
import { useEffect, useState } from "react";

function clampToRange(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function rangeHint(min: number, max: number) {
  if (max >= 1_000_000) {
    return null;
  }
  return `${min}–${max}`;
}

export function NumberInput({
  label,
  labelAccessory,
  value,
  onChange,
  min,
  max,
  suffix,
}: {
  label: string;
  /** Shown on the same row as the label (e.g. unit toggles). */
  labelAccessory?: ReactNode;
  value: number;
  onChange: (value: number) => void;
  min: number;
  max: number;
  step?: number;
  suffix?: string;
}) {
  const [focused, setFocused] = useState(false);
  const [draft, setDraft] = useState(() => String(value));

  useEffect(() => {
    if (!focused) {
      setDraft(String(value));
    }
  }, [value, focused]);

  const display = focused ? draft : String(value);

  const commitDraft = (raw: string) => {
    const trimmed = raw.trim();
    if (trimmed === "" || trimmed === "-" || trimmed === "." || trimmed === "-.") {
      onChange(clampToRange(value, min, max));
      setDraft(String(clampToRange(value, min, max)));
      return;
    }
    const n = Number.parseFloat(trimmed.replace(",", "."));
    if (!Number.isFinite(n)) {
      setDraft(String(value));
      return;
    }
    const clamped = clampToRange(n, min, max);
    onChange(clamped);
    setDraft(String(clamped));
  };

  const hint = rangeHint(min, max);
  const padClass = hint || suffix ? "pr-[4.25rem]" : "pr-3.5";

  return (
    <label className="group block">
      <div className="mb-1.5 flex flex-wrap items-center justify-between gap-2">
        <span className="text-sm font-semibold text-slate-700">{label}</span>
        {labelAccessory ?? null}
      </div>
      <div className="relative">
        <input
          type="text"
          inputMode="decimal"
          autoComplete="off"
          className={`w-full rounded-xl border border-slate-300/90 bg-white px-3.5 py-2.5 text-sm tabular-nums text-slate-800 shadow-sm outline-none ring-0 placeholder:text-slate-400 transition group-hover:border-slate-400/90 focus:border-teal-500 focus:ring-4 focus:ring-teal-100 ${padClass}`}
          value={display}
          placeholder={String(min)}
          aria-valuemin={min}
          aria-valuemax={max}
          aria-valuenow={Number.isFinite(value) ? value : undefined}
          onFocus={() => {
            setFocused(true);
            setDraft(String(value));
          }}
          onBlur={() => {
            setFocused(false);
            commitDraft(draft);
          }}
          onChange={(event) => {
            const next = event.target.value;
            const allowed = /^-?\d*[.,]?\d*$/;
            if (next !== "" && !allowed.test(next)) {
              return;
            }
            setDraft(next);
            const t = next.trim();
            if (t === "" || t === "-" || t === "." || t === "-.") {
              return;
            }
            const n = Number.parseFloat(t.replace(",", "."));
            if (Number.isFinite(n)) {
              onChange(n);
            }
          }}
        />
        {hint || suffix ? (
          <span
            className="pointer-events-none absolute right-3 top-1/2 max-w-[3.75rem] -translate-y-1/2 truncate text-right text-[11px] font-medium tabular-nums text-slate-400"
            title={hint ? `Allowed range: ${hint}` : undefined}
          >
            {hint ?? suffix}
          </span>
        ) : null}
      </div>
    </label>
  );
}

export function UnitToggleGroup({
  options,
  value,
  onChange,
  ariaLabel,
}: {
  options: Array<{ key: string; label: string }>;
  value: string;
  onChange: (key: string) => void;
  ariaLabel: string;
}) {
  return (
    <div
      role="radiogroup"
      aria-label={ariaLabel}
      className="inline-flex max-w-full shrink-0 flex-wrap justify-end gap-0.5 rounded-xl border border-slate-200/80 bg-slate-100/70 p-0.5 shadow-[inset_0_1px_2px_rgba(15,23,42,0.06)]"
    >
      {options.map((o) => {
        const active = o.key === value;
        return (
          <button
            key={o.key}
            type="button"
            role="radio"
            aria-checked={active}
            className={`rounded-lg px-2.5 py-1 text-xs font-semibold tabular-nums transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-400/80 focus-visible:ring-offset-1 ${
              active
                ? "bg-white text-teal-900 shadow-sm ring-1 ring-slate-200/90"
                : "text-slate-600 hover:bg-white/60 hover:text-slate-900"
            }`}
            onClick={() => onChange(o.key)}
          >
            {o.label}
          </button>
        );
      })}
    </div>
  );
}

export function SelectInput({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: Array<{ value: string; label: string }>;
}) {
  return (
    <label className="group block">
      <span className="mb-1.5 block text-sm font-semibold text-slate-700">{label}</span>
      <div className="relative">
        <select
          className="w-full appearance-none rounded-xl border border-slate-300/90 bg-white px-3.5 py-2.5 pr-10 text-sm text-slate-800 shadow-sm outline-none transition group-hover:border-slate-400/90 focus:border-teal-500 focus:ring-4 focus:ring-teal-100"
          value={value}
          onChange={(event) => onChange(event.target.value)}
        >
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" aria-hidden>
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="m6 9 6 6 6-6" />
          </svg>
        </span>
      </div>
    </label>
  );
}

const resultStyles = {
  good:
    "border-emerald-200/90 bg-emerald-50 text-emerald-950 shadow-[0_2px_8px_-2px_rgb(6_95_70_/_0.12)]",
  warning:
    "border-amber-200/90 bg-amber-50 text-amber-950 shadow-[0_2px_8px_-2px_rgb(180_83_9_/_0.14)]",
  severe: "border-red-200/90 bg-red-50 text-red-950 shadow-[0_2px_8px_-2px_rgb(127_29_29_/_0.1)]",
  neutral:
    "border-slate-200/90 bg-slate-50 text-slate-900 shadow-[0_2px_8px_-2px_rgb(15_23_42_/_0.08)]",
  error: "border-red-300/90 bg-red-50 text-red-950 shadow-[0_2px_8px_-2px_rgb(127_29_29_/_0.12)]",
} as const;

export function ResultBox({
  children,
  variant = "neutral",
}: {
  children: ReactNode;
  variant?: keyof typeof resultStyles;
}) {
  return (
    <p
      className={`rounded-xl border px-4 py-3 text-sm font-semibold ${resultStyles[variant]}`}
      role={variant === "severe" || variant === "error" ? "alert" : undefined}
    >
      {children}
    </p>
  );
}
