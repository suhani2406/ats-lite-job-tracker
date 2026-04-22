import { CaretLeft, CaretRight } from "@phosphor-icons/react";

export default function Pagination({ page, totalPages, total, onChange }) {
  if (totalPages <= 1) return null;

  // Show compact page numbers: first, last, current neighbors
  const pages = [];
  for (let i = 1; i <= totalPages; i++) {
    if (i === 1 || i === totalPages || Math.abs(i - page) <= 1) {
      pages.push(i);
    } else if (pages[pages.length - 1] !== "…") {
      pages.push("…");
    }
  }

  return (
    <div
      className="mt-10 flex flex-col sm:flex-row gap-4 items-center justify-between"
      data-testid="pagination"
    >
      <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
        Page {page} of {totalPages} · {total} total
      </p>
      <div className="flex items-center gap-1">
        <PageButton
          disabled={page <= 1}
          onClick={() => onChange(page - 1)}
          testId="pagination-prev"
        >
          <CaretLeft size={14} />
        </PageButton>
        {pages.map((p, idx) =>
          p === "…" ? (
            <span
              key={`ellipsis-${idx}`}
              className="px-2 text-sm text-muted-foreground"
            >
              …
            </span>
          ) : (
            <button
              key={p}
              onClick={() => onChange(p)}
              data-testid={`pagination-page-${p}`}
              className={[
                "h-9 min-w-9 px-3 rounded-md text-sm font-medium border transition-colors",
                p === page
                  ? "bg-primary text-primary-foreground border-primary"
                  : "bg-card text-foreground border-border hover:border-muted-foreground/40",
              ].join(" ")}
            >
              {p}
            </button>
          )
        )}
        <PageButton
          disabled={page >= totalPages}
          onClick={() => onChange(page + 1)}
          testId="pagination-next"
        >
          <CaretRight size={14} />
        </PageButton>
      </div>
    </div>
  );
}

function PageButton({ disabled, onClick, children, testId }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      data-testid={testId}
      className="h-9 w-9 rounded-md bg-card border border-border inline-flex items-center justify-center hover:border-muted-foreground/40 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
    >
      {children}
    </button>
  );
}
