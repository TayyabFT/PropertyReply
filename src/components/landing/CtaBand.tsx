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
          <p>
            Join 18,000+ UK investors getting verified BMV deals, full analysis,
            and seller contacts. Create your account in under a minute.
          </p>
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
