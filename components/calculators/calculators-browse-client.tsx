"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { CalculatorTileCard } from "@/components/cards/calculator-tile-card";
import { SiteSearchBar } from "@/components/ui/site-search-bar";
import type { CalculatorListItem } from "@/lib/calculator-types";
import { calculatorCardGradients } from "@/lib/home-gradients";

const PAGE_SIZE = 12;

type Props = {
  initialItems: CalculatorListItem[];
  initialTotal: number;
  initialSearch?: string;
};

export function CalculatorsBrowseClient({ initialItems, initialTotal, initialSearch = "" }: Props) {
  const [q, setQ] = useState(initialSearch);
  const [debouncedQ, setDebouncedQ] = useState(() => initialSearch.trim());
  const [items, setItems] = useState<CalculatorListItem[]>(initialItems);
  const [total, setTotal] = useState(initialTotal);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const requestId = useRef(0);

  useEffect(() => {
    const t = setTimeout(() => setDebouncedQ(q.trim()), 320);
    return () => clearTimeout(t);
  }, [q]);

  const runSearch = useCallback(async (search: string) => {
    const id = ++requestId.current;
    setLoading(true);
    try {
      const params = new URLSearchParams({ skip: "0", take: String(PAGE_SIZE) });
      if (search) {
        params.set("q", search);
      }
      const res = await fetch(`/api/calculators?${params.toString()}`);
      const data = (await res.json()) as { items?: CalculatorListItem[]; total?: number };
      if (id !== requestId.current) {
        return;
      }
      setItems(data.items ?? []);
      setTotal(typeof data.total === "number" ? data.total : 0);
    } finally {
      if (id === requestId.current) {
        setLoading(false);
      }
    }
  }, []);

  const submitSearch = useCallback(() => {
    const term = q.trim();
    setDebouncedQ(term);
    void runSearch(term);
  }, [q, runSearch]);

  const serverSearchRef = useRef(initialSearch.trim());
  const skipInitialSearch = useRef(true);
  useEffect(() => {
    if (skipInitialSearch.current) {
      skipInitialSearch.current = false;
      if (debouncedQ === serverSearchRef.current) {
        return;
      }
    }
    void runSearch(debouncedQ);
  }, [debouncedQ, runSearch]);

  const hasMore = items.length < total;

  async function loadMore() {
    if (!hasMore || loadingMore) {
      return;
    }
    setLoadingMore(true);
    try {
      const params = new URLSearchParams({
        skip: String(items.length),
        take: String(PAGE_SIZE),
      });
      if (debouncedQ) {
        params.set("q", debouncedQ);
      }
      const res = await fetch(`/api/calculators?${params.toString()}`);
      const data = (await res.json()) as { items?: CalculatorListItem[]; total?: number };
      const next = data.items ?? [];
      setItems((prev) => [...prev, ...next]);
      if (typeof data.total === "number") {
        setTotal(data.total);
      }
    } finally {
      setLoadingMore(false);
    }
  }

  return (
    <div>
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">All calculators</h1>
          <p className="mt-1 text-sm text-slate-500">
            {loading ? (
              "Searching…"
            ) : debouncedQ ? (
              <>
                {total} match{total === 1 ? "" : "es"} for &ldquo;{debouncedQ}&rdquo;
              </>
            ) : (
              <>{total} calculator{total === 1 ? "" : "s"}</>
            )}
          </p>
        </div>
        <div className="w-full sm:max-w-xl sm:shrink-0">
          <SiteSearchBar
            variant="surface"
            value={q}
            onChange={setQ}
            onSubmit={submitSearch}
            placeholder="Search by name or description…"
            className="max-w-none"
            inputId="calculators-browse-search"
          />
        </div>
      </div>

      {debouncedQ && !loading && total === 0 ? (
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
        {items.map((item, idx) => (
          <CalculatorTileCard
            key={item.slug}
            calculator={item}
            gradientClass={calculatorCardGradients[idx % calculatorCardGradients.length]}
          />
        ))}
      </section>

      {hasMore ? (
        <div className="mt-10 flex justify-center">
          <button
            type="button"
            onClick={() => void loadMore()}
            disabled={loadingMore || loading}
            className="rounded-xl border border-slate-300 bg-white px-6 py-3 text-sm font-semibold text-slate-800 shadow-sm transition hover:border-sky-300 hover:bg-sky-50 disabled:opacity-50"
          >
            {loadingMore ? "Loading…" : `Show more (${Math.min(PAGE_SIZE, total - items.length)} more)`}
          </button>
        </div>
      ) : items.length > 0 ? (
        <p className="mt-10 text-center text-sm text-slate-400">You&apos;ve reached the end of the list.</p>
      ) : null}

      <p className="mt-8 text-sm">
        <Link href="/" className="font-semibold text-sky-700 hover:text-sky-900">
          ← Home
        </Link>
      </p>
    </div>
  );
}
