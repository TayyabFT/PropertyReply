"use client";

type PaginationState = {
  page: number;
  totalPages: number;
  hasPrev: boolean;
  hasNext: boolean;
  total?: number;
  limit?: number;
};

function buildPageNumbers(current: number, total: number) {
  if (total <= 7) {
    return Array.from({ length: total }, (_, index) => index + 1);
  }

  const pages = new Set<number>([1, total, current, current - 1, current + 1]);
  return [...pages]
    .filter((page) => page >= 1 && page <= total)
    .sort((a, b) => a - b);
}

/** Numbered page buttons. Renders nothing when everything fits on one page. */
export default function Pagination({
  pagination,
  onChange,
  disabled = false,
}: {
  pagination: PaginationState | null | undefined;
  onChange: (page: number) => void;
  disabled?: boolean;
}) {
  if (!pagination || pagination.totalPages <= 1) return null;
  const { page, totalPages, hasPrev, hasNext, total, limit } = pagination;
  const pageNumbers = buildPageNumbers(page, totalPages);
  const range =
    total != null && limit != null
      ? `${(page - 1) * limit + 1}–${Math.min(page * limit, total)} of ${total.toLocaleString("en-GB")}`
      : null;

  return (
    <div className="pagination" aria-label="Pagination">
      {range && (
        <span className="muted" style={{ fontSize: ".8rem", marginRight: "8px" }}>
          {range}
        </span>
      )}
      <button
        type="button"
        className="pg-btn"
        aria-label="Previous page"
        disabled={disabled || !hasPrev}
        onClick={() => onChange(page - 1)}
      >
        ‹
      </button>
      {pageNumbers.map((pageNumber, index) => {
        const prev = pageNumbers[index - 1];
        const showEllipsis = prev != null && pageNumber - prev > 1;

        return (
          <span key={pageNumber} style={{ display: "contents" }}>
            {showEllipsis && (
              <button type="button" className="pg-btn" disabled>
                …
              </button>
            )}
            <button
              type="button"
              className={page === pageNumber ? "pg-btn active" : "pg-btn"}
              aria-current={page === pageNumber ? "page" : undefined}
              disabled={disabled}
              onClick={() => onChange(pageNumber)}
            >
              {pageNumber}
            </button>
          </span>
        );
      })}
      <button
        type="button"
        className="pg-btn"
        aria-label="Next page"
        disabled={disabled || !hasNext}
        onClick={() => onChange(page + 1)}
      >
        ›
      </button>
    </div>
  );
}
