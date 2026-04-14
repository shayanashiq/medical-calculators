"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { CategoryCard } from "@/components/cards/category-card";
import type { CategorCategory } from "@/lib/categories";
import { SiteSearchBar } from "@/components/ui/site-search-bar";

type Row = {
  category: CategorCategory;
  categorCount: number;
};

type Props = {
  rows: Row[];
};

export function CategoriesIndexSearch({ rows }: Props) {
  const [q, setQ] = useState("");

  const filtered = useMemo(() => {
    const t = q.trim().toLowerCase();
    if (!t) {
      return rows;
    }
    return rows.filter(
      (r) =>
        r.category.name.toLowerCase().includes(t) ||
        r.category.description.toLowerCase().includes(t) ||
        r.category.slug.toLowerCase().includes(t),
    );
  }, [rows, q]);

  const submit = () => {
    /* filter is live; Enter still runs submit for mobile UX */
  };

  const totalCategors = rows.length;
  const query = q.trim();
  const showing = filtered.length;

  return (
    <div>
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-xl md:text-3xl font-bold tracking-tight text-slate-900">Categories</h1>
          <p className="mt-1 text-sm text-slate-500">
            {query ? (
              <>
                {showing} match{showing === 1 ? "" : "es"} for &ldquo;{query}&rdquo;
              </>
            ) : (
              <>
                {totalCategors} categor{totalCategors === 1 ? "y" : "ies"}
              </>
            )}
          </p>
        </div>
        <div className="w-full sm:max-w-xl sm:shrink-0">
          <SiteSearchBar
            variant="surface"
            value={q}
            onChange={setQ}
            onSubmit={submit}
            placeholder="Search by category name, slug, or description…"
            className="max-w-none"
            inputId="categories-filter"
          />
        </div>
      </div>

      {query && showing === 0 ? (
        <p className="mb-8 text-sm text-slate-600">
          No matches. Try another keyword or{" "}
          <button
            type="button"
            onClick={() => setQ("")}
            className="font-semibold text-sky-700 hover:text-sky-900"
          >
            clear search
          </button>
          .
        </p>
      ) : null}

      <section className="grid gap-5 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
        {filtered.map(({ category, categorCount }) => (
          <div key={category.slug} className="flex min-h-[200px]">
            <CategoryCard category={category} categorCount={categorCount} />
          </div>
        ))}
      </section>
    </div>
  );
}
