"use client";

import { useRouter } from "next/navigation";
import { useCallback, useState } from "react";
import { SiteSearchBar } from "@/components/ui/site-search-bar";

export function HeroSearchBar() {
  const router = useRouter();
  const [query, setQuery] = useState("");

  const submit = useCallback(() => {
    const q = query.trim();
    if (!q) {
      router.push("/calculators");
      return;
    }
    router.push(`/calculators?q=${encodeURIComponent(q)}`);
  }, [query, router]);

  return (
    <SiteSearchBar
      variant="hero"
      value={query}
      onChange={setQuery}
      onSubmit={submit}
      placeholder="Search calculators... (e.g., BMI, calorie, pregnancy)"
      inputId="hero-search"
    />
  );
}
