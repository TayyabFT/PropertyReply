"use client";

import Link from "next/link";
import { useEffect, useState, type ReactNode } from "react";
import { useAuth } from "@/lib/auth";
import { adminApi, type AdminListingDetail } from "@/lib/api";
import { errorMessage } from "./shared";

type AdminListingModalProps = {
  listingId: string | null;
  onClose: () => void;
  onMarkSold: (listing: { id: string; title: string }) => void;
  busy?: boolean;
};

const label = { fontSize: ".75rem", color: "var(--slate)" } as const;

function formatDate(value: string | null) {
  if (!value) return "—";
  return new Date(value).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
}

function Fact({ name, children }: { name: string; children: ReactNode }) {
  return (
    <div>
      <p style={label}>{name}</p>
      <p style={{ fontWeight: 600 }}>{children}</p>
    </div>
  );
}

export default function AdminListingModal({ listingId, onClose, onMarkSold, busy }: AdminListingModalProps) {
  const { token } = useAuth();
  const [listing, setListing] = useState<AdminListingDetail | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!listingId || !token) return;
    let cancelled = false;
    setListing(null);
    setError("");
    adminApi.getListing(token, listingId)
      .then((res) => { if (!cancelled) setListing(res.data); })
      .catch((err) => { if (!cancelled) setError(errorMessage(err, "Could not load this listing.")); });
    return () => { cancelled = true; };
  }, [listingId, token]);

  // Stop the page behind from scrolling; close with Escape
  useEffect(() => {
    if (!listingId) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (event: KeyboardEvent) => { if (event.key === "Escape") onClose(); };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKey);
    };
  }, [listingId, onClose]);

  if (!listingId) return null;

  const statusClass = listing?.status === "sold" ? "tag badge-green" : "tag";

  return (
    <div className="modal-backdrop" onClick={onClose} role="presentation">
      <div
        className="modal"
        style={{ maxWidth: 640 }}
        onClick={(event) => event.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="admin-listing-title"
      >
        <div className="modal-head mb-16">
          <h3 id="admin-listing-title">{listing?.title || "Listing details"}</h3>
          <button type="button" className="btn btn-outline btn-sm" onClick={onClose} aria-label="Close">✕</button>
        </div>

        {error && <div role="alert" className="alert alert-error" style={{ marginBottom: 16 }}><span>!</span><span>{error}</span></div>}
        {!listing && !error && <p className="muted">Loading listing…</p>}

        {listing && <>
          <p className="prop-location" style={{ marginBottom: 10 }}>
            📍 {listing.location}{listing.postcode ? `, ${listing.postcode}` : ""}
          </p>
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 16 }}>
            <span className={statusClass}>{listing.status}</span>
            <span className="tag">{listing.accessTier}</span>
            {listing.featured && <span className="tag">⭐ Featured</span>}
          </div>

          <div className="grid-3" style={{ gridTemplateColumns: "repeat(3, minmax(0, 1fr))", gap: 10, marginBottom: 16, overflowWrap: "anywhere" }}>
            <Fact name="Asking Price">{listing.askingPrice}</Fact>
            <Fact name="Market Value">{listing.marketValue}</Fact>
            <div>
              <p style={label}>Discount</p>
              <p style={{ fontWeight: 600, color: "var(--green)" }}>▼ {listing.discountPercent}%</p>
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(130px, 1fr))", gap: 10, marginBottom: 16, overflowWrap: "anywhere" }}>
            <Fact name="Property type">{listing.propertyType}</Fact>
            <Fact name="Bedrooms">{listing.bedrooms}</Fact>
            <Fact name="Est. yield">{listing.yieldPercent != null ? `${listing.yieldPercent}%` : "—"}</Fact>
            <Fact name="Published">{formatDate(listing.publishedAt)}</Fact>
            <Fact name="Saves">{listing.saveCount}</Fact>
            <Fact name="Strategies">{listing.strategies.length ? listing.strategies.join(", ") : "—"}</Fact>
          </div>

          <p style={{ ...label, marginBottom: 4 }}>Description</p>
          <p style={{ lineHeight: 1.6, marginBottom: 16, whiteSpace: "pre-line" }}>
            {listing.description || "No additional description provided."}
          </p>

          {listing.tags.length > 0 && (
            <div className="prop-tags" style={{ marginBottom: 16 }}>
              {listing.tags.map((tag, index) => (
                <span className={tag.badge ? `tag ${tag.badge}` : "tag"} key={`${listing.id}-tag-${index}`}>{tag.label}</span>
              ))}
            </div>
          )}

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 12, marginBottom: 16, overflowWrap: "anywhere" }}>
            <div className="metric-box">
              <div className="label">Submitted by</div>
              {listing.submittedBy ? <>
                <p style={{ fontWeight: 600 }}>{listing.submittedBy.name || listing.sellerName || "—"}</p>
                <p style={{ fontSize: ".85rem" }}>{listing.submittedBy.email}</p>
                <p style={{ fontSize: ".8rem", color: "var(--slate)" }}>Plan: {listing.submittedBy.plan || "None"}</p>
              </> : <p style={{ fontWeight: 600 }}>{listing.sellerName || "No linked account"}</p>}
            </div>
            {listing.contact && (
              <div className="metric-box">
                <div className="label">Deal contact</div>
                <p style={{ fontWeight: 600 }}>{listing.contact.name || "—"}{listing.contact.role ? ` · ${listing.contact.role}` : ""}</p>
                {listing.contact.email && <p style={{ fontSize: ".85rem" }}>{listing.contact.email}</p>}
                {listing.contact.phone && <p style={{ fontSize: ".85rem" }}>{listing.contact.phone}</p>}
              </div>
            )}
          </div>

          {listing.status === "sold" && (
            <div className="grid-3" style={{ gridTemplateColumns: "repeat(3, minmax(0, 1fr))", gap: 10, marginBottom: 16, overflowWrap: "anywhere" }}>
              <Fact name="Sale price">{listing.salePrice || "—"}</Fact>
              <Fact name="Sold on">{formatDate(listing.soldAt)}</Fact>
              <Fact name="Success fee">
                {listing.commissionGBP ? `${listing.commissionGBP} (${listing.commissionInvoiceStatus})` : "—"}
              </Fact>
            </div>
          )}
        </>}

        <div className="modal-actions">
          <button type="button" className="btn btn-outline btn-sm" onClick={onClose}>Close</button>
          {listing?.status === "live" && (
            <Link href={`/app/deal-analysis?listingId=${listing.id}`} className="btn btn-outline btn-sm">
              Full Analysis →
            </Link>
          )}
          {listing && listing.status !== "sold" && (
            <button
              type="button"
              className="btn btn-gold btn-sm"
              disabled={busy}
              onClick={() => onMarkSold({ id: listing.id, title: listing.title })}
            >
              Mark as Sold
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
