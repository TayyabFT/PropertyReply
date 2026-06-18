import PropertyCard from "./PropertyCard";
import { properties } from "./properties";

export default function Listings() {
  return (
    <section className="section section-alt" id="listings">
      <div className="container">
        <div className="listings-header section-header">
          <div>
            <div className="section-eyebrow">Live Deals</div>
            <h2>Available Properties</h2>
            <p className="muted" style={{ marginTop: "8px" }}>
              Showing 48 of 2,412 deals · Updated 4 minutes ago
            </p>
          </div>
          <div className="sort-row">
            <span style={{ fontSize: ".8rem", color: "var(--slate)" }}>
              Sort:
            </span>
            <button className="sort-btn active">Newest</button>
            <button className="sort-btn">Highest Discount</button>
            <button className="sort-btn">Lowest Price</button>
            <button className="sort-btn">Yield</button>
          </div>
        </div>

        <div className="filters-bar">
          <div className="form-group">
            <label>Location</label>
            <input type="text" placeholder="Any location" />
          </div>
          <div className="form-group">
            <label>Property Type</label>
            <select>
              <option>All Types</option>
              <option>House</option>
              <option>Flat</option>
              <option>HMO</option>
              <option>Commercial</option>
              <option>Land</option>
              <option>Bungalow</option>
              <option>Detached</option>
            </select>
          </div>
          <div className="form-group">
            <label>Price Range</label>
            <select>
              <option>Any Price</option>
              <option>Under £75k</option>
              <option>£75k–£150k</option>
              <option>£150k–£300k</option>
              <option>£300k–£500k</option>
              <option>£500k+</option>
            </select>
          </div>
          <div className="form-group">
            <label>Min Discount %</label>
            <select>
              <option>Any</option>
              <option>10%+</option>
              <option>20%+</option>
              <option>25%+</option>
              <option>30%+</option>
              <option>40%+</option>
            </select>
          </div>
          <div className="form-group">
            <label>Strategy</label>
            <select>
              <option>All Strategies</option>
              <option>Flip</option>
              <option>Buy-to-Let</option>
              <option>HMO</option>
              <option>Commercial Conversion</option>
              <option>Serviced Accommodation</option>
            </select>
          </div>
          <div className="form-group">
            <label>Bedrooms</label>
            <select>
              <option>Any</option>
              <option>1+</option>
              <option>2+</option>
              <option>3+</option>
              <option>4+</option>
              <option>5+</option>
            </select>
          </div>
          <button className="btn btn-gold btn-sm" style={{ alignSelf: "flex-end" }}>
            Apply Filters
          </button>
        </div>

        <div className="property-grid">
          {properties.map((property) => (
            <PropertyCard key={property.id} property={property} />
          ))}
        </div>

        <div className="pagination">
          <button className="pg-btn">‹</button>
          <button className="pg-btn active">1</button>
          <button className="pg-btn">2</button>
          <button className="pg-btn">3</button>
          <button className="pg-btn">4</button>
          <button className="pg-btn">…</button>
          <button className="pg-btn">48</button>
          <button className="pg-btn">›</button>
        </div>
      </div>
    </section>
  );
}
