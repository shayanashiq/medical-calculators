"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export function NewCategoryForm() {
  const router = useRouter();
  const [slug, setSlug] = useState("");
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [sortOrder, setSortOrder] = useState("0");
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSaving(true);
    const res = await fetch("/api/admin/categories", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        slug: slug.trim(),
        name: name.trim(),
        description: description.trim(),
        sortOrder: sortOrder.trim() === "" ? 0 : Number(sortOrder),
      }),
    });
    const data = (await res.json()) as { error?: string };
    setSaving(false);
    if (!res.ok) {
      setError(data.error ?? "Save failed.");
      return;
    }
    setSlug("");
    setName("");
    setDescription("");
    setSortOrder("0");
    router.refresh();
  }

  return (
    <form
      onSubmit={(e) => void submit(e)}
      className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
    >
      <h2 className="text-lg font-bold text-slate-900">Add category</h2>
      <p className="mt-1 text-sm text-slate-500">
        Slug appears in URLs (<code className="rounded bg-slate-100 px-1">/categories/your-slug</code>). Use
        lowercase letters, numbers, and hyphens.
      </p>
      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        <label className="block sm:col-span-1">
          <span className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-500">Slug</span>
          <input
            value={slug}
            onChange={(e) => setSlug(e.target.value)}
            className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm shadow-sm"
            placeholder="e.g. nutrition"
            required
          />
        </label>
        <label className="block sm:col-span-1">
          <span className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-500">Sort order</span>
          <input
            type="number"
            value={sortOrder}
            onChange={(e) => setSortOrder(e.target.value)}
            className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm shadow-sm"
          />
        </label>
        <label className="block sm:col-span-2">
          <span className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-500">Name</span>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm shadow-sm"
            required
          />
        </label>
        <label className="block sm:col-span-2">
          <span className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-500">Description</span>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm shadow-sm"
            required
          />
        </label>
      </div>
      {error ? <p className="mt-3 text-sm font-medium text-rose-600">{error}</p> : null}
      <button
        type="submit"
        disabled={saving}
        className="mt-4 rounded-xl bg-emerald-700 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-emerald-800 disabled:opacity-50"
      >
        {saving ? "Saving…" : "Create category"}
      </button>
    </form>
  );
}
