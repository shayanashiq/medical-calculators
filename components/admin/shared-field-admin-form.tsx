"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import type { SharedFieldListItem } from "@/lib/shared-field-types";
import type { UnitPresetListItem } from "@/lib/unit-preset-types";
import type { UnitPresetOption } from "@/lib/unit-preset-types";

type Props = {
  mode: "create" | "edit";
  fieldId?: string;
  unitPresets: UnitPresetListItem[];
  initial?: SharedFieldListItem;
};

type SelectOption = { label: string; value: number };

type FieldForm = {
  slug: string;
  key: string;
  label: string;
  fieldType: "NUMBER" | "SELECT";
  min: number | null;
  max: number | null;
  step: number;
  defaultValue: number;
  selectOptions: SelectOption[] | null;
  unitOptions: UnitPresetOption[] | null;
  unitPresetId: string | null;
  description: string;
};

function defaultForm(): FieldForm {
  return {
    slug: "",
    key: "",
    label: "",
    fieldType: "NUMBER",
    min: 0,
    max: 300,
    step: 1,
    defaultValue: 0,
    selectOptions: null,
    unitOptions: null,
    unitPresetId: null,
    description: "",
  };
}

function mapInitial(initial: SharedFieldListItem): FieldForm {
  return {
    slug: initial.slug,
    key: initial.key,
    label: initial.label,
    fieldType: initial.fieldType,
    min: initial.min,
    max: initial.max,
    step: initial.step,
    defaultValue: initial.defaultValue,
    selectOptions: initial.selectOptions,
    unitOptions: initial.unitOptions,
    unitPresetId: initial.unitPresetId,
    description: initial.description ?? "",
  };
}

