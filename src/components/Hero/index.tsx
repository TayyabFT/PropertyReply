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
              Access verified below-market-value properties across
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
          </div>
        </div>
      </div>
    </section>
  );
}
