import Link from "next/link";

export default function CtaBand() {
  return (
    <section className="section">
      <div className="container">
        <div className="cta-band">
          <div className="section-eyebrow" style={{ justifyContent: "center" }}>
            Start Today
          </div>
          <h2>Ready to find your next below-market deal?</h2>
          <div className="cta-actions">
            <Link href="/register" className="btn btn-gold">
              Get Started →
            </Link>
            <Link href="/login" className="btn btn-outline">
              Sign In
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
