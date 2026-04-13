import Link from "next/link";

type PaginationBarProps = {
  page: number;
  totalPages: number;
  basePath: string;
  /** Extra query params to preserve (e.g. search). Page is added when &gt; 1. */
  query?: Record<string, string | undefined>;
};

function buildHref(basePath: string, page: number, query?: Record<string, string | undefined>) {
  const params = new URLSearchParams();
  if (query) {
    for (const [key, value] of Object.entries(query)) {
      if (value !== undefined && value !== "") {
        params.set(key, value);
      }
    }
  }
  if (page > 1) {
    params.set("page", String(page));
  }
  const qs = params.toString();
  return qs ? `${basePath}?${qs}` : basePath;
}

export function PaginationBar({ page, totalPages: pages, basePath, query }: PaginationBarProps) {
  if (pages <= 1) {
    return null;
  }

  const href = (p: number) => buildHref(basePath, p, query);

  const windowSize = 5;
  let start = Math.max(1, page - Math.floor(windowSize / 2));
  let end = Math.min(pages, start + windowSize - 1);
  start = Math.max(1, end - windowSize + 1);

  const nums: number[] = [];
  for (let i = start; i <= end; i += 1) {
    nums.push(i);
  }

  return (
    <nav
      className="mt-10 flex flex-wrap items-center justify-center gap-2 text-sm"
      aria-label="Pagination"
    >
      {page > 1 ? (
        <Link
          href={href(page - 1)}
          className="rounded-lg border border-slate-200 bg-white px-3 py-2 font-semibold text-slate-700 shadow-sm transition hover:border-sky-200 hover:text-sky-800"
        >
          Previous
        </Link>
      ) : (
        <span className="rounded-lg border border-transparent px-3 py-2 text-slate-300">Previous</span>
      )}

      <div className="flex flex-wrap items-center gap-1">
        {start > 1 ? (
          <>
            <Link
              href={href(1)}
              className="rounded-lg px-2.5 py-1.5 font-medium text-sky-700 hover:bg-sky-50"
            >
              1
            </Link>
            {start > 2 ? <span className="px-1 text-slate-400">…</span> : null}
          </>
        ) : null}

        {nums.map((n) =>
          n === page ? (
            <span
              key={n}
              className="rounded-lg bg-sky-700 px-2.5 py-1.5 font-semibold text-white"
              aria-current="page"
            >
              {n}
            </span>
          ) : (
            <Link
              key={n}
              href={href(n)}
              className="rounded-lg px-2.5 py-1.5 font-medium text-sky-700 hover:bg-sky-50"
            >
              {n}
            </Link>
          ),
        )}

        {end < pages ? (
          <>
            {end < pages - 1 ? <span className="px-1 text-slate-400">…</span> : null}
            <Link
              href={href(pages)}
              className="rounded-lg px-2.5 py-1.5 font-medium text-sky-700 hover:bg-sky-50"
            >
              {pages}
            </Link>
          </>
        ) : null}
      </div>

      {page < pages ? (
        <Link
          href={href(page + 1)}
          className="rounded-lg border border-slate-200 bg-white px-3 py-2 font-semibold text-slate-700 shadow-sm transition hover:border-sky-200 hover:text-sky-800"
        >
          Next
        </Link>
      ) : (
        <span className="rounded-lg border border-transparent px-3 py-2 text-slate-300">Next</span>
      )}
    </nav>
  );
}
