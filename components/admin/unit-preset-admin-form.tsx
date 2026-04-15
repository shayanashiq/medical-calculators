"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import type { UnitPresetOption } from "@/lib/unit-preset-types";

type Props = {
  mode: "create" | "edit";
  presetId?: string;
  initial?: { slug: string; name: string; description: string | null; options: UnitPresetOption[] };
};

export function UnitPresetAdminForm({ mode, presetId, initial }: Props) {
  const router = useRouter();
  const [slug, setSlug] = useState(initial?.slug ?? "");
  const [name, setName] = useState(initial?.name ?? "");
  const [description, setDescription] = useState(initial?.description ?? "");
  const [options, setOptions] = useState<UnitPresetOption[]>(
    initial?.options?.length
      ? initial.options
      : [
          { key: "cm", label: "Centimeters", suffix: "cm", mul: 1 },
          { key: "in", label: "Inches", suffix: "in", mul: 2.54 },
        ],
  );
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const setOpt = (index: number, patch: Partial<UnitPresetOption>) => {
    setOptions((rows) => rows.map((r, i) => (i === index ? { ...r, ...patch } : r)));
  };

  const addOption = () => {
    setOptions((rows) => [...rows, { key: `u${rows.length + 1}`, label: "Unit", mul: 1 }]);
  };

  const removeOption = (index: number) => {
    setOptions((rows) => rows.filter((_, i) => i !== index));
  };

  async function submit() {
    setSaving(true);
    setError(null);
    const trimmed = options
      .map((o) => ({
        key: o.key.trim(),
        label: o.label.trim(),
        suffix: o.suffix?.trim() ? o.suffix.trim() : undefined,
        mul: o.mul,
        add: typeof o.add === "number" && Number.isFinite(o.add) ? o.add : undefined,
        min: typeof o.min === "number" && Number.isFinite(o.min) ? o.min : undefined,
        max: typeof o.max === "number" && Number.isFinite(o.max) ? o.max : undefined,
      }))
      .filter((o) => o.key && o.label);

    const url = mode === "create" ? "/api/admin/unit-presets" : `/api/admin/unit-presets/${presetId}`;
    const res = await fetch(url, {
      method: mode === "create" ? "POST" : "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        slug: slug.trim(),
        name: name.trim(),
        description: description.trim() ? description.trim() : null,
        options: trimmed,
      }),
    });
    const data = (await res.json()) as { error?: string };
    setSaving(false);
    if (!res.ok) {
      setError(data.error ?? "Save failed.");
      return;
    }
    router.push("/admin/unit-presets");
    router.refresh();
  }

  return (
    <div className="space-y-6">
      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <h2 className="text-lg font-bold text-slate-900">Preset details</h2>
        <p className="mt-1 text-xs text-slate-500">
          Slug is used internally. Name is shown when picking a preset for a calculator field.
        </p>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <label className="block sm:col-span-2">
            <span className="mb-1 block text-xs font-semibold text-slate-600">Slug</span>
            <input
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
              className="w-full rounded-lg border border-slate-300 px-2 py-1.5 font-mono text-sm"
              placeholder="metric-length-cm"
            />
          </label>
          <label className="block sm:col-span-2">
            <span className="mb-1 block text-xs font-semibold text-slate-600">Display name</span>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full rounded-lg border border-slate-300 px-2 py-1.5 text-sm"
              placeholder="Length (stored as cm)"
            />
          </label>
          <label className="block sm:col-span-2">
            <span className="mb-1 block text-xs font-semibold text-slate-600">Description (optional)</span>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={2}
              className="w-full rounded-lg border border-slate-300 px-2 py-1.5 text-sm"
              placeholder="Used for height fields where formulas expect centimeters."
            />
          </label>
        </div>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-bold text-slate-900">Units &amp; conversion</h2>
            <p className="mt-1 max-w-2xl text-xs leading-relaxed text-slate-500">
              Stored value in formulas is <code className="rounded bg-slate-100 px-1">(what the user types + add) × mul</code>.
              Pick one reference unit (often <code className="rounded bg-slate-100 px-1">mul = 1</code>). For another unit, set{" "}
              <code className="rounded bg-slate-100 px-1">mul</code> to how many reference units correspond to{" "}
              <strong>one</strong> displayed unit (example: 1 inch = 2.54 cm → mul 2.54 when cm is the reference).
            </p>
          </div>
          <button type="button" onClick={addOption} className="text-sm font-semibold text-sky-700 hover:text-sky-900">
            + Add unit
          </button>
        </div>

        <div className="mt-4 space-y-3">
          {options.map((opt, i) => (
            <div
              key={i}
              className="grid gap-2 rounded-xl border border-slate-100 bg-slate-50/80 p-3 sm:grid-cols-12 sm:items-end"
            >
              <label className="sm:col-span-2">
                <span className="mb-1 block text-[10px] font-semibold uppercase tracking-wide text-slate-500">Key</span>
                <input
                  value={opt.key}
                  onChange={(e) => setOpt(i, { key: e.target.value })}
                  className="w-full rounded-lg border border-slate-300 px-2 py-1.5 font-mono text-sm"
                  placeholder="cm"
                />
              </label>
              <label className="sm:col-span-3">
                <span className="mb-1 block text-[10px] font-semibold uppercase tracking-wide text-slate-500">Label</span>
                <input
                  value={opt.label}
                  onChange={(e) => setOpt(i, { label: e.target.value })}
                  className="w-full rounded-lg border border-slate-300 px-2 py-1.5 text-sm"
                  placeholder="Centimeters"
                />
              </label>
              <label className="sm:col-span-2">
                <span className="mb-1 block text-[10px] font-semibold uppercase tracking-wide text-slate-500">Suffix</span>
                <input
                  value={opt.suffix ?? ""}
                  onChange={(e) => setOpt(i, { suffix: e.target.value || undefined })}
                  className="w-full rounded-lg border border-slate-300 px-2 py-1.5 text-sm"
                  placeholder="cm"
                />
              </label>
              <label className="sm:col-span-2">
                <span className="mb-1 block text-[10px] font-semibold uppercase tracking-wide text-slate-500">mul</span>
                <input
                  type="number"
                  step="any"
                  value={opt.mul}
                  onChange={(e) => setOpt(i, { mul: Number(e.target.value) })}
                  className="w-full rounded-lg border border-slate-300 px-2 py-1.5 text-sm"
                />
              </label>
              <label className="sm:col-span-1">
                <span className="mb-1 block text-[10px] font-semibold uppercase tracking-wide text-slate-500">add (rare)</span>
                <input
                  type="number"
                  step="any"
                  value={opt.add ?? ""}
                  onChange={(e) =>
                    setOpt(i, { add: e.target.value === "" ? undefined : Number(e.target.value) })
                  }
                  className="w-full rounded-lg border border-slate-300 px-2 py-1.5 text-sm"
                  placeholder="0"
                />
              </label>
              <label className="sm:col-span-1">
                <span className="mb-1 block text-[10px] font-semibold uppercase tracking-wide text-slate-500">min</span>
                <input
                  type="number"
                  step="any"
                  value={opt.min ?? ""}
                  onChange={(e) =>
                    setOpt(i, { min: e.target.value === "" ? undefined : Number(e.target.value) })
                  }
                  className="w-full rounded-lg border border-slate-300 px-2 py-1.5 text-sm"
                  placeholder="optional"
                />
              </label>
              <label className="sm:col-span-1">
                <span className="mb-1 block text-[10px] font-semibold uppercase tracking-wide text-slate-500">max</span>
                <input
                  type="number"
                  step="any"
                  value={opt.max ?? ""}
                  onChange={(e) =>
                    setOpt(i, { max: e.target.value === "" ? undefined : Number(e.target.value) })
                  }
                  className="w-full rounded-lg border border-slate-300 px-2 py-1.5 text-sm"
                  placeholder="optional"
                />
              </label>
              <div className="flex justify-end sm:col-span-2">
                {options.length > 2 ? (
                  <button
                    type="button"
                    onClick={() => removeOption(i)}
                    className="text-xs font-semibold text-red-600 hover:text-red-800"
                  >
                    Remove
                  </button>
                ) : null}
              </div>
            </div>
          ))}
        </div>
      </section>

      {error ? <p className="text-sm font-medium text-red-600">{error}</p> : null}

      <div className="flex flex-wrap gap-3">
        <button
          type="button"
          onClick={() => void submit()}
          disabled={saving}
          className="rounded-xl bg-emerald-700 px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-emerald-800 disabled:opacity-60"
        >
          {saving ? "Saving…" : mode === "create" ? "Create preset" : "Save changes"}
        </button>
        <Link
          href="/admin/unit-presets"
          className="rounded-xl border border-slate-300 bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 shadow-sm hover:bg-slate-50"
        >
          Cancel
        </Link>
      </div>
    </div>
  );
}
