"use client";

import type { FieldType } from "@prisma/client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import type { IncomingField, IncomingOutput } from "@/lib/admin-calculator-payload";
import {
  buildContentHtmlFromBlocks,
  newContentBlockId,
  parseContentHtmlToBlocks,
  type ContentBlock,
} from "@/lib/calculator-content-blocks";
import type { CalculatorCategory } from "@/lib/categories";
import type { UnitPresetListItem } from "@/lib/unit-preset-types";

type AdminRow = {
  id: string;
  slug: string;
  name: string;
  description: string;
  formulaPlain: string;
  category: string;
  imageUrl: string | null;
  contentHtml: string | null;
  showOnHome: boolean;
  outputs: unknown;
  validationExpr: string | null;
  validationMessage: string | null;
  fields: {
    key: string;
    label: string;
    fieldType: FieldType;
    min: number | null;
    max: number | null;
    step: number;
    defaultValue: number;
    sortOrder: number;
    selectOptions: unknown;
    unitOptions: unknown;
  }[];
};

function createBmiSampleContentBlocks(): ContentBlock[] {
  return [
    {
      id: newContentBlockId(),
      heading: "Interpretation table",
      content: `<table>
  <thead><tr><th>Category</th><th>BMI range (kg/m²)</th></tr></thead>
  <tbody>
    <tr><td>Underweight</td><td>&lt; 18.5</td></tr>
    <tr><td>Normal</td><td>18.5 - 24.9</td></tr>
    <tr><td>Overweight</td><td>25.0 - 29.9</td></tr>
    <tr><td>Obese</td><td>≥ 30.0</td></tr>
  </tbody>
</table>`,
    },
    {
      id: newContentBlockId(),
      heading: "What is BMI?",
      content:
        "Body Mass Index (BMI) is a simple screening measure based on weight and height. It helps classify weight status but does not directly measure body fat.",
    },
    {
      id: newContentBlockId(),
      heading: "Formula used",
      content: "<p><code>BMI = weight (kg) / [height (m)]²</code></p>",
    },
    {
      id: newContentBlockId(),
      heading: "How to use",
      content:
        "1) Enter your height and weight.\n2) Select preferred units.\n3) Review the indicator and category.\n4) Use the result as a screening guide, not a diagnosis.",
    },
    {
      id: newContentBlockId(),
      heading: "Clinical significance",
      content:
        "BMI is used in public health and clinical triage to flag potential nutrition and cardiometabolic risk. Interpretation should be combined with history, body composition, and clinical examination.",
    },
    {
      id: newContentBlockId(),
      heading: "Disclaimer",
      content:
        "This calculator is for educational screening only and does not replace professional medical advice, diagnosis, or treatment.",
    },
  ];
}

function mapRowToForm(row: AdminRow) {
  return {
    slug: row.slug,
    name: row.name,
    description: row.description,
    formulaPlain: row.formulaPlain,
    category: row.category,
    imageUrl: row.imageUrl ?? "",
    contentHtml: row.contentHtml ?? "",
    showOnHome: row.showOnHome ?? false,
    outputs: row.outputs as IncomingOutput[],
    validationExpr: row.validationExpr,
    validationMessage: row.validationMessage,
    fields: row.fields.map((f) => ({
      key: f.key,
      label: f.label,
      fieldType: f.fieldType === "SELECT" ? ("SELECT" as const) : ("NUMBER" as const),
      min: f.min,
      max: f.max,
      step: f.step,
      defaultValue: f.defaultValue,
      sortOrder: f.sortOrder,
      selectOptions: (f.selectOptions as { label: string; value: number }[] | null) ?? null,
      unitOptions:
        (f.unitOptions as {
          key: string;
          label: string;
          suffix?: string;
          mul: number;
          add?: number;
          min?: number;
          max?: number;
        }[] | null) ?? null,
    })),
  };
}

const defaultFormWithoutCategory = {
  slug: "",
  name: "",
  description: "",
  formulaPlain: "",
  imageUrl: "",
  contentHtml: "",
  outputs: [{ label: "Result", unit: "", formula: "", decimals: 1 }] as IncomingOutput[],
  fields: [
    {
      key: "x",
      label: "X",
      fieldType: "NUMBER" as const,
      min: 0,
      max: 100,
      step: 1,
      defaultValue: 1,
      sortOrder: 0,
      selectOptions: null as { label: string; value: number }[] | null,
      unitOptions: null,
    },
  ] as IncomingField[],
  validationExpr: null as string | null,
  validationMessage: null as string | null,
  showOnHome: false,
};

