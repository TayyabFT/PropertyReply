"use client";

import Link from "next/link";
import type { ListingDetail } from "@/lib/api";

type ListingDetailModalProps = {
  listing: ListingDetail | null;
  onClose: () => void;
};

export default function ListingDetailModal({
  listing,
  onClose,
}: ListingDetailModalProps) {
  if (!listing) return null;

  return (
    <div className="modal-backdrop" onClick={onClose} role="presentation">
      <div
        className="modal"
        onClick={(event) => event.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="listing-detail-title"
      >
        <div className="flex-between mb-16">
          <h3 id="listing-detail-title">{listing.title}</h3>
          <button
            type="button"
            className="btn btn-outline btn-sm"
            onClick={onClose}
            aria-label="Close"
          >
            ✕
          </button>
        </div>

        <p className="prop-location" style={{ marginBottom: "12px" }}>
          {listing.location}
        </p>

        <div className="grid-3" style={{ gap: "14px", marginBottom: "16px" }}>
          <div>
            <p style={{ fontSize: ".75rem", color: "var(--slate)" }}>
              Asking Price
            </p>
            <p style={{ fontWeight: 600 }}>{listing.asking}</p>
          </div>
          <div>
            <p style={{ fontSize: ".75rem", color: "var(--slate)" }}>
              Market Value
            </p>
            <p style={{ fontWeight: 600 }}>{listing.market}</p>
          </div>
          <div>
            <p style={{ fontSize: ".75rem", color: "var(--slate)" }}>
              Discount
            </p>
            <p style={{ fontWeight: 600, color: "var(--green)" }}>
              {listing.discount}
            </p>
          </div>
        </div>

        {listing.yieldPercent != null && (
          <p style={{ marginBottom: "12px", fontSize: ".9rem" }}>
            Estimated yield: <strong>{listing.yieldPercent}%</strong>
          </p>
        )}

        {listing.sellerName && (
          <p style={{ marginBottom: "12px", fontSize: ".85rem", color: "var(--slate)" }}>
            Seller: {listing.sellerName}
          </p>
        )}

        <p style={{ lineHeight: 1.6, marginBottom: "20px" }}>
          {listing.description || "No additional description provided."}
        </p>

        <div className="prop-tags" style={{ marginBottom: "20px" }}>
          {listing.tags.map((tag, index) => (
            <span
              className={tag.badge ? `tag ${tag.badge}` : "tag"}
              key={`${listing.id}-modal-tag-${index}`}
            >
              {tag.label}
            </span>
          ))}
        </div>

        <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
          <button type="button" className="btn btn-gold btn-sm" onClick={onClose}>
            Close
          </button>
          {!listing.isLocked && (
            <Link
              href={`/app/deal-analysis?listingId=${listing.id}`}
              className="btn btn-outline btn-sm"
              onClick={onClose}
            >
              Full Analysis →
            </Link>
          )}
          {listing.isLocked && (
            <Link href="/app/membership" className="btn btn-outline btn-sm">
              Upgrade to unlock
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
