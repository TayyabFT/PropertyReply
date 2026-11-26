"use client";

import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import { useAuth } from "@/lib/auth";
import { ApiRequestError, type Pagination } from "@/lib/api";

export function errorMessage(err: unknown, fallback: string) {
  return err instanceof ApiRequestError ? err.message : fallback;
}

/** Page frame shared by every admin page. */
export function AdminPage({
  title,
  description,
  actions,
  children,
}: {
  title: string;
  description?: string;
  actions?: ReactNode;
  children: ReactNode;
}) {
  return (
    <section className="section section-alt" id="admin">
      <div className="container">
        <div className="flex-between mb-32" style={{ flexWrap: "wrap", gap: "12px" }}>
          <div>
            <div className="tag mb-8">Admin</div>
            <h2>{title}</h2>
            {description && (
              <p className="muted" style={{ marginTop: "6px", maxWidth: "720px" }}>
                {description}
              </p>
            )}
          </div>
          {actions && <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>{actions}</div>}
        </div>
        {children}
      </div>
    </section>
  );
}

/** Short-lived confirmation message in the corner of the screen. */
export function useToast() {
  const [toast, setToast] = useState<string | null>(null);
  const showToast = useCallback((message: string) => {
    setToast(message);
    window.setTimeout(() => setToast(null), 3000);
  }, []);

  const toastElement = toast ? (
    <div
      role="status"
      style={{
        position: "fixed",
        top: "20px",
        right: "20px",
        zIndex: 1000,
        background: "var(--ink, #0f172a)",
        color: "#fff",
        padding: "12px 18px",
        borderRadius: "var(--radius)",
        boxShadow: "0 8px 24px rgba(0,0,0,.2)",
        maxWidth: "320px",
        fontSize: ".85rem",
      }}
    >
      {toast}
    </div>
  ) : null;

  return { showToast, toastElement };
}

/**
 * Loads one page of a server-paged list. Changing `filterKey` (e.g. search
 * text) goes back to page 1; `reload()` refetches the current page.
 */
export function usePagedList<T>(
  load: (token: string, page: number) => Promise<{ data: T[]; pagination: Pagination }>,
  filterKey = "",
) {
  const { token } = useAuth();
  const [page, setPage] = useState(1);
  const [items, setItems] = useState<T[]>([]);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);
  const loadRef = useRef(load);
  loadRef.current = load;
  const filterRef = useRef(filterKey);

  useEffect(() => {
    if (!token) return;
    if (filterRef.current !== filterKey) {
      filterRef.current = filterKey;
      if (page !== 1) {
        setPage(1);
        return;
      }
    }
    let cancelled = false;
    setLoading(true);
    setError(null);
    loadRef.current(token, page)
      .then((res) => {
        if (cancelled) return;
        // Removing the last row on the last page: step back a page
        if (res.data.length === 0 && page > 1) {
          setPage(page - 1);
          return;
        }
        setItems(res.data);
        setPagination(res.pagination);
      })
      .catch((err) => {
        if (!cancelled) setError(errorMessage(err, "Failed to load data."));
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [token, page, filterKey, reloadKey]);

  const reload = useCallback(() => setReloadKey((key) => key + 1), []);

  return { items, setItems, pagination, page, setPage, loading, error, reload };
}

export function ListState({
  loading,
  error,
  empty,
  emptyText,
}: {
  loading: boolean;
  error: string | null;
  empty: boolean;
  emptyText: string;
}) {
  if (error) return <p className="alert alert-error" role="alert">{error}</p>;
  if (loading && empty) return <p className="muted">Loading…</p>;
  if (empty) return <p className="muted">{emptyText}</p>;
  return null;
}
