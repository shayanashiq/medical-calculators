"use client";

import { useCallback, useMemo, useRef, useState } from "react";

function normalizeToken(t: string) {
  return t.trim().replace(/\s+/g, " ");
}

function splitTokens(raw: string): string[] {
  return raw
    .split(/[,\n]+/g)
    .map(normalizeToken)
    .filter(Boolean);
}

type Props = {
  label: string;
  hint?: string;
  placeholder?: string;
  value: string[];
  onChange: (next: string[]) => void;
  max?: number;
};

export function KeywordChipsInput({ label, hint, placeholder, value, onChange, max = 60 }: Props) {
  const [draft, setDraft] = useState("");
  const inputRef = useRef<HTMLInputElement | null>(null);

  const chips = useMemo(() => {
    const out: string[] = [];
    const seen = new Set<string>();
    for (const v of value) {
      if (typeof v !== "string") continue;
      const t = normalizeToken(v);
      if (!t) continue;
      const k = t.toLowerCase();
      if (seen.has(k)) continue;
      seen.add(k);
      out.push(t);
      if (out.length >= max) break;
    }
    return out;
  }, [max, value]);

  const canAddMore = chips.length < max;

  const addTokens = useCallback(
    (raw: string) => {
      const tokens = splitTokens(raw);
      if (tokens.length === 0) return;

      const next = [...chips];
      const seen = new Set(next.map((t) => t.toLowerCase()));
      for (const token of tokens) {
        if (next.length >= max) break;
        const k = token.toLowerCase();
        if (seen.has(k)) continue;
        seen.add(k);
        next.push(token);
      }
      onChange(next);
    },
    [chips, max, onChange],
  );

  const removeChip = useCallback(
    (chip: string) => {
      const k = chip.toLowerCase();
      onChange(chips.filter((c) => c.toLowerCase() !== k));
    },
    [chips, onChange],
  );

  const commitDraft = useCallback(() => {
    const t = draft.trim();
    if (!t) return;
    addTokens(t);
    setDraft("");
  }, [addTokens, draft]);

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <div className="text-sm font-semibold text-slate-900">{label}</div>
          {hint ? <div className="mt-0.5 text-xs text-slate-500">{hint}</div> : null}
        </div>
        <div className="text-xs font-semibold text-slate-500">
          {chips.length}/{max}
        </div>
      </div>

      <div className="mt-3 flex flex-wrap gap-2">
        {chips.length === 0 ? (
          <div className="text-sm text-slate-500">No keywords yet.</div>
        ) : (
          chips.map((chip) => (
            <span
              key={chip}
              className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-sm text-slate-700"
            >
              <span className="max-w-[18rem] truncate" title={chip}>
                {chip}
              </span>
              <button
                type="button"
                onClick={() => removeChip(chip)}
                className="rounded-full px-1 text-slate-400 hover:text-red-600"
                aria-label={`Remove ${chip}`}
              >
                ✕
              </button>
            </span>
          ))
        )}
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-2">
        <input
          ref={inputRef}
          value={draft}
          onChange={(e) => {
            const v = e.target.value;
            if (v.includes(",") || v.includes("\n")) {
              const parts = splitTokens(v);
              if (parts.length > 0) {
                addTokens(parts.join("\n"));
                setDraft("");
                return;
              }
            }
            setDraft(v);
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              commitDraft();
            }
          }}
          onBlur={() => {
            // Friendly: don't lose user input
            commitDraft();
          }}
          placeholder={placeholder ?? "Type a keyword and press Enter (or use commas)…"}
          className="min-w-[16rem] flex-1 rounded-xl border border-slate-300 px-3 py-2 text-sm shadow-sm disabled:opacity-60"
          disabled={!canAddMore}
        />
        <button
          type="button"
          onClick={() => commitDraft()}
          disabled={!draft.trim() || !canAddMore}
          className="rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm hover:bg-slate-50 disabled:opacity-50"
        >
          Add
        </button>
        <button
          type="button"
          onClick={() => {
            onChange([]);
            setDraft("");
            inputRef.current?.focus();
          }}
          disabled={chips.length === 0}
          className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-500 hover:bg-slate-50 disabled:opacity-50"
        >
          Clear
        </button>
      </div>
    </div>
  );
}

