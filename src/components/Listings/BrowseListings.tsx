"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth";
import {
  listingsApi,
  type ListingDetail,
  type ListingProperty,
  type ListingsData,
  type ListingsFilterOptions,
  type ListingsQuery,
  ApiRequestError,
} from "@/lib/api";
import PropertyCard from "./PropertyCard";
import ListingDetailModal from "./ListingDetailModal";

const defaultFilters: ListingsQuery = {
  location: "",
  propertyType: "",
  priceRange: "",
  minDiscount: "",
  strategy: "",
  bedrooms: "",
  sort: "newest",
  page: 1,
  limit: 6,
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

export default function BrowseListings() {
  const router = useRouter();
  const { token } = useAuth();

  const [filterOptions, setFilterOptions] =
    useState<ListingsFilterOptions | null>(null);
  const [draftFilters, setDraftFilters] =
    useState<ListingsQuery>(defaultFilters);
  const [appliedFilters, setAppliedFilters] =
    useState<ListingsQuery>(defaultFilters);
  const [listings, setListings] = useState<ListingsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [savingId, setSavingId] = useState<string | null>(null);
  const [detail, setDetail] = useState<ListingDetail | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);

  const loadListings = useCallback(
    async (query: ListingsQuery) => {
      if (!token) return;

      setLoading(true);
      setError(null);

      try {
        const response = await listingsApi.getListings(token, query);
        setListings(response.data);
      } catch (err) {
        const message =
          err instanceof ApiRequestError
            ? err.message
            : "Failed to load deals. Is the API running?";
        setError(message);
      } finally {
        setLoading(false);
      }
    },
    [token],
  );

  useEffect(() => {
    if (!token) return;

    const authToken = token;
    let cancelled = false;

    async function init() {
      try {
        const filtersResponse = await listingsApi.getFilters(authToken);
        if (!cancelled) {
          setFilterOptions(filtersResponse.data);
        }
      } catch {
        // Filter metadata is optional; list fetch surfaces hard errors.
      }
    }

    init();
    loadListings(appliedFilters);

    return () => {
      cancelled = true;
    };
  }, [token, appliedFilters, loadListings]);

  const applyFilters = () => {
    setAppliedFilters({ ...draftFilters, page: 1 });
  };

  const changeSort = (sort: string) => {
    const next = { ...appliedFilters, sort, page: 1 };
    setDraftFilters(next);
    setAppliedFilters(next);
  };

  const goToPage = (page: number) => {
    const next = { ...appliedFilters, page };
    setDraftFilters(next);
    setAppliedFilters(next);
  };

  const handleView = async (property: ListingProperty) => {
    if (!token || property.isLocked) return;

    setDetailLoading(true);
    try {
      const response = await listingsApi.getById(token, property.id);
      setDetail(response.data);
    } catch (err) {
      const message =
        err instanceof ApiRequestError
          ? err.message
          : "Unable to load deal details.";
      setError(message);
    } finally {
      setDetailLoading(false);
    }
  };

  const handleSave = async (property: ListingProperty) => {
    if (!token) return;

    setSavingId(property.id);
    try {
      if (property.isSaved) {
        await listingsApi.unsave(token, property.id);
      } else {
        await listingsApi.save(token, property.id);
      }
      await loadListings(appliedFilters);
    } catch (err) {
      const message =
        err instanceof ApiRequestError
          ? err.message
          : "Unable to update saved deal.";
      setError(message);
    } finally {
      setSavingId(null);
    }
  };

  const handleUnlock = () => {
    router.push("/app/membership");
  };

  if (loading && !listings) {
    return (
      <section className="section section-alt" id="listings">
        <div className="container">
          <div className="page-head">
            <h1>Browse Deals</h1>
            <p>Loading available properties…</p>
          </div>
        </div>
      </section>
    );
  }

  const summaryText = listings?.summary.summaryText ?? "Loading deals…";
  const lastUpdated = listings?.summary.lastUpdated ?? "";
  const currentSort = appliedFilters.sort || "newest";
  const pageNumbers = listings
    ? buildPageNumbers(
        listings.pagination.page,
        listings.pagination.totalPages,
      )
    : [];

  return (
    <section className="section section-alt" id="listings">
      <div className="container">
        <div className="listings-header section-header">
          <div>
            <div className="section-eyebrow">Live Deals</div>
            <h2>Available Properties</h2>
            <p className="muted" style={{ marginTop: "8px" }}>
              {summaryText}
              {lastUpdated ? ` · ${lastUpdated}` : ""}
            </p>
          </div>
          <div className="sort-row">
            <span style={{ fontSize: ".8rem", color: "var(--slate)" }}>
              Sort:
            </span>
            {(filterOptions?.sortOptions ?? [
              { value: "newest", label: "Newest" },
              { value: "discount", label: "Highest Discount" },
              { value: "price", label: "Lowest Price" },
              { value: "yield", label: "Yield" },
            ]).map((option) => (
              <button
                key={option.value}
                type="button"
                className={
                  currentSort === option.value
                    ? "sort-btn active"
                    : "sort-btn"
                }
                onClick={() => changeSort(option.value)}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>

        {error && (
          <div className="alert alert-error" style={{ marginBottom: "16px" }}>
            <span>!</span>
            <span>{error}</span>
          </div>
        )}

        <div className="filters-bar">
          <div className="form-group">
            <label>Location</label>
            <input
              type="text"
              placeholder="Any location"
              value={draftFilters.location ?? ""}
              onChange={(event) =>
                setDraftFilters((current) => ({
                  ...current,
                  location: event.target.value,
                }))
              }
            />
          </div>
          <div className="form-group">
            <label>Property Type</label>
            <select
              value={draftFilters.propertyType ?? ""}
              onChange={(event) =>
                setDraftFilters((current) => ({
                  ...current,
                  propertyType: event.target.value,
                }))
              }
            >
              {(filterOptions?.propertyTypes ?? []).map((option) => (
                <option key={option.value || "all-types"} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label>Price Range</label>
            <select
              value={draftFilters.priceRange ?? ""}
              onChange={(event) =>
                setDraftFilters((current) => ({
                  ...current,
                  priceRange: event.target.value,
                }))
              }
            >
              {(filterOptions?.priceRanges ?? []).map((option) => (
                <option key={option.value || "any-price"} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label>Min Discount %</label>
            <select
              value={draftFilters.minDiscount ?? ""}
              onChange={(event) =>
                setDraftFilters((current) => ({
                  ...current,
                  minDiscount: event.target.value,
                }))
              }
            >
              {(filterOptions?.minDiscounts ?? []).map((option) => (
                <option
                  key={option.value || "any-discount"}
                  value={option.value}
                >
                  {option.label}
                </option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label>Strategy</label>
            <select
              value={draftFilters.strategy ?? ""}
              onChange={(event) =>
                setDraftFilters((current) => ({
                  ...current,
                  strategy: event.target.value,
                }))
              }
            >
              {(filterOptions?.strategies ?? []).map((option) => (
                <option
                  key={option.value || "all-strategies"}
                  value={option.value}
                >
                  {option.label}
                </option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label>Bedrooms</label>
            <select
              value={draftFilters.bedrooms ?? ""}
              onChange={(event) =>
                setDraftFilters((current) => ({
                  ...current,
                  bedrooms: event.target.value,
                }))
              }
            >
              {(filterOptions?.bedrooms ?? []).map((option) => (
                <option
                  key={option.value || "any-bedrooms"}
                  value={option.value}
                >
                  {option.label}
                </option>
              ))}
            </select>
          </div>
          <button
            type="button"
            className="btn btn-gold btn-sm"
            style={{ alignSelf: "flex-end" }}
            onClick={applyFilters}
          >
            Apply Filters
          </button>
        </div>

        {loading ? (
          <p className="muted" style={{ marginBottom: "20px" }}>
            Updating results…
          </p>
        ) : null}

        <div className="property-grid">
          {(listings?.properties ?? []).map((property) => (
            <PropertyCard
              key={property.id}
              property={property}
              onView={handleView}
              onSave={handleSave}
              onUnlock={handleUnlock}
              saving={savingId === property.id}
            />
          ))}
        </div>

        {!loading && (listings?.properties.length ?? 0) === 0 && (
          <p className="muted" style={{ textAlign: "center", marginTop: "24px" }}>
            No deals match your filters. Try adjusting your search.
          </p>
        )}

        {listings && listings.pagination.totalPages > 1 && (
          <div className="pagination">
            <button
              type="button"
              className="pg-btn"
              disabled={!listings.pagination.hasPrev}
              onClick={() => goToPage(listings.pagination.page - 1)}
            >
              ‹
            </button>
            {pageNumbers.map((page, index) => {
              const prev = pageNumbers[index - 1];
              const showEllipsis = prev != null && page - prev > 1;

              return (
                <span key={page} style={{ display: "contents" }}>
                  {showEllipsis && (
                    <button type="button" className="pg-btn" disabled>
                      …
                    </button>
                  )}
                  <button
                    type="button"
                    className={
                      listings.pagination.page === page
                        ? "pg-btn active"
                        : "pg-btn"
                    }
                    onClick={() => goToPage(page)}
                  >
                    {page}
                  </button>
                </span>
              );
            })}
            <button
              type="button"
              className="pg-btn"
              disabled={!listings.pagination.hasNext}
              onClick={() => goToPage(listings.pagination.page + 1)}
            >
              ›
            </button>
          </div>
        )}
      </div>

      {detailLoading && (
        <div className="modal-backdrop" role="presentation">
          <div className="modal">
            <p>Loading deal details…</p>
          </div>
        </div>
      )}

      <ListingDetailModal listing={detail} onClose={() => setDetail(null)} />
    </section>
  );
}
