"use client";

type SiteSearchBarProps = {
  value: string;
  onChange: (value: string) => void;
  onSubmit: () => void;
  placeholder?: string;
  /** Extra classes on the outer shell (e.g. `max-w-2xl w-full`) */
  className?: string;
  inputId?: string;
  buttonLabel?: string;
  /** `hero` = bright pill on gradient (homepage). `surface` = bordered card for light pages. */
  variant?: "hero" | "surface";
  /** `surface` only: omit horizontal centering so the bar stays left-aligned in its container. */
  align?: "left" | "center";
};

/**
 * Search control (icon + input + gradient button). Styling matches context via `variant`.
 */
export function SiteSearchBar({
  value,
  onChange,
  onSubmit,
  placeholder = "Search calculators...",
  className = "",
  inputId = "site-search",
  buttonLabel = "Search",
  variant = "surface",
  align = "center",
}: SiteSearchBarProps) {
  const surfaceShell =
    "flex w-full items-center gap-3 rounded-full border border-slate-200/90 bg-white px-4 py-2 shadow-sm transition-all focus-within:border-sky-300/70 focus-within:shadow-md focus-within:ring-4 focus-within:ring-sky-500/[0.12] sm:px-5 sm:py-2.5";

  const shell =
    variant === "hero"
      ? "mx-auto flex w-full max-w-xl items-center gap-2 rounded-full bg-white px-5 py-2 shadow-lg transition-shadow focus-within:shadow-xl"
      : align === "left"
        ? surfaceShell
        : `mx-auto ${surfaceShell}`;

  const iconClass =
    variant === "hero"
      ? "h-4 w-4 shrink-0 text-slate-400"
      : "h-[1.125rem] w-[1.125rem] shrink-0 text-sky-600/80 sm:h-5 sm:w-5";

  const inputClass =
    variant === "hero"
      ? "flex-1 bg-transparent py-2 text-sm text-slate-700 outline-none placeholder:text-slate-400"
      : "min-w-0 flex-1 bg-transparent py-2 text-sm text-slate-800 outline-none placeholder:text-slate-400 sm:text-[0.9375rem]";

  const buttonClass =
    "shrink-0 rounded-full px-4 py-2 text-sm font-semibold text-white transition hover:opacity-92 active:scale-[0.98] sm:px-5";

  return (
    <div className={`${shell} ${className}`.trim()}>
      <svg
        className={iconClass}
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden
      >
        <circle cx="11" cy="11" r="7" />
        <path d="m16.5 16.5 3.5 3.5" />
      </svg>
      <input
        id={inputId}
        type="search"
        name="q"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            e.preventDefault();
            onSubmit();
          }
        }}
        placeholder={placeholder}
        className={inputClass}
        autoComplete="off"
        enterKeyHint="search"
        aria-label={placeholder}
      />
      <button
        type="button"
        onClick={onSubmit}
        className={buttonClass}
        style={{ background: "linear-gradient(135deg, #0d9488, #0284c7)" }}
      >
        {buttonLabel}
      </button>
    </div>
  );
}
