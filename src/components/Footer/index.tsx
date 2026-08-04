import BrandLogo from "@/components/BrandLogo";

export default function Footer() {
  return (
    <footer>
      <div className="container">
        <div className="footer-grid">
          <div className="footer-brand">
            <BrandLogo asDiv iconSize={44} />
            <p>
              The UK&apos;s leading marketplace for below-market-value property
              deals. Connecting motivated sellers with active investors.
            </p>
            <div style={{ display: "flex", gap: "10px", marginTop: "16px" }}>
              <span className="chip">🏴󠁧󠁢󠁥󠁮󠁧󠁿 UK Based</span>
              <span className="chip">🔒 GDPR Compliant</span>
              <span className="chip">✅ Identity Verified</span>
            </div>
          </div>
          <div className="footer-col">
            <h5>Platform</h5>
            <a href="#listings">Browse Deals</a>
            <a href="/register">Submit a Deal</a>
            <a href="#membership">Membership Plans</a>
            <a href="/register">Deal Analysis</a>
          </div>
          <div className="footer-col">
            <h5>Account</h5>
            <a href="/login">Sign In</a>
            <a href="/register">Register</a>
            <a href="/login">Dashboard</a>
            <a href="/login">Profile</a>
            <a href="/login">KYC Verification</a>
            <a href="/login">Notifications</a>
          </div>
          <div className="footer-col">
            <h5>Legal</h5>
            <a href="#trust">Terms &amp; Conditions</a>
            <a href="#trust">Privacy Policy</a>
            <a href="#trust">Investment Disclaimer</a>
            <a href="#trust">Anti-Spam Policy</a>
            <a href="#trust">Report a Listing</a>
            <a href="#">Cookie Policy</a>
          </div>
        </div>
        <div className="footer-bottom">
          <p>
            © 2026 PropertyReply Ltd. Registered in England &amp; Wales. All
            rights reserved.
          </p>
          <div className="footer-legal">
            <a href="#trust">Terms</a>
            <a href="#trust">Privacy</a>
            <a href="#trust">Disclaimer</a>
            <a href="#">Cookies</a>
            <a href="#">Sitemap</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
