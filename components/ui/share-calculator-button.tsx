"use client";

import { useCallback, useState } from "react";

export function ShareCalculatorButton() {
  const [copied, setCopied] = useState(false);

  const share = useCallback(async () => {
    const url = window.location.href;
    const title = document.title || "Calculator";

    try {
      if (navigator.share) {
        await navigator.share({ title, url });
        return;
      }
    } catch {
      // ignore and fallback to clipboard
    }

    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1400);
    } catch {
      // last resort: prompt
      window.prompt("Copy this link:", url);
    }
  }, []);

  return (
    <button
      type="button"
      onClick={() => void share()}
      className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-br from-teal-600 via-cyan-600 to-sky-600 px-4 py-2.5 text-sm font-semibold text-white shadow-md shadow-teal-900/20 transition hover:brightness-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300/60 focus-visible:ring-offset-2 cursor-pointer"
    >
      <svg viewBox="0 0 24 24" className="h-4 w-4 shrink-0" fill="none" stroke="currentColor" strokeWidth={2} aria-hidden>
        <circle cx="18" cy="5" r="3" />
        <circle cx="6" cy="12" r="3" />
        <circle cx="18" cy="19" r="3" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M8.59 13.51l6.83 3.98M15.41 6.51l-6.82 3.98" />
      </svg>
      {copied ? "Copied" : "Share"}
    </button>
  );
}

