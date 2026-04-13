"use client";

import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { SiteSearchBar } from "@/components/ui/site-search-bar";

type Props = {
  categorySlug: string;
  categoryName: string;
  initialQuery: string;
};

export function CategoryCalculatorsSearch({ categorySlug, categoryName, initialQuery }: Props) {
  const router = useRouter();
  const [q, setQ] = useState(initialQuery);

  useEffect(() => {
    setQ(initialQuery);
  }, [initialQuery]);

  const submit = useCallback(() => {
    const term = q.trim();
    const params = new URLSearchParams();
    if (term) {
      params.set("q", term);
    }
    const qs = params.toString();
    router.push(`/categories/${categorySlug}${qs ? `?${qs}` : ""}`);
  }, [categorySlug, q, router]);

  return (
    <SiteSearchBar
      variant="surface"
      value={q}
      onChange={setQ}
      onSubmit={submit}
      placeholder={`Search calculators in ${categoryName}…`}
      className="w-full max-w-3xl"
      inputId={`category-search-${categorySlug}`}
    />
  );
}
