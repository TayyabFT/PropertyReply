"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import PropertyCard from "./PropertyCard";
import { publicApi, type ListingProperty } from "@/lib/api";

export default function Listings() {
  const router = useRouter();
  const [properties, setProperties] = useState<ListingProperty[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await publicApi.listings(6);
        if (!cancelled) setProperties(res.data.properties);
      } catch {
        if (!cancelled) setProperties([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const goToSignup = () => router.push("/register");

  return (
    <section className="section section-alt" id="listings">
      <div className="container">
        <div className="listings-header section-header">
          <div>
            <div className="section-eyebrow">Live Deals</div>
            <h2>Available Properties</h2>
            <p className="muted" style={{ marginTop: "8px" }}>
              {loading
                ? "Loading the latest deals…"
                : properties.length > 0
                  ? `Showing ${properties.length} of our newest live deals`
                  : "New deals are added as sellers submit and our team verifies them."}
            </p>
          </div>
        </div>

        {!loading && properties.length === 0 ? (
          <div
            className="card"
            style={{ textAlign: "center", padding: "48px 24px" }}
          >
            <h3 style={{ marginBottom: "8px" }}>No live deals just yet</h3>
            <p className="muted" style={{ marginBottom: "20px" }}>
              Create your account and subscribe to be first to see new
              below-market properties as they go live.
            </p>
            <button className="btn btn-gold" onClick={goToSignup}>
              Get Started →
            </button>
          </div>
        ) : (
          <div className="property-grid">
            {properties.map((property) => (
              <PropertyCard
                key={property.id}
                property={property}
                onView={goToSignup}
                onUnlock={goToSignup}
                onSave={goToSignup}
              />
            ))}
          </div>
        )}

        {!loading && properties.length > 0 && (
          <div style={{ textAlign: "center", marginTop: "32px" }}>
            <button className="btn btn-gold" onClick={goToSignup}>
              Sign up to browse all deals →
            </button>
          </div>
        )}
      </div>
    </section>
  );
}
