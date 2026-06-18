const strategyTags: string[] = [
  "Flip / Refurbishment",
  "Buy-to-Let",
  "HMO",
  "Commercial Conversion",
  "Serviced Accommodation",
  "Development Land",
  "BRRR Strategy",
  "Lease Option",
  "Mixed Use",
];

export default function SubmitListing() {
  return (
    <section className="section" id="submit">
      <div className="container">
        <div className="tag mb-8">Submit a Deal</div>
        <h2 className="mb-8">List a BMV Property</h2>
        <p className="muted mb-32">
          Share below-market deals with thousands of active investors. All
          submissions are reviewed before going live.
        </p>

        <div className="submit-form">
          <div className="submit-header">
            <h3>New Property Listing</h3>
            <p style={{ color: "var(--slate)", fontSize: ".82rem" }}>
              All fields marked * are required
            </p>
          </div>
          <div className="submit-body">
            <div className="step-indicator">
              <div className="step done">✓ Property Details</div>
              <div className="step active">📍 Location & Pricing</div>
              <div className="step">📸 Images</div>
              <div className="step">📞 Contact</div>
              <div className="step">✅ Review</div>
            </div>

            <p className="form-section-title">🏠 Property Information</p>
            <div className="form-group">
              <label>Property Title *</label>
              <input
                type="text"
                placeholder="e.g. 3-Bed Terrace – Motivated Seller, Manchester"
              />
            </div>
            <div className="form-group">
              <label>Property Description *</label>
              <textarea
                rows={4}
                placeholder="Describe the property, its condition, why it's a good deal, any known issues…"
              ></textarea>
            </div>
            <div className="grid-2">
              <div className="form-group">
                <label>Property Type *</label>
                <select>
                  <option>-- Select --</option>
                  <option>House – Terraced</option>
                  <option>House – Semi-Detached</option>
                  <option>House – Detached</option>
                  <option>Flat / Apartment</option>
                  <option>Bungalow</option>
                  <option>HMO</option>
                  <option>Commercial</option>
                  <option>Land</option>
                  <option>Mixed Use</option>
                </select>
              </div>
              <div className="form-group">
                <label>Number of Bedrooms *</label>
                <select>
                  <option>-- Select --</option>
                  <option>Studio</option>
                  <option>1</option>
                  <option>2</option>
                  <option>3</option>
                  <option>4</option>
                  <option>5</option>
                  <option>6+</option>
                  <option>N/A (Commercial/Land)</option>
                </select>
              </div>
            </div>

            <p className="form-section-title" style={{ marginTop: "24px" }}>
              📍 Location & Pricing
            </p>
            <div className="grid-2">
              <div className="form-group">
                <label>Street Address</label>
                <input type="text" placeholder="e.g. 15 Oak Street" />
              </div>
              <div className="form-group">
                <label>Postcode *</label>
                <input type="text" placeholder="e.g. M6 5AB" />
              </div>
              <div className="form-group">
                <label>Town / City *</label>
                <input type="text" placeholder="e.g. Manchester" />
              </div>
              <div className="form-group">
                <label>County</label>
                <input type="text" placeholder="e.g. Greater Manchester" />
              </div>
            </div>
            <div className="grid-3">
              <div className="form-group">
                <label>Asking Price * (£)</label>
                <input type="number" placeholder="e.g. 118000" />
              </div>
              <div className="form-group">
                <label>Estimated Market Value * (£)</label>
                <input type="number" placeholder="e.g. 178000" />
              </div>
              <div className="form-group">
                <label>Discount % (auto-calculated)</label>
                <input
                  type="text"
                  placeholder="Will auto-calculate"
                  readOnly
                  style={{
                    background: "rgba(212,168,67,.07)",
                    color: "var(--gold)",
                  }}
                />
              </div>
            </div>

            <p className="form-section-title" style={{ marginTop: "24px" }}>
              🏷 Investment Strategy Tags *
            </p>
            <div className="checkbox-grid">
              {strategyTags.map((tag) => (
                <label className="checkbox-item" key={tag}>
                  <input type="checkbox" /> {tag}
                </label>
              ))}
            </div>

            <p className="form-section-title" style={{ marginTop: "24px" }}>
              📸 Property Images
            </p>
            <div className="image-upload">
              <div className="upload-icon">📷</div>
              <p>Drag and drop images here, or click to browse</p>
              <p style={{ marginTop: "6px", fontSize: ".78rem" }}>
                Supports JPG, PNG, WebP · Max 10MB per image · Up to 20 images
              </p>
              <button
                className="btn btn-outline btn-sm"
                style={{ marginTop: "14px" }}
              >
                Browse Files
              </button>
            </div>

            <p className="form-section-title" style={{ marginTop: "24px" }}>
              📞 Contact Details
            </p>
            <div className="grid-2">
              <div className="form-group">
                <label>Your Name *</label>
                <input type="text" placeholder="Full name" />
              </div>
              <div className="form-group">
                <label>Role *</label>
                <select>
                  <option>-- Select --</option>
                  <option>Property Owner</option>
                  <option>Sourcing Agent</option>
                  <option>Estate Agent</option>
                  <option>Solicitor</option>
                  <option>Other</option>
                </select>
              </div>
              <div className="form-group">
                <label>Phone Number *</label>
                <input type="tel" placeholder="e.g. 07700 900000" />
              </div>
              <div className="form-group">
                <label>Email Address *</label>
                <input type="email" placeholder="your@email.co.uk" />
              </div>
            </div>

            <div className="alert alert-warn">
              <span>⚠️</span>
              <div>
                All listings are reviewed within 24–48 hours. Inaccurate,
                misleading, or spam listings will be removed and may result in
                account suspension.
              </div>
            </div>

            <div className="form-actions">
              <button className="btn btn-outline">← Previous Step</button>
              <div style={{ display: "flex", gap: "10px" }}>
                <button className="btn btn-outline">Save as Draft</button>
                <button className="btn btn-gold">Submit Listing →</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
