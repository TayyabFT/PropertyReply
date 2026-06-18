import LockIcon from "@/components/icons/LockIcon";

export type PropertyTag = {
  label: string;
  badge?: string;
};

export type Property = {
  id: string;
  placeholder: string;
  discount: string;
  featured?: boolean;
  lock?: {
    label: string;
    buttonText: string;
  };
  title: string;
  location: string;
  asking: string;
  market: string;
  saving?: string;
  tags: PropertyTag[];
  footerButtonLabel: string;
  footerButtonClass: string;
  meta: string;
};

export default function PropertyCard({ property }: { property: Property }) {
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
            <button className="btn btn-gold btn-sm" style={{ marginTop: "6px" }}>
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
          <button className={property.footerButtonClass}>
            {property.footerButtonLabel}
          </button>
          <span className="prop-meta">{property.meta}</span>
        </div>
      </div>
    </div>
  );
}
