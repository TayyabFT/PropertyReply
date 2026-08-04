const recentDeals: { title: string; meta: string; discount: string }[] = [
  {
    title: "3-bed terrace — Manchester",
    meta: "£124,000 asking · £178k market",
    discount: "▼ 30%",
  },
  {
    title: "Commercial unit — Leeds",
    meta: "£89,500 asking · £145k market",
    discount: "▼ 38%",
  },
  {
    title: "HMO 5-bed — Birmingham",
    meta: "£195,000 asking · £260k market",
    discount: "▼ 25%",
  },
];

export default function Hero() {
  return (
    <section className="hero" id="hero">
      <div className="container">
        <div className="hero-inner">
          <div className="hero-left">
            <div className="hero-eyebrow">
              <span className="tag">UK&apos;s #1 BMV Marketplace</span>
            </div>
            <h1>
              Find Deals{" "}
              <span className="text-gradient">Below Market</span> Value
            </h1>
            <p className="hero-desc">
              Access thousands of verified below-market-value properties across
              the UK. From flips to HMOs, every deal analysed and ready to act
              on.
            </p>
            <div className="hero-actions">
              <a href="#listings" className="btn btn-gold">
                Browse Live Deals
              </a>
              <a href="/register" className="btn btn-outline">
                Submit a Deal
              </a>
            </div>
            {/* <div className="hero-stats">
              <div className="stat-item">
                <h3>2,400+</h3>
                <p>Active Listings</p>
              </div>
              <div className="stat-item">
                <h3>£180M</h3>
                <p>Total Deal Value</p>
              </div>
              <div className="stat-item">
                <h3>31%</h3>
                <p>Avg Discount</p>
              </div>
              <div className="stat-item">
                <h3>18K+</h3>
                <p>Members</p>
              </div>
            </div> */}
          </div>

          {/* <div className="hero-right">
            <div className="hero-search">
              <div className="hero-search-title">
                <span className="search-icon">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                    <circle cx="11" cy="11" r="8" />
                    <path d="M21 21l-4.35-4.35" />
                  </svg>
                </span>
                Search BMV Deals
              </div>
              <div className="search-bar">
                <input type="text" placeholder="Postcode, town or city…" />
                <button className="btn btn-gold btn-sm">Search</button>
              </div>
              <div className="filter-row">
                <select>
                  <option>All Property Types</option>
                  <option>House</option>
                  <option>Flat</option>
                  <option>HMO</option>
                  <option>Commercial</option>
                  <option>Land</option>
                </select>
                <select>
                  <option>Any Price</option>
                  <option>Under £100k</option>
                  <option>£100k–£200k</option>
                  <option>£200k–£350k</option>
                  <option>£350k+</option>
                </select>
                <select>
                  <option>Min Discount</option>
                  <option>10%+</option>
                  <option>20%+</option>
                  <option>30%+</option>
                  <option>40%+</option>
                </select>
                <select>
                  <option>Investment Strategy</option>
                  <option>Flip</option>
                  <option>Buy-to-Let</option>
                  <option>HMO</option>
                  <option>Commercial Conversion</option>
                </select>
              </div>
              <div className="recent-deals">
                <p
                  style={{
                    fontSize: ".75rem",
                    color: "var(--slate)",
                    marginBottom: "10px",
                  }}
                >
                  RECENTLY ADDED
                </p>
                {recentDeals.map((deal) => (
                  <div className="mini-deal" key={deal.title}>
                    <div className="mini-deal-info">
                      <p>{deal.title}</p>
                      <span>{deal.meta}</span>
                    </div>
                    <span className="discount-pill">{deal.discount}</span>
                  </div>
                ))}
              </div>
            </div>
          </div> */}
        </div>
      </div>
    </section>
  );
}
