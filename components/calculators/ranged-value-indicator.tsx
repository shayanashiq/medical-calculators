import type { CalculatorOutputDef } from "@/lib/calculator-types";

type RangeEntry = NonNullable<CalculatorOutputDef["ranges"]>[number];

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

function segmentBgClass(variant: "good" | "warning" | "severe") {
  if (variant === "severe") {
    return "bg-gradient-to-r from-red-200 to-red-100";
  }
  if (variant === "warning") {
    return "bg-gradient-to-r from-amber-200 to-amber-100";
  }
  return "bg-gradient-to-r from-emerald-200 to-emerald-100";
}

function formatRangeCaption(r: RangeEntry, index: number, ranges: RangeEntry[]): string {
  const hasMin = typeof r.min === "number" && Number.isFinite(r.min);
  const hasMax = typeof r.max === "number" && Number.isFinite(r.max);
  if (hasMin && hasMax) {
    return `${r.min} – ${r.max}`;
  }
  if (hasMax) {
    const prevMax = index > 0 && typeof ranges[index - 1]!.max === "number" ? ranges[index - 1]!.max : null;
    return prevMax != null ? `${prevMax} – ${r.max}` : `≤ ${r.max}`;
  }
  if (hasMin) {
    const nextMin = index < ranges.length - 1 && typeof ranges[index + 1]!.min === "number" ? ranges[index + 1]!.min : null;
    return nextMin != null ? `${r.min} – ${nextMin}` : `≥ ${r.min}`;
  }
  return "";
}

/** Piecewise map value into 0–100 using admin range order and bounds (matches evaluator semantics). */
function markerPercentFromRanges(ranges: RangeEntry[], value: number): number {
  const n = ranges.length;
  if (n === 0) {
    return 50;
  }

  const finiteMins = ranges.map((r) => r.min).filter((x): x is number => typeof x === "number" && Number.isFinite(x));
  const finiteMaxs = ranges.map((r) => r.max).filter((x): x is number => typeof x === "number" && Number.isFinite(x));

  let scaleMin =
    finiteMins.length > 0 ? Math.min(value, ...finiteMins) : finiteMaxs.length > 0 ? Math.min(value, ...finiteMaxs) - 1 : value - 1;
  let scaleMax =
    finiteMaxs.length > 0 ? Math.max(value, ...finiteMaxs) : finiteMins.length > 0 ? Math.max(value, ...finiteMins) + 1 : value + 1;
  if (scaleMax <= scaleMin) {
    scaleMax = scaleMin + 1;
  }

  const bounds = ranges.map((r, i) => {
    const low =
      typeof r.min === "number" && Number.isFinite(r.min)
        ? r.min
        : i === 0
          ? scaleMin
          : typeof ranges[i - 1]!.max === "number" && Number.isFinite(ranges[i - 1]!.max)
            ? ranges[i - 1]!.max!
            : scaleMin;
    const high =
      typeof r.max === "number" && Number.isFinite(r.max)
        ? r.max
        : i === n - 1
          ? scaleMax
          : typeof ranges[i + 1]!.min === "number" && Number.isFinite(ranges[i + 1]!.min)
            ? ranges[i + 1]!.min!
            : scaleMax;
    const lo = Math.min(low, high);
    const hi = Math.max(low, high);
    return { lo, hi };
  });

  let segmentIndex = 0;
  let matched = false;
  for (let i = 0; i < n; i++) {
    const r = ranges[i]!;
    const minOk = typeof r.min === "number" ? value >= r.min : true;
    const maxOk = typeof r.max === "number" ? value <= r.max : true;
    if (minOk && maxOk) {
      segmentIndex = i;
      matched = true;
      break;
    }
  }

  if (!matched) {
    const t = (value - scaleMin) / (scaleMax - scaleMin);
    return Math.min(100, Math.max(0, t * 100));
  }

  const { lo, hi } = bounds[segmentIndex]!;
  const span = hi - lo;
  const clamped = span > 0 ? Math.min(hi, Math.max(lo, value)) : lo;
  const frac = span > 0 ? (clamped - lo) / span : 0.5;
  return ((segmentIndex + frac) / n) * 100;
}

type Props = {
  label: string;
  unit: string;
  value: number;
  variant?: "good" | "warning" | "severe" | "neutral";
  ranges: RangeEntry[];
  decimals?: number;
};

export function RangedValueIndicator({ label, unit, value, variant, ranges, decimals = 1 }: Props) {
  const n = ranges.length;
  const factor = 10 ** decimals;
  const rounded = Math.round(value * factor) / factor;
  const bubbleText = `${label} ${rounded}${unit ? ` ${unit}` : ""}`;
  const pct = markerPercentFromRanges(ranges, rounded);
  const markerLeft = `clamp(14px, ${pct}%, calc(100% - 14px))`;

  return (
    <div className="mt-4">
      <div className="relative">
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="h-3 w-full" style={{ display: "grid", gridTemplateColumns: `repeat(${n}, minmax(0, 1fr))` }}>
            {ranges.map((r, i) => (
              <div key={i} className={`min-h-[12px] ${segmentBgClass(r.variant)}`} />
            ))}
          </div>
          <div
            className="grid border-t border-slate-100 px-2 py-2 text-[11px] sm:px-3"
            style={{ gridTemplateColumns: `repeat(${n}, minmax(0, 1fr))` }}
          >
            {ranges.map((r, i) => {
              const caption = formatRangeCaption(r, i, ranges);
              const align = i === 0 ? "text-left" : i === n - 1 ? "text-right" : "text-center";
              return (
                <div key={i} className={`min-w-0 px-0.5 font-semibold text-slate-800 sm:px-1 ${align}`}>
                  <span className="block truncate text-[10px] uppercase tracking-wide text-slate-500">{r.variant}</span>
                  {caption ? <span className="mt-0.5 block font-medium text-slate-600">{caption}</span> : null}
                </div>
              );
            })}
          </div>
        </div>

        <div className="pointer-events-none absolute -top-7 -translate-x-1/2" style={{ left: markerLeft }}>
          <div className="flex flex-col items-center">
            <div className={`rounded-full border px-2 py-1 text-[11px] font-bold shadow-sm ${variantBubbleClass(variant)}`}>
              {bubbleText}
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
}