function defaultFormForCategories(categoryList: CalculatorCategory[]) {
  return {
    ...defaultFormWithoutCategory,
    category: categoryList[0]?.slug ?? "",
  };
}

type Props = {
  mode: "create" | "edit";
  calculatorId?: string;
  initialRow?: AdminRow | null;
  categoryList: CalculatorCategory[];
  unitPresets: UnitPresetListItem[];
};

export function CalculatorAdminForm({ mode, calculatorId, initialRow, categoryList, unitPresets }: Props) {
  const router = useRouter();
  const [form, setForm] = useState(() =>
    initialRow ? mapRowToForm(initialRow) : defaultFormForCategories(categoryList),
  );
  const [contentBlocks, setContentBlocks] = useState<ContentBlock[]>(() =>
    parseContentHtmlToBlocks(initialRow?.contentHtml ?? defaultFormWithoutCategory.contentHtml),
  );
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  const applyContentBlocks = (blocks: ContentBlock[]) => {
    setContentBlocks(blocks);
    setForm((f) => ({ ...f, contentHtml: buildContentHtmlFromBlocks(blocks) }));
  };

  const updateContentBlock = (id: string, patch: Partial<Pick<ContentBlock, "heading" | "content">>) => {
    setContentBlocks((prev) => {
      const next = prev.map((b) => (b.id === id ? { ...b, ...patch } : b));
      setForm((f) => ({ ...f, contentHtml: buildContentHtmlFromBlocks(next) }));
      return next;
    });
  };

  const addContentBlock = () => {
    setContentBlocks((prev) => {
      const next = [...prev, { id: newContentBlockId(), heading: "", content: "" }];
      setForm((f) => ({ ...f, contentHtml: buildContentHtmlFromBlocks(next) }));
      return next;
    });
  };

  const removeContentBlock = (blockId: string) => {
    setContentBlocks((prev) => {
      const next = prev.filter((b) => b.id !== blockId);
      setForm((f) => ({ ...f, contentHtml: buildContentHtmlFromBlocks(next) }));
      return next;
    });
  };

  async function onPickImage(ev: React.ChangeEvent<HTMLInputElement>) {
    const file = ev.target.files?.[0];
    ev.target.value = "";
    if (!file) {
      return;
    }
    setError(null);
    setUploading(true);
    const fd = new FormData();
    fd.append("file", file);
    const res = await fetch("/api/admin/upload-calculator-image", { method: "POST", body: fd });
    const data = (await res.json()) as { url?: string; error?: string };
    setUploading(false);
    if (!res.ok) {
      setError(data.error ?? "Image upload failed.");
      return;
    }
    if (data.url) {
      setForm((f) => ({ ...f, imageUrl: data.url! }));
    }
  }

  const setOutput = (index: number, patch: Partial<IncomingOutput>) => {
    setForm((f) => ({
      ...f,
      outputs: f.outputs.map((o, i) => (i === index ? { ...o, ...patch } : o)),
    }));
  };

  const addOutput = () => {
    setForm((f) => ({
      ...f,
      outputs: [...f.outputs, { label: "Result", unit: "", formula: "", decimals: 1 }],
    }));
  };

  const removeOutput = (index: number) => {
    setForm((f) => ({
      ...f,
      outputs: f.outputs.filter((_, i) => i !== index),
    }));
  };

  const setField = (index: number, patch: Partial<IncomingField>) => {
    setForm((f) => ({
      ...f,
      fields: f.fields.map((fld, i) => (i === index ? { ...fld, ...patch } : fld)),
    }));
  };

  const addField = () => {
    setForm((f) => ({
      ...f,
      fields: [
        ...f.fields,
        {
          key: `field_${f.fields.length + 1}`,
          label: "New field",
          fieldType: "NUMBER",
          min: 0,
          max: 100,
          step: 1,
          defaultValue: 0,
          sortOrder: f.fields.length,
          selectOptions: null,
          unitOptions: null,
        },
      ],
    }));
  };

  const removeField = (index: number) => {
    setForm((f) => ({
      ...f,
      fields: f.fields.filter((_, i) => i !== index),
    }));
  };

  const addSelectOption = (fieldIndex: number) => {
    setForm((f) => {
      const fields = f.fields.map((fld, i) => {
        if (i !== fieldIndex) {
          return fld;
        }
        const opts = [...(fld.selectOptions ?? []), { label: "Option", value: 0 }];
        return { ...fld, selectOptions: opts };
      });
      return { ...f, fields };
    });
  };

  const setSelectOption = (fieldIndex: number, optIndex: number, patch: { label?: string; value?: number }) => {
    setForm((f) => {
      const fields = f.fields.map((fld, i) => {
        if (i !== fieldIndex) {
          return fld;
        }
        const opts = (fld.selectOptions ?? []).map((o, j) => (j === optIndex ? { ...o, ...patch } : o));
        return { ...fld, selectOptions: opts };
      });
      return { ...f, fields };
    });
  };

  const removeSelectOption = (fieldIndex: number, optIndex: number) => {
    setForm((f) => {
      const fields = f.fields.map((fld, i) => {
        if (i !== fieldIndex) {
          return fld;
        }
        const opts = (fld.selectOptions ?? []).filter((_, j) => j !== optIndex);
        return { ...fld, selectOptions: opts };
      });
      return { ...f, fields };
    });
  };

  const addUnitOption = (fieldIndex: number) => {
    setForm((f) => {
      const fields = f.fields.map((fld, i) => {
        if (i !== fieldIndex || fld.fieldType !== "NUMBER") {
          return fld;
        }
        const opts = [
          ...(fld.unitOptions ?? []),
          { key: `u${(fld.unitOptions?.length ?? 0) + 1}`, label: "Unit", suffix: "", mul: 1 },
        ];
        return { ...fld, unitOptions: opts };
      });
      return { ...f, fields };
    });
  };

  const setUnitOption = (
    fieldIndex: number,
    optIndex: number,
    patch: {
      key?: string;
      label?: string;
      suffix?: string;
      mul?: number;
      add?: number;
      min?: number;
      max?: number;
    },
  ) => {
    setForm((f) => {
      const fields = f.fields.map((fld, i) => {
        if (i !== fieldIndex || fld.fieldType !== "NUMBER") {
          return fld;
        }
        const opts = (fld.unitOptions ?? []).map((o, j) => (j === optIndex ? { ...o, ...patch } : o));
        return { ...fld, unitOptions: opts };
      });
      return { ...f, fields };
    });
  };

  const removeUnitOption = (fieldIndex: number, optIndex: number) => {
    setForm((f) => {
      const fields = f.fields.map((fld, i) => {
        if (i !== fieldIndex || fld.fieldType !== "NUMBER") {
          return fld;
        }
        const opts = (fld.unitOptions ?? []).filter((_, j) => j !== optIndex);
        return { ...fld, unitOptions: opts };
      });
      return { ...f, fields };
    });
  };

  async function submit() {
    setError(null);
    setSaving(true);
    const payload = {
      slug: form.slug.trim(),
      name: form.name.trim(),
      description: form.description.trim(),
      formulaPlain: form.formulaPlain.trim(),
      category: form.category,
      imageUrl: form.imageUrl.trim() || null,
      contentHtml: form.contentHtml.trim() || null,
      showOnHome: form.showOnHome,
      outputs: form.outputs.map((o) => ({
        label: o.label.trim(),
        unit: o.unit.trim(),
        formula: o.formula.trim(),
        guidance: o.guidance?.trim() || undefined,
        limitations: o.limitations?.trim() || undefined,
        decimals: o.decimals,
        ranges: o.ranges,
      })),
      fields: form.fields.map((fld, idx) => ({
        key: fld.key.trim(),
        label: fld.label.trim(),
        fieldType: fld.fieldType,
        min: fld.fieldType === "NUMBER" ? fld.min : null,
        max: fld.fieldType === "NUMBER" ? fld.max : null,
        step: fld.step,
        defaultValue: fld.defaultValue,
        sortOrder: idx,
        selectOptions: fld.fieldType === "SELECT" ? fld.selectOptions : null,
        unitOptions: fld.fieldType === "NUMBER" ? (fld.unitOptions ?? null) : null,
      })),
      validationExpr: form.validationExpr?.trim() || null,
      validationMessage: form.validationMessage?.trim() || null,
    };

    const url = mode === "create" ? "/api/admin/calculators" : `/api/admin/calculators/${calculatorId}`;
    const method = mode === "create" ? "POST" : "PUT";
    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const data = (await res.json()) as { error?: string };
    setSaving(false);
    if (!res.ok) {
      setError(data.error ?? "Save failed.");
      return;
    }
    router.push("/admin/calculators");
    router.refresh();
  }

  return (
    <div className="space-y-8">
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block sm:col-span-2">
          <span className="mb-1 block text-sm font-semibold text-slate-700">Slug (URL)</span>
          <input
            value={form.slug}
            onChange={(e) => setForm((f) => ({ ...f, slug: e.target.value }))}
            className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm shadow-sm"
            placeholder="e.g. my-calculator"
          />
        </label>
        <label className="block sm:col-span-2">
          <span className="mb-1 block text-sm font-semibold text-slate-700">Name</span>
          <input
            value={form.name}
            onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
            className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm shadow-sm"
          />
        </label>
        <label className="block sm:col-span-2">
          <span className="mb-1 block text-sm font-semibold text-slate-700">Description</span>
          <textarea
            value={form.description}
            onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
            rows={3}
            className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm shadow-sm"
          />
        </label>
        <label className="block sm:col-span-2">
          <span className="mb-1 block text-sm font-semibold text-slate-700">Formula (display text)</span>
          <input
            value={form.formulaPlain}
            onChange={(e) => setForm((f) => ({ ...f, formulaPlain: e.target.value }))}
            className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm shadow-sm"
            placeholder="Shown under the title, e.g. BMI = kg / m²"
          />
        </label>

        <div className="block sm:col-span-2 rounded-xl border border-slate-200 bg-slate-50/70 p-4">
          <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
            <div>
              <span className="block text-sm font-semibold text-slate-700">Calculator page content</span>
              <p className="mt-1 text-xs text-slate-500">
                Add sections with a heading and body. For tables or other markup, paste HTML in the content field. No fixed
                section names.
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={addContentBlock}
                className="rounded-lg border border-teal-600 bg-teal-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-teal-700"
              >
                + Add section
              </button>
              <button
                type="button"
                onClick={() => applyContentBlocks(createBmiSampleContentBlocks())}
                className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50"
              >
                Use BMI sample sections
              </button>
            </div>
          </div>

          <div className="space-y-4">
            {contentBlocks.length === 0 ? (
              <p className="text-sm text-slate-500">No sections yet. Click &ldquo;Add section&rdquo;.</p>
            ) : (
              contentBlocks.map((block, idx) => (
                <div key={block.id} className="rounded-lg border border-slate-200 bg-white p-3 shadow-sm">
                  <div className="mb-2 flex items-center justify-between gap-2">
                    <span className="text-xs font-semibold text-slate-500">Section {idx + 1}</span>
                    <button
                      type="button"
                      onClick={() => removeContentBlock(block.id)}
                      className="text-xs font-semibold text-red-600 hover:text-red-800"
                    >
                      Remove
                    </button>
                  </div>
                  <label className="block">
                    <span className="mb-1 block text-xs font-semibold text-slate-600">Heading</span>
                    <input
                      value={block.heading}
                      onChange={(e) => updateContentBlock(block.id, { heading: e.target.value })}
                      className="w-full rounded-lg border border-slate-300 px-2 py-1.5 text-sm"
                      placeholder="e.g. Clinical significance"
                    />
                  </label>
                  <label className="mt-2 block">
                    <span className="mb-1 block text-xs font-semibold text-slate-600">Content</span>
                    <textarea
                      value={block.content}
                      onChange={(e) => updateContentBlock(block.id, { content: e.target.value })}
                      rows={5}
                      className="w-full rounded-lg border border-slate-300 px-2 py-1.5 font-mono text-sm"
                      placeholder="Plain text (blank line = new paragraph) or HTML"
                    />
                  </label>
                </div>
              ))
            )}
          </div>

          <label className="mt-3 block">
            <span className="mb-1 block text-xs font-semibold text-slate-600">Advanced HTML (full page block)</span>
            <textarea
              value={form.contentHtml}
              onChange={(e) => setForm((f) => ({ ...f, contentHtml: e.target.value }))}
              rows={6}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 font-mono text-xs shadow-sm"
            />
            <span className="mt-1 block text-[11px] text-slate-400">
              Editing here does not update the section list above until you reload the page.
            </span>
          </label>
        </div>

        <label className="block">
          <span className="mb-1 block text-sm font-semibold text-slate-700">Category</span>
          {categoryList.length === 0 ? (
            <p className="rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-900">
              No categories in the database.{" "}
              <Link href="/admin/categories" className="font-semibold underline hover:no-underline">
                Add a category first
              </Link>
              .
            </p>
          ) : (
            <select
              value={form.category}
              onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}
              className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm shadow-sm"
            >
              {categoryList.map((c) => (
                <option key={c.slug} value={c.slug}>
                  {c.name}
                </option>
              ))}
            </select>
          )}
        </label>

        <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-slate-200 bg-slate-50/80 px-4 py-3 sm:col-span-2">
          <input
            type="checkbox"
            checked={form.showOnHome}
            onChange={(e) => setForm((f) => ({ ...f, showOnHome: e.target.checked }))}
            className="mt-1 h-4 w-4 rounded border-slate-300 text-sky-600 focus:ring-sky-500"
          />
          <span>
            <span className="block text-sm font-semibold text-slate-800">Show on home page</span>
            <span className="block text-xs text-slate-500">
              Appears in the public home &ldquo;Featured calculators&rdquo; section.
            </span>
          </span>
        </label>

        <div className="sm:col-span-2">
          <span className="mb-1 block text-sm font-semibold text-slate-700">Card image (optional)</span>
          <p className="mb-2 text-xs text-slate-500">
            Shown on listing cards. Paste an https image URL, or upload a file (stored under{" "}
            <code className="rounded bg-slate-100 px-1">/calculator-images/</code> — works on servers with a writable
            disk; use a URL on read-only hosts like Vercel).
          </p>
          <input
            type="text"
            value={form.imageUrl}
            onChange={(e) => setForm((f) => ({ ...f, imageUrl: e.target.value }))}
            className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm shadow-sm"
            placeholder="https://… or /calculator-images/…"
          />
          <div className="mt-2 flex flex-wrap items-center gap-3">
            <label className="inline-flex cursor-pointer items-center rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-semibold text-slate-700 shadow-sm hover:bg-slate-50">
              <input type="file" accept="image/jpeg,image/png,image/webp,image/gif" className="hidden" onChange={onPickImage} disabled={uploading} />
              {uploading ? "Uploading…" : "Upload image"}
            </label>
            {form.imageUrl.trim() ? (
              <button
                type="button"
                onClick={() => setForm((f) => ({ ...f, imageUrl: "" }))}
                className="text-sm font-semibold text-red-600 hover:text-red-800"
              >
                Remove image
              </button>
            ) : null}
          </div>
          {form.imageUrl.trim() ? (
            <div className="mt-3 overflow-hidden rounded-xl border border-slate-200 bg-slate-50">
              <img
                src={form.imageUrl.trim()}
                alt="Preview"
                className="mx-auto max-h-40 w-auto object-contain"
              />
            </div>
          ) : null}
        </div>
      </div>

      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex items-center justify-between gap-4">
          <h2 className="text-lg font-bold text-slate-900">Output lines</h2>
          <button type="button" onClick={addOutput} className="text-sm font-semibold text-sky-700 hover:text-sky-900">
            + Add output
          </button>
        </div>
        <p className="mt-1 text-xs text-slate-500">
          Each line is one numeric result. Use field keys as variables (e.g. <code className="rounded bg-slate-100 px-1">weight_kg</code>
          ). Operators: + − * / ^, comparisons, ternary <code className="rounded bg-slate-100 px-1">? :</code>, and{" "}
          <code className="rounded bg-slate-100 px-1">sqrt</code>, <code className="rounded bg-slate-100 px-1">log</code>,{" "}
          <code className="rounded bg-slate-100 px-1">log10</code>, <code className="rounded bg-slate-100 px-1">max</code>,{" "}
          <code className="rounded bg-slate-100 px-1">min</code>, <code className="rounded bg-slate-100 px-1">abs</code>.
        </p>
        <div className="mt-4 space-y-4">
          {form.outputs.map((o, i) => (
            <div key={i} className="rounded-xl border border-slate-100 bg-slate-50/80 p-4">
              <div className="mb-2 flex justify-end">
                {form.outputs.length > 1 ? (
                  <button type="button" onClick={() => removeOutput(i)} className="text-xs font-semibold text-red-600">
                    Remove
                  </button>
                ) : null}
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <label className="block">
                  <span className="mb-1 block text-xs font-semibold text-slate-600">Label</span>
                  <input
                    value={o.label}
                    onChange={(e) => setOutput(i, { label: e.target.value })}
                    className="w-full rounded-lg border border-slate-300 px-2 py-1.5 text-sm"
                  />
                </label>
                <label className="block">
                  <span className="mb-1 block text-xs font-semibold text-slate-600">Unit</span>
                  <input
                    value={o.unit}
                    onChange={(e) => setOutput(i, { unit: e.target.value })}
                    className="w-full rounded-lg border border-slate-300 px-2 py-1.5 text-sm"
                    placeholder="e.g. kg, ml/min"
                  />
                </label>
                <label className="block sm:col-span-2">
                  <span className="mb-1 block text-xs font-semibold text-slate-600">Expression</span>
                  <textarea
                    value={o.formula}
                    onChange={(e) => setOutput(i, { formula: e.target.value })}
                    rows={2}
                    className="w-full rounded-lg border border-slate-300 px-2 py-1.5 font-mono text-sm"
                  />
                </label>
                <label className="block">
                  <span className="mb-1 block text-xs font-semibold text-slate-600">Decimal places</span>
                  <input
                    type="number"
                    min={0}
                    max={8}
                    value={o.decimals ?? 1}
                    onChange={(e) => setOutput(i, { decimals: Number(e.target.value) })}
                    className="w-full rounded-lg border border-slate-300 px-2 py-1.5 text-sm"
                  />
                </label>
                <label className="block sm:col-span-2">
                  <span className="mb-1 block text-xs font-semibold text-slate-600">
                    Default health guidance (optional)
                  </span>
                  <textarea
                    value={o.guidance ?? ""}
                    onChange={(e) => setOutput(i, { guidance: e.target.value })}
                    rows={2}
                    className="w-full rounded-lg border border-slate-300 px-2 py-1.5 text-sm"
                    placeholder="Used for calculators without ranges, or when no range guidance is matched."
                  />
                </label>
                <label className="block sm:col-span-2">
                  <span className="mb-1 block text-xs font-semibold text-slate-600">
                    Limitations (optional)
                  </span>
                  <textarea
                    value={o.limitations ?? ""}
                    onChange={(e) => setOutput(i, { limitations: e.target.value })}
                    rows={2}
                    className="w-full rounded-lg border border-slate-300 px-2 py-1.5 text-sm"
                    placeholder="Shown on the right-side limitations card."
                  />
                </label>

                <label className="block sm:col-span-2">
                  <span className="mb-1 block text-xs font-semibold text-slate-600">
                    Severity ranges (JSON, optional)
                  </span>
                  <textarea
                    value={JSON.stringify(o.ranges ?? [], null, 2)}
                    onChange={(e) => {
                      try {
                        const parsed = JSON.parse(e.target.value || "[]") as unknown;
                        if (!Array.isArray(parsed)) {
                          setError("Ranges must be a JSON array.");
                          return;
                        }
                        setError(null);
                        setOutput(i, { ranges: parsed as any });
                      } catch {
                        setError("Ranges JSON is invalid.");
                      }
                    }}
                    rows={4}
                    className="w-full rounded-lg border border-slate-300 px-2 py-1.5 font-mono text-sm"
                    placeholder='[{"max": 24.9, "variant": "good", "guidance": "Normal range guidance"}, {"min": 25, "max": 29.9, "variant": "warning", "guidance": "Overweight guidance"}, {"min": 30, "variant": "severe", "guidance": "Obesity guidance"}]'
                  />
                </label>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex items-center justify-between gap-4">
          <h2 className="text-lg font-bold text-slate-900">Input fields</h2>
          <button type="button" onClick={addField} className="text-sm font-semibold text-sky-700 hover:text-sky-900">
            + Add field
          </button>
        </div>
        <p className="mt-1 text-xs text-slate-500">
          <strong>Key</strong> must be a valid identifier and match variables in formulas. For dropdowns, choose Select and add numeric option values (e.g. Male = 1, Female = 0).
        </p>
        <div className="mt-4 space-y-6">
          {form.fields.map((fld, i) => (
            <div key={i} className="rounded-xl border border-slate-100 bg-slate-50/80 p-4">
              <div className="mb-3 flex justify-end">
                {form.fields.length > 1 ? (
                  <button type="button" onClick={() => removeField(i)} className="text-xs font-semibold text-red-600">
                    Remove field
                  </button>
                ) : null}
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <label className="block">
                  <span className="mb-1 block text-xs font-semibold text-slate-600">Key</span>
                  <input
                    value={fld.key}
                    onChange={(e) => setField(i, { key: e.target.value })}
                    className="w-full rounded-lg border border-slate-300 px-2 py-1.5 font-mono text-sm"
                  />
                </label>
                <label className="block">
                  <span className="mb-1 block text-xs font-semibold text-slate-600">Label</span>
                  <input
                    value={fld.label}
                    onChange={(e) => setField(i, { label: e.target.value })}
                    className="w-full rounded-lg border border-slate-300 px-2 py-1.5 text-sm"
                  />
                </label>
                <label className="block">
                  <span className="mb-1 block text-xs font-semibold text-slate-600">Type</span>
                  <select
                    value={fld.fieldType}
                    onChange={(e) =>
                      setField(i, {
                        fieldType: e.target.value === "SELECT" ? "SELECT" : "NUMBER",
                        selectOptions: e.target.value === "SELECT" ? fld.selectOptions ?? [{ label: "A", value: 0 }] : null,
                      })
                    }
                    className="w-full rounded-lg border border-slate-300 px-2 py-1.5 text-sm"
                  >
                    <option value="NUMBER">Number</option>
                    <option value="SELECT">Select</option>
                  </select>
                </label>
                <label className="block">
                  <span className="mb-1 block text-xs font-semibold text-slate-600">Default value</span>
                  <input
                    type="number"
                    step="any"
                    value={fld.defaultValue}
                    onChange={(e) => setField(i, { defaultValue: Number(e.target.value) })}
                    className="w-full rounded-lg border border-slate-300 px-2 py-1.5 text-sm"
                  />
                </label>
                {fld.fieldType === "NUMBER" ? (
                  <>
                    <label className="block">
                      <span className="mb-1 block text-xs font-semibold text-slate-600">Min</span>
                      <input
                        type="number"
                        step="any"
                        value={fld.min ?? ""}
                        onChange={(e) =>
                          setField(i, { min: e.target.value === "" ? null : Number(e.target.value) })
                        }
                        className="w-full rounded-lg border border-slate-300 px-2 py-1.5 text-sm"
                      />
                    </label>
                    <label className="block">
                      <span className="mb-1 block text-xs font-semibold text-slate-600">Max</span>
                      <input
                        type="number"
                        step="any"
                        value={fld.max ?? ""}
                        onChange={(e) =>
                          setField(i, { max: e.target.value === "" ? null : Number(e.target.value) })
                        }
                        className="w-full rounded-lg border border-slate-300 px-2 py-1.5 text-sm"
                      />
                    </label>
                    <label className="block">
                      <span className="mb-1 block text-xs font-semibold text-slate-600">Step</span>
                      <input
                        type="number"
                        step="any"
                        value={fld.step}
                        onChange={(e) => setField(i, { step: Number(e.target.value) })}
                        className="w-full rounded-lg border border-slate-300 px-2 py-1.5 text-sm"
                      />
                    </label>

                    <label className="block sm:col-span-2">
                      <span className="mb-1 block text-xs font-semibold text-slate-600">Unit preset (library)</span>
                      <p className="mb-1.5 text-[11px] leading-relaxed text-slate-500">
                        Manage presets under{" "}
                        <Link href="/admin/unit-presets" className="font-semibold text-sky-700 hover:underline">
                          Unit presets
                        </Link>
                        . Choosing one here copies its units into this field (you can still edit the JSON below).
                      </p>
                      <select
                        className="w-full rounded-lg border border-slate-300 bg-white px-2 py-1.5 text-sm"
                        defaultValue=""
                        onChange={(e) => {
                          const id = e.target.value;
                          e.currentTarget.selectedIndex = 0;
                          if (!id) {
                            return;
                          }
                          const preset = unitPresets.find((p) => p.id === id);
                          if (!preset || preset.options.length < 2) {
                            return;
                          }
                          setError(null);
                          setField(i, { unitOptions: preset.options.map((o) => ({ ...o })) });
                        }}
                      >
                        <option value="">— Load saved units into this field —</option>
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
                          onClick={() => addUnitOption(i)}
                          className="text-xs font-semibold text-sky-700 hover:text-sky-900"
                        >
                          + Add unit
                        </button>
                      </div>
                      <p className="mb-2 text-[11px] leading-relaxed text-slate-500">
                        Set conversion and per-unit limits. Stored formula value is{" "}
                        <code className="rounded bg-slate-100 px-1">{"(x + add) * mul"}</code>.
                      </p>
                      <div className="space-y-2">
                        {(fld.unitOptions ?? []).map((opt, unitIdx) => (
                          <div key={unitIdx} className="grid gap-2 rounded-lg border border-slate-200 bg-white p-2 sm:grid-cols-12">
                            <label className="sm:col-span-2">
                              <span className="mb-1 block text-[10px] font-semibold uppercase tracking-wide text-slate-500">Key</span>
                              <input
                                value={opt.key}
                                onChange={(e) => setUnitOption(i, unitIdx, { key: e.target.value })}
                                className="w-full rounded-md border border-slate-300 px-2 py-1 text-xs font-mono"
                                placeholder="cm"
                              />
                            </label>
                            <label className="sm:col-span-2">
                              <span className="mb-1 block text-[10px] font-semibold uppercase tracking-wide text-slate-500">Label</span>
                              <input
                                value={opt.label}
                                onChange={(e) => setUnitOption(i, unitIdx, { label: e.target.value })}
                                className="w-full rounded-md border border-slate-300 px-2 py-1 text-xs"
                                placeholder="Centimeters"
                              />
                            </label>
                            <label className="sm:col-span-2">
                              <span className="mb-1 block text-[10px] font-semibold uppercase tracking-wide text-slate-500">Suffix</span>
                              <input
                                value={opt.suffix ?? ""}
                                onChange={(e) => setUnitOption(i, unitIdx, { suffix: e.target.value })}
                                className="w-full rounded-md border border-slate-300 px-2 py-1 text-xs"
                                placeholder="cm"
                              />
                            </label>
                            <label className="sm:col-span-2">
                              <span className="mb-1 block text-[10px] font-semibold uppercase tracking-wide text-slate-500">mul</span>
                              <input
                                type="number"
                                step="any"
                                value={opt.mul}
                                onChange={(e) => setUnitOption(i, unitIdx, { mul: Number(e.target.value) })}
                                className="w-full rounded-md border border-slate-300 px-2 py-1 text-xs"
                              />
                            </label>
                            <label className="sm:col-span-2">
                              <span className="mb-1 block text-[10px] font-semibold uppercase tracking-wide text-slate-500">min</span>
                              <input
                                type="number"
                                step="any"
                                value={opt.min ?? ""}
                                onChange={(e) =>
                                  setUnitOption(i, unitIdx, {
                                    min: e.target.value === "" ? undefined : Number(e.target.value),
                                  })
                                }
                                className="w-full rounded-md border border-slate-300 px-2 py-1 text-xs"
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
                                  setUnitOption(i, unitIdx, {
                                    max: e.target.value === "" ? undefined : Number(e.target.value),
                                  })
                                }
                                className="w-full rounded-md border border-slate-300 px-2 py-1 text-xs"
                                placeholder="optional"
                              />
                            </label>
                            <div className="flex items-end justify-end sm:col-span-1">
                              <button
                                type="button"
                                onClick={() => removeUnitOption(i, unitIdx)}
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
                  <div className="sm:col-span-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-slate-600">Options</span>
                      <button
                        type="button"
                        onClick={() => addSelectOption(i)}
                        className="text-xs font-semibold text-sky-700"
                      >
                        + Option
                      </button>
                    </div>
                    <div className="mt-2 space-y-2">
                      {(fld.selectOptions ?? []).map((opt, j) => (
                        <div key={j} className="flex flex-wrap items-center gap-2">
                          <input
                            value={opt.label}
                            onChange={(e) => setSelectOption(i, j, { label: e.target.value })}
                            placeholder="Label"
                            className="min-w-[8rem] flex-1 rounded-lg border border-slate-300 px-2 py-1 text-sm"
                          />
                          <input
                            type="number"
                            step="any"
                            value={opt.value}
                            onChange={(e) => setSelectOption(i, j, { value: Number(e.target.value) })}
                            className="w-24 rounded-lg border border-slate-300 px-2 py-1 text-sm"
                          />
                          <button
                            type="button"
                            onClick={() => removeSelectOption(i, j)}
                            className="text-xs text-red-600"
                          >
                            ✕
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <h2 className="text-lg font-bold text-slate-900">Validation (optional)</h2>
        <p className="mt-1 text-xs text-slate-500">
          Expression must evaluate to true (non-zero) for inputs to be accepted. Same variables as formulas.
        </p>
        <label className="mt-3 block">
          <span className="mb-1 block text-xs font-semibold text-slate-600">Validation expression</span>
          <textarea
            value={form.validationExpr ?? ""}
            onChange={(e) => setForm((f) => ({ ...f, validationExpr: e.target.value || null }))}
            rows={2}
            className="w-full rounded-lg border border-slate-300 px-2 py-1.5 font-mono text-sm"
            placeholder="e.g. sbp > dbp"
          />
        </label>
        <label className="mt-3 block">
          <span className="mb-1 block text-xs font-semibold text-slate-600">Message when validation fails</span>
          <input
            value={form.validationMessage ?? ""}
            onChange={(e) => setForm((f) => ({ ...f, validationMessage: e.target.value || null }))}
            className="w-full rounded-lg border border-slate-300 px-2 py-1.5 text-sm"
          />
        </label>
      </section>

      {error ? <p className="text-sm font-medium text-red-600">{error}</p> : null}

      <div className="flex flex-wrap gap-3">
        <button
          type="button"
          onClick={() => void submit()}
          disabled={saving}
          className="rounded-xl bg-emerald-700 px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-emerald-800 disabled:opacity-60"
        >
          {saving ? "Saving…" : mode === "create" ? "Create calculator" : "Save changes"}
        </button>
        <Link
          href="/admin/calculators"
          className="rounded-xl border border-slate-300 bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 shadow-sm hover:bg-slate-50"
        >
          Cancel
        </Link>
      </div>
    </div>
  );
}
