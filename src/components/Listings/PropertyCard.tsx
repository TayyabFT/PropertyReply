"use client";

import Link from "next/link";
import LockIcon from "@/components/icons/LockIcon";
import type { ListingProperty } from "@/lib/api";

type PropertyCardProps = {
  property: ListingProperty;
  onView?: (property: ListingProperty) => void;
  onSave?: (property: ListingProperty) => void;
  onUnlock?: (property: ListingProperty) => void;
  saving?: boolean;
};

export default function PropertyCard({
  property,
  onView,
  onSave,
  onUnlock,
  saving = false,
}: PropertyCardProps) {
  const handlePrimaryAction = () => {
    if (property.isLocked) {
      onUnlock?.(property);
      return;
    }
    onView?.(property);
  };

  return (
    <div className="property-card">
      <div className="prop-img">
        <span className="prop-img-placeholder">{property.placeholder}</span>
        <span className="prop-discount">{property.discount}</span>
        {property.featured && (
          <span className="prop-featured">⭐ Featured</span>
        )}
        {property.lock && (
          <div className="prop-lock">
            <LockIcon />
            <span>{property.lock.label}</span>
            <button
              type="button"
              className="btn btn-gold btn-sm"
              style={{ marginTop: "6px" }}
              onClick={() => onUnlock?.(property)}
            >
              {property.lock.buttonText}
            </button>
          </div>
        )}
      </div>
      <div className="prop-body">
        <h4 className="prop-title">{property.title}</h4>
        <p className="prop-location">{property.location}</p>
        <div className="prop-prices">
          <div className="price-col">
            <p>Asking Price</p>
            <h4 className="asking">{property.asking}</h4>
          </div>
          <div className="price-col" style={{ textAlign: "right" }}>
            <p>Market Value</p>
            <h4 className="market">{property.market}</h4>
          </div>
          {property.saving && (
            <div className="price-col" style={{ textAlign: "right" }}>
              <p>Saving</p>
              <h4 style={{ color: "var(--green)" }}>{property.saving}</h4>
            </div>
          )}
        </div>
        <div className="prop-tags">
          {property.tags.map((tag, index) => (
            <span
              className={tag.badge ? `tag ${tag.badge}` : "tag"}
              key={`${property.id}-tag-${index}`}
            >
              {tag.label}
            </span>
          ))}
        </div>
        <div className="prop-footer">
          <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
            <button
              type="button"
              className={property.footerButtonClass}
              onClick={handlePrimaryAction}
            >
              {property.footerButtonLabel}
            </button>
            <button
              type="button"
              className={
                property.isSaved
                  ? "btn btn-gold btn-sm"
                  : "btn btn-outline btn-sm"
              }
              onClick={() => onSave?.(property)}
              disabled={saving}
              title={property.isSaved ? "Remove from saved" : "Save deal"}
              aria-label={property.isSaved ? "Remove from saved" : "Save deal"}
            >
              {saving ? "…" : property.isSaved ? "♥" : "♡"}
            </button>
          </div>
          <span className="prop-meta">{property.meta}</span>
        </div>
      </div>
    </div>
  );
}

export type { ListingProperty as Property };
