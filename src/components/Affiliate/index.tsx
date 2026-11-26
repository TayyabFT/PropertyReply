"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth";
import { affiliatesApi, type AffiliateReport } from "@/lib/api";
import { affiliateMetrics, commissionBadge, formatDate, formatGBP } from "./format";

export default function Affiliate() {
  const { token } = useAuth();
  const [report, setReport] = useState<AffiliateReport | null>(null);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState("");

  useEffect(() => {
    if (!token) return;
    let cancelled = false;
    affiliatesApi.mine(token)
      .then((res) => { if (!cancelled) setReport(res.data); })
      .catch((err) => { if (!cancelled) setError(err instanceof Error ? err.message : "Unable to load your affiliate stats."); });
    return () => { cancelled = true; };
  }, [token]);

  async function copy(value: string, label: string) {
    try { await navigator.clipboard.writeText(value); setCopied(`${label} copied.`); }
    catch { setCopied(`Select the ${label.toLowerCase()} and copy it manually.`); }
  }

  return (
    <section className="section section-alt" id="affiliate">
      <div className="container">
        <div className="tag mb-16">Affiliate Programme</div>
        <h2>Your affiliate dashboard</h2>

        {error && <div role="alert" className="alert alert-error" style={{ margin: "16px 0" }}><span>!</span><span>{error}</span></div>}
        {!report && !error && <p className="muted">Loading your stats…</p>}

        {report && <>
          <p className="muted" style={{ margin: "8px 0 20px" }}>
            You earn <strong>{formatGBP(report.commissionGBP)}</strong> once for each person who signs up with your link or code and
            pays for their first subscription. Your link is remembered for 30 days, so they don&apos;t have to sign up straight away.
          </p>

          {report.status === "paused" && (
            <div className="alert alert-info" style={{ marginBottom: 16 }}>
              <span>i</span>
              <span>Your affiliate link is paused, so new signups won&apos;t be credited. People you already referred still earn commission when they subscribe.</span>
            </div>
          )}

          <div className="admin-card">
            <div className="admin-card-header"><h3>Share your link</h3></div>
            <div className="admin-card-body">
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
                <input aria-label="Your referral link" readOnly value={report.link} onFocus={(e) => e.currentTarget.select()} style={{ flex: "1 1 260px", padding: "8px 12px" }} />
                <button type="button" className="btn btn-gold btn-sm" onClick={() => copy(report.link, "Link")}>Copy link</button>
              </div>
              <p style={{ marginTop: 12 }}>
                Or ask them to enter code <strong className="mono">{report.code}</strong> when they sign up.{" "}
                <button type="button" className="btn btn-outline btn-sm" onClick={() => copy(report.code, "Code")}>Copy code</button>
              </p>
              {copied && <p role="status" className="muted" style={{ marginTop: 8 }}>{copied}</p>}
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: 14, margin: "20px 0" }}>
            {affiliateMetrics(report).map((item) => (
              <div className="metric-box" key={item.label}>
                <div className="label">{item.label}</div>
                <div className="value">{item.value}</div>
              </div>
            ))}
          </div>

          <div className="admin-card">
            <div className="admin-card-header"><h3>People you referred ({report.referrals.length})</h3></div>
            <div className="admin-card-body" style={{ overflowX: "auto" }}>
              {report.referrals.length === 0 ? <p className="muted">No signups yet. Share your link to get started.</p> : (
                <table className="admin-table">
                  <thead><tr><th>Name</th><th>Signed up</th><th>Commission</th></tr></thead>
                  <tbody>{report.referrals.map((referral) => {
                    const badge = commissionBadge(referral.commission);
                    return <tr key={referral.id}>
                      <td>{referral.name}</td>
                      <td>{formatDate(referral.joinedAt)}</td>
                      <td><span className={badge.className}>{badge.label}</span></td>
                    </tr>;
                  })}</tbody>
                </table>
              )}
            </div>
          </div>

          <div className="admin-card">
            <div className="admin-card-header"><h3>Payments to you</h3></div>
            <div className="admin-card-body" style={{ overflowX: "auto" }}>
              {report.payouts.length === 0 ? <p className="muted">No payments yet. We pay unpaid commission manually and it will show here.</p> : (
                <table className="admin-table">
                  <thead><tr><th>Date</th><th>Amount</th><th>Referrals</th><th>Reference</th></tr></thead>
                  <tbody>{report.payouts.map((payout) => <tr key={payout.id}>
                    <td>{formatDate(payout.paidAt)}</td>
                    <td><strong>{formatGBP(payout.amountGBP)}</strong></td>
                    <td>{payout.commissionCount}</td>
                    <td>{payout.reference || "—"}</td>
                  </tr>)}</tbody>
                </table>
              )}
            </div>
          </div>
        </>}
      </div>
    </section>
  );
}