export function SharedFieldAdminForm({ mode, fieldId, unitPresets, initial }: Props) {
  const router = useRouter();
  const [form, setForm] = useState<FieldForm>(initial ? mapInitial(initial) : defaultForm());
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  async function submit() {
    setSaving(true);
    setError(null);
    const payload = {
      slug: form.slug.trim(),
      key: form.key.trim(),
      label: form.label.trim(),
      fieldType: form.fieldType,
      min: form.fieldType === "NUMBER" ? form.min : null,
      max: form.fieldType === "NUMBER" ? form.max : null,
      step: form.step,
      defaultValue: form.defaultValue,
      selectOptions: form.fieldType === "SELECT" ? form.selectOptions : null,
      unitOptions: form.fieldType === "NUMBER" ? form.unitOptions : null,
      unitPresetId: form.fieldType === "NUMBER" ? form.unitPresetId : null,
      description: form.description.trim() || null,
    };
    const url = mode === "create" ? "/api/admin/shared-fields" : `/api/admin/shared-fields/${fieldId}`;
    const res = await fetch(url, {
      method: mode === "create" ? "POST" : "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const data = (await res.json()) as { error?: string };
    setSaving(false);
    if (!res.ok) {
      setError(data.error ?? "Save failed.");
      return;
    }
    router.push("/admin/shared-fields");
    router.refresh();
  }

  return (
    <div className="space-y-6">
      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <h2 className="text-lg font-bold text-slate-900">Field details</h2>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <label className="block">
            <span className="mb-1 block text-xs font-semibold text-slate-600">Slug</span>
            <input value={form.slug} onChange={(e) => setForm((f) => ({ ...f, slug: e.target.value }))} className="w-full rounded-lg border border-slate-300 px-2 py-1.5 text-sm font-mono" />
          </label>
          <label className="block">
            <span className="mb-1 block text-xs font-semibold text-slate-600">Field key</span>
            <input value={form.key} onChange={(e) => setForm((f) => ({ ...f, key: e.target.value }))} className="w-full rounded-lg border border-slate-300 px-2 py-1.5 text-sm font-mono" />
          </label>
          <label className="block">
            <span className="mb-1 block text-xs font-semibold text-slate-600">Label</span>
            <input value={form.label} onChange={(e) => setForm((f) => ({ ...f, label: e.target.value }))} className="w-full rounded-lg border border-slate-300 px-2 py-1.5 text-sm" />
          </label>
          <label className="block">
            <span className="mb-1 block text-xs font-semibold text-slate-600">Type</span>
            <select
              value={form.fieldType}
              onChange={(e) =>
                setForm((f) => ({
                  ...f,
                  fieldType: e.target.value === "SELECT" ? "SELECT" : "NUMBER",
                  selectOptions: e.target.value === "SELECT" ? f.selectOptions ?? [{ label: "Option", value: 0 }] : null,
                  unitPresetId: e.target.value === "SELECT" ? null : f.unitPresetId,
                }))
              }
              className="w-full rounded-lg border border-slate-300 px-2 py-1.5 text-sm"
            >
              <option value="NUMBER">Number</option>
              <option value="SELECT">Select</option>
            </select>
          </label>
          <label className="block sm:col-span-2">
            <span className="mb-1 block text-xs font-semibold text-slate-600">Description (optional)</span>
            <textarea value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} rows={2} className="w-full rounded-lg border border-slate-300 px-2 py-1.5 text-sm" />
          </label>
        </div>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <h2 className="text-lg font-bold text-slate-900">Input behavior</h2>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <label className="block">
            <span className="mb-1 block text-xs font-semibold text-slate-600">Default value</span>
            <input type="number" step="any" value={form.defaultValue} onChange={(e) => setForm((f) => ({ ...f, defaultValue: Number(e.target.value) }))} className="w-full rounded-lg border border-slate-300 px-2 py-1.5 text-sm" />
          </label>
          <label className="block">
            <span className="mb-1 block text-xs font-semibold text-slate-600">Step</span>
            <input type="number" step="any" value={form.step} onChange={(e) => setForm((f) => ({ ...f, step: Number(e.target.value) }))} className="w-full rounded-lg border border-slate-300 px-2 py-1.5 text-sm" />
          </label>
          {form.fieldType === "NUMBER" ? (
            <>
              <label className="block">
                <span className="mb-1 block text-xs font-semibold text-slate-600">Min</span>
                <input type="number" step="any" value={form.min ?? ""} onChange={(e) => setForm((f) => ({ ...f, min: e.target.value === "" ? null : Number(e.target.value) }))} className="w-full rounded-lg border border-slate-300 px-2 py-1.5 text-sm" />
              </label>
              <label className="block">
                <span className="mb-1 block text-xs font-semibold text-slate-600">Max</span>
                <input type="number" step="any" value={form.max ?? ""} onChange={(e) => setForm((f) => ({ ...f, max: e.target.value === "" ? null : Number(e.target.value) }))} className="w-full rounded-lg border border-slate-300 px-2 py-1.5 text-sm" />
              </label>
              <label className="block sm:col-span-2">
                <span className="mb-1 block text-xs font-semibold text-slate-600">Unit preset (optional)</span>
                <p className="mb-1 text-[11px] text-slate-500">
                  Reuse unit definitions from{" "}
                  <Link href="/admin/unit-presets" className="font-semibold text-sky-700 hover:underline">
                    Unit presets
                  </Link>
                  .
                </p>
                <select
                  className="w-full rounded-lg border border-slate-300 px-2 py-1.5 text-sm"
                  defaultValue=""
                  onChange={(e) => {
                    const id = e.target.value;
                    e.currentTarget.selectedIndex = 0;
                    if (!id) return;
                    const preset = unitPresets.find((p) => p.id === id);
                    if (!preset) return;
                    setForm((f) => ({
                      ...f,
                      unitPresetId: preset.id,
                      unitOptions: preset.options.map((o) => ({ ...o })),
                    }));
                  }}
                >
                  <option value="">— Load unit options from preset —</option>
                  {unitPresets.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name}
                    </option>
                  ))}
                </select>
              </label>

              <div className="block sm:col-span-2">
                <div className="flex items-center justify-between gap-2">
                  <span className="mb-1 block text-xs font-semibold text-slate-600">Unit options</span>
                  <button
                    type="button"
                    onClick={() =>
                      setForm((f) => ({
                        ...f,
                        unitOptions: [
                          ...(f.unitOptions ?? []),
                          { key: `u${(f.unitOptions?.length ?? 0) + 1}`, label: "Unit", suffix: "", mul: 1 },
                        ],
                      }))
                    }
                    className="text-xs font-semibold text-sky-700 hover:text-sky-900"
                  >
                    + Add unit
                  </button>
                </div>
                <p className="mb-2 text-[11px] leading-relaxed text-slate-500">
                  Stored formula value is <code className="rounded bg-slate-100 px-1">{"(x + add) * mul"}</code>.
                </p>
                <div className="space-y-2">
                  {(form.unitOptions ?? []).map((opt, unitIdx) => (
                    <div
                      key={unitIdx}
                      className="grid gap-2 rounded-lg border border-slate-200 bg-white p-2 sm:grid-cols-12"
                    >
                      <label className="sm:col-span-2">
                        <span className="mb-1 block text-[10px] font-semibold uppercase tracking-wide text-slate-500">
                          Key
                        </span>
                        <input
                          value={opt.key}
                          onChange={(e) =>
                            setForm((f) => ({
                              ...f,
                              unitOptions: (f.unitOptions ?? []).map((u, i) =>
                                i === unitIdx ? { ...u, key: e.target.value } : u,
                              ),
                            }))
                          }
                          className="w-full rounded-md border border-slate-300 px-2 py-1 text-xs font-mono"
                          placeholder="cm"
                        />
                      </label>
                      <label className="sm:col-span-2">
                        <span className="mb-1 block text-[10px] font-semibold uppercase tracking-wide text-slate-500">
                          Label
                        </span>
                        <input
                          value={opt.label}
                          onChange={(e) =>
                            setForm((f) => ({
                              ...f,
                              unitOptions: (f.unitOptions ?? []).map((u, i) =>
                                i === unitIdx ? { ...u, label: e.target.value } : u,
                              ),
                            }))
                          }
                          className="w-full rounded-md border border-slate-300 px-2 py-1 text-xs"
                          placeholder="Centimeters"
                        />
                      </label>
                      <label className="sm:col-span-2">
                        <span className="mb-1 block text-[10px] font-semibold uppercase tracking-wide text-slate-500">
                          Suffix
                        </span>
                        <input
                          value={opt.suffix ?? ""}
                          onChange={(e) =>
                            setForm((f) => ({
                              ...f,
                              unitOptions: (f.unitOptions ?? []).map((u, i) =>
                                i === unitIdx ? { ...u, suffix: e.target.value } : u,
                              ),
                            }))
                          }
                          className="w-full rounded-md border border-slate-300 px-2 py-1 text-xs"
                          placeholder="cm"
                        />
                      </label>
                      <label className="sm:col-span-2">
                        <span className="mb-1 block text-[10px] font-semibold uppercase tracking-wide text-slate-500">
                          mul
                        </span>
                        <input
                          type="number"
                          step="any"
                          value={opt.mul}
                          onChange={(e) =>
                            setForm((f) => ({
                              ...f,
                              unitOptions: (f.unitOptions ?? []).map((u, i) =>
                                i === unitIdx ? { ...u, mul: Number(e.target.value) } : u,
                              ),
                            }))
                          }
                          className="w-full rounded-md border border-slate-300 px-2 py-1 text-xs"
                        />
                      </label>
                      <label className="sm:col-span-2">
                        <span className="mb-1 block text-[10px] font-semibold uppercase tracking-wide text-slate-500">
                          min
                        </span>
                        <input
                          type="number"
                          step="any"
                          value={opt.min ?? ""}
                          onChange={(e) =>
                            setForm((f) => ({
                              ...f,
                              unitOptions: (f.unitOptions ?? []).map((u, i) =>
                                i === unitIdx
                                  ? { ...u, min: e.target.value === "" ? undefined : Number(e.target.value) }
                                  : u,
                              ),
                            }))
                          }
                          className="w-full rounded-md border border-slate-300 px-2 py-1 text-xs"
                          placeholder="optional"
                        />
                      </label>
                      <label className="sm:col-span-1">
                        <span className="mb-1 block text-[10px] font-semibold uppercase tracking-wide text-slate-500">
                          max
                        </span>
                        <input
                          type="number"
                          step="any"
                          value={opt.max ?? ""}
                          onChange={(e) =>
                            setForm((f) => ({
                              ...f,
                              unitOptions: (f.unitOptions ?? []).map((u, i) =>
                                i === unitIdx
                                  ? { ...u, max: e.target.value === "" ? undefined : Number(e.target.value) }
                                  : u,
                              ),
                            }))
                          }
                          className="w-full rounded-md border border-slate-300 px-2 py-1 text-xs"
                          placeholder="optional"
                        />
                      </label>
                      <div className="flex items-end justify-end sm:col-span-1">
                        <button
                          type="button"
                          onClick={() =>
                            setForm((f) => ({
                              ...f,
                              unitOptions: (f.unitOptions ?? []).filter((_, i) => i !== unitIdx),
                            }))
                          }
                          className="text-xs font-semibold text-red-600"
                        >
                          ✕
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </>
          ) : (
            <div className="sm:col-span-2 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-600">Select options</span>
                <button
                  type="button"
                  onClick={() =>
                    setForm((f) => ({ ...f, selectOptions: [...(f.selectOptions ?? []), { label: "Option", value: 0 }] }))
                  }
                  className="text-xs font-semibold text-sky-700"
                >
                  + Option
                </button>
              </div>
              {(form.selectOptions ?? []).map((opt, i) => (
                <div key={i} className="flex gap-2">
                  <input value={opt.label} onChange={(e) => setForm((f) => ({ ...f, selectOptions: (f.selectOptions ?? []).map((o, j) => j === i ? { ...o, label: e.target.value } : o) }))} className="flex-1 rounded-lg border border-slate-300 px-2 py-1.5 text-sm" />
                  <input type="number" step="any" value={opt.value} onChange={(e) => setForm((f) => ({ ...f, selectOptions: (f.selectOptions ?? []).map((o, j) => j === i ? { ...o, value: Number(e.target.value) } : o) }))} className="w-28 rounded-lg border border-slate-300 px-2 py-1.5 text-sm" />
                  <button type="button" onClick={() => setForm((f) => ({ ...f, selectOptions: (f.selectOptions ?? []).filter((_, j) => j !== i) }))} className="text-xs font-semibold text-red-600">Remove</button>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {error ? <p className="text-sm font-medium text-red-600">{error}</p> : null}

      <div className="flex gap-3">
        <button type="button" onClick={() => void submit()} disabled={saving} className="rounded-xl bg-emerald-700 px-5 py-2.5 text-sm font-semibold text-white hover:bg-emerald-800 disabled:opacity-60">
          {saving ? "Saving…" : mode === "create" ? "Create field" : "Save changes"}
        </button>
        <Link href="/admin/shared-fields" className="rounded-xl border border-slate-300 bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50">
          Cancel
        </Link>
      </div>
    </div>
  );
}
