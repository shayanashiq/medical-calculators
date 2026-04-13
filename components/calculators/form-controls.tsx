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
  value,
  onChange,
  min,
  max,
}: {
  label: string;
  value: number;
  onChange: (value: number) => void;
  min: number;
  max: number;
  step?: number;
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
  const padClass = hint ? "pr-[4.25rem]" : "pr-3.5";

  return (
    <label className="group block">
      <span className="mb-1.5 block text-sm font-semibold text-slate-700">{label}</span>
      <div className="relative">
        <input
          type="text"
          inputMode="decimal"
          autoComplete="off"
          className={`w-full rounded-xl border border-slate-300/90 bg-white px-3.5 py-2.5 text-sm tabular-nums text-slate-800 shadow-sm outline-none ring-0 placeholder:text-slate-400 transition group-hover:border-slate-400/90 focus:border-sky-500 focus:ring-4 focus:ring-sky-100 ${padClass}`}
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
        {hint ? (
          <span
            className="pointer-events-none absolute right-3 top-1/2 max-w-[3.75rem] -translate-y-1/2 truncate text-right text-[11px] font-medium tabular-nums text-slate-400"
            title={`Allowed range: ${hint}`}
          >
            {hint}
          </span>
        ) : null}
      </div>
    </label>
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
          className="w-full appearance-none rounded-xl border border-slate-300/90 bg-white px-3.5 py-2.5 pr-10 text-sm text-slate-800 shadow-sm outline-none transition group-hover:border-slate-400/90 focus:border-sky-500 focus:ring-4 focus:ring-sky-100"
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
  success:
    "border-emerald-200/90 bg-emerald-50 text-emerald-950 shadow-[0_2px_8px_-2px_rgb(6_95_70_/_0.12)]",
  error: "border-red-200/90 bg-red-50 text-red-950 shadow-[0_2px_8px_-2px_rgb(127_29_29_/_0.1)]",
} as const;

export function ResultBox({
  children,
  variant = "success",
}: {
  children: ReactNode;
  variant?: keyof typeof resultStyles;
}) {
  return (
    <p
      className={`mt-5 rounded-xl border px-4 py-3 text-sm font-semibold ${resultStyles[variant]}`}
      role={variant === "error" ? "alert" : undefined}
    >
      {children}
    </p>
  );
}
