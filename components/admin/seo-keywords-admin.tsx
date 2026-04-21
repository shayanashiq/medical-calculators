"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { KeywordChipsInput } from "@/components/admin/keyword-chips-input";

type Row = {
  id: string;
  slug: string;
  name: string;
  category: string;
  updatedAt: string | Date;
  seo: unknown;
};

function toList(raw: unknown): string[] {
  if (!Array.isArray(raw)) return [];
  return raw.filter((v) => typeof v === "string").map((s) => s.trim()).filter(Boolean);
}

function parseSeo(raw: unknown): { specific: string[]; problems: string[]; promos: string[] } {
  if (!raw || typeof raw !== "object") return { specific: [], problems: [], promos: [] };
  const r = raw as Record<string, unknown>;
  return {
    specific: toList(r.specific),
    problems: toList(r.problems),
    promos: toList(r.promos),
  };
}

export function SeoKeywordsAdmin({ calculators }: { calculators: Row[] }) {
  const [q, setQ] = useState("");
  const [selectedId, setSelectedId] = useState<string>(() => calculators[0]?.id ?? "");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [savedAt, setSavedAt] = useState<string | null>(null);

  const filtered = useMemo(() => {
    const term = q.trim().toLowerCase();
    if (!term) return calculators;
    return calculators.filter((c) => {
      return (
        c.name.toLowerCase().includes(term) ||
        c.slug.toLowerCase().includes(term) ||
        c.category.toLowerCase().includes(term)
      );
    });
  }, [calculators, q]);

  const selected = useMemo(() => {
    return calculators.find((c) => c.id === selectedId) ?? filtered[0] ?? calculators[0] ?? null;
  }, [calculators, filtered, selectedId]);

  const initialSeo = useMemo(() => parseSeo(selected?.seo), [selected?.seo]);
  const [specific, setSpecific] = useState<string[]>(() => initialSeo.specific);
  const [problems, setProblems] = useState<string[]>(() => initialSeo.problems);
  const [promos, setPromos] = useState<string[]>(() => initialSeo.promos);

  // When selection changes, reset local state.
  useEffect(() => {
    setSpecific(initialSeo.specific);
    setProblems(initialSeo.problems);
    setPromos(initialSeo.promos);
    setError(null);
    setSavedAt(null);
  }, [selectedId]);

  async function save() {
    if (!selected) return;
    setSaving(true);
    setError(null);
    setSavedAt(null);
    try {
      const res = await fetch(`/api/admin/calculators/${selected.id}/seo`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ seo: { specific, problems, promos } }),
      });
      const data = (await res.json()) as { error?: string };
      if (!res.ok) {
        setError(data.error ?? "Save failed.");
        return;
      }
      setSavedAt(new Date().toLocaleString());
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[20rem_1fr]">
      <aside className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="flex items-center justify-between gap-2">
          <div className="text-sm font-semibold text-slate-900">Calculators</div>
          <div className="text-xs font-semibold text-slate-500">{filtered.length}</div>
        </div>
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search name, slug, category…"
          className="mt-3 w-full rounded-xl border border-slate-300 px-3 py-2 text-sm shadow-sm"
        />
        <div className="mt-3 max-h-[28rem] overflow-auto rounded-xl border border-slate-100">
          {filtered.length === 0 ? (
            <div className="p-3 text-sm text-slate-500">No matches.</div>
          ) : (
            <ul className="divide-y divide-slate-100">
              {filtered.map((c) => {
                const active = selected?.id === c.id;
                return (
                  <li key={c.id}>
                    <button
                      type="button"
                      onClick={() => setSelectedId(c.id)}
                      className={`w-full px-3 py-2 text-left text-sm transition ${
                        active ? "bg-sky-50 text-slate-900" : "hover:bg-slate-50 text-slate-700"
                      }`}
                    >
                      <div className="font-semibold">{c.name}</div>
                      <div className="mt-0.5 flex flex-wrap gap-x-2 text-xs text-slate-500">
                        <span className="font-mono">{c.slug}</span>
                        <span>·</span>
                        <span>{c.category}</span>
                      </div>
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </aside>

      <section className="space-y-6">
        {selected ? (
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <h2 className="text-lg font-bold text-slate-900">{selected.name}</h2>
                <p className="mt-1 text-sm text-slate-600">
                  <span className="font-mono text-xs">{selected.slug}</span> · {selected.category}
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <Link
                  href={`/calculators/${selected.slug}`}
                  className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                  target="_blank"
                >
                  View page
                </Link>
                <Link
                  href={`/admin/calculators/${selected.id}/edit`}
                  className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                >
                  Edit calculator
                </Link>
              </div>
            </div>
          </div>
        ) : (
          <div className="rounded-2xl border border-slate-200 bg-white p-5 text-sm text-slate-600 shadow-sm">
            Select a calculator to edit SEO keywords.
          </div>
        )}

        <KeywordChipsInput
          label="Calculator-specific keywords"
          hint="Your “money keywords” (Enter or comma to create a chip)."
          value={specific}
          onChange={setSpecific}
          placeholder="e.g. bmi calculator online, bmi formula calculator"
        />
        <KeywordChipsInput
          label="Problem-based keywords"
          hint="High-intent searches (how/ideal/should I…)."
          value={problems}
          onChange={setProblems}
          placeholder="e.g. how to calculate bmr"
        />
        <KeywordChipsInput
          label="Best / Free / Online keywords"
          hint="Easy wins and modifiers."
          value={promos}
          onChange={setPromos}
          placeholder="e.g. free clinical calculators for students"
        />

        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={() => void save()}
            disabled={!selected || saving}
            className="rounded-xl bg-emerald-700 px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-emerald-800 disabled:opacity-60"
          >
            {saving ? "Saving…" : "Save SEO keywords"}
          </button>
          {savedAt ? <div className="text-sm text-slate-500">Saved {savedAt}</div> : null}
          {error ? <div className="text-sm font-semibold text-red-600">{error}</div> : null}
        </div>
      </section>
    </div>
  );
}

