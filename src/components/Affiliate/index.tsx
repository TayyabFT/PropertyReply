const referralHistory: {
  member: string;
  plan: string;
  commission: string;
  commissionClass: string;
  statusColor: string;
  status: string;
}[] = [
  { member: "R.Wilson", plan: "Premium", commission: "£5.80", commissionClass: "green", statusColor: "var(--green)", status: "Paid" },
  { member: "T.Ahmed", plan: "VIP", commission: "£23.70", commissionClass: "green", statusColor: "var(--green)", status: "Paid" },
  { member: "S.Patel", plan: "Premium", commission: "£5.80", commissionClass: "amber", statusColor: "var(--amber)", status: "Pending" },
];

const leaderboard: {
  rank: string;
  rankClass: string;
  name: string;
  barWidth: string;
  barColor?: string;
  earnings: string;
  earningsClass?: string;
}[] = [
  { rank: "🥇", rankClass: "lb-rank top3", name: "M. Thompson", barWidth: "100%", earnings: "£1,240" },
  { rank: "🥈", rankClass: "lb-rank top3", name: "P. Kumar", barWidth: "82%", earnings: "£1,018" },
  { rank: "🥉", rankClass: "lb-rank top3", name: "S. Davies", barWidth: "70%", earnings: "£868" },
  { rank: "#4", rankClass: "lb-rank", name: "A. Osei", barWidth: "56%", barColor: "#5a7090", earnings: "£695" },
  { rank: "#5", rankClass: "lb-rank", name: "J. Smith (You)", barWidth: "27%", barColor: "var(--gold-lt)", earnings: "£340", earningsClass: "gold" },
];

export default function Affiliate() {
  return (
    <section className="section" id="affiliate">
      <div className="container">
        <div className="tag mb-8">Earn with PropertyReply</div>
        <h2 className="mb-32">Affiliate Programme</h2>

        <div className="affiliate-hero">
          <div className="grid-2">
            <div>
              <h3 style={{ fontSize: "1.3rem", marginBottom: "10px" }}>
                Earn up to <span className="gold">30% commission</span> per
                referral
              </h3>
              <p
                style={{
                  color: "var(--slate)",
                  fontSize: ".9rem",
                  marginBottom: "18px",
                }}
              >
                Share your unique referral link. Every time someone signs up and
                upgrades, you earn. Track everything in real time.
              </p>
              <div style={{ display: "flex", gap: "24px", flexWrap: "wrap" }}>
                <div>
                  <h4
                    style={{
                      color: "var(--gold)",
                      fontSize: "1.4rem",
                      fontFamily: "'Syne',sans-serif",
                    }}
                  >
                    20%
                  </h4>
                  <p style={{ fontSize: ".78rem", color: "var(--slate)" }}>
                    Commission (Premium)
                  </p>
                </div>
                <div>
                  <h4
                    style={{
                      color: "var(--gold)",
                      fontSize: "1.4rem",
                      fontFamily: "'Syne',sans-serif",
                    }}
                  >
                    30%
                  </h4>
                  <p style={{ fontSize: ".78rem", color: "var(--slate)" }}>
                    Commission (VIP) +5% VIP boost
                  </p>
                </div>
                <div>
                  <h4
                    style={{
                      color: "var(--gold)",
                      fontSize: "1.4rem",
                      fontFamily: "'Syne',sans-serif",
                    }}
                  >
                    30 days
                  </h4>
                  <p style={{ fontSize: ".78rem", color: "var(--slate)" }}>
                    Cookie window
                  </p>
                </div>
              </div>
            </div>
            <div>
              <p
                style={{
                  fontSize: ".82rem",
                  color: "var(--slate)",
                  marginBottom: "8px",
                }}
              >
                YOUR REFERRAL LINK
              </p>
              <div className="ref-link-box">
                <code>https://propertyreply.co.uk/ref/JS92840</code>
                <button className="btn btn-gold btn-sm">Copy</button>
              </div>
              <p
                style={{
                  fontSize: ".78rem",
                  color: "var(--slate)",
                  marginTop: "10px",
                }}
              >
                Share via email, social media, or your property network.
              </p>
            </div>
          </div>
        </div>

        <div className="grid-2">
          <div className="card">
            <h3 className="mb-16">💰 Commission Dashboard</h3>
            <div className="grid-2" style={{ gap: "12px", marginBottom: "20px" }}>
              <div className="metric-box">
                <div className="label">Total Earned</div>
                <div className="value green">£340.00</div>
              </div>
              <div className="metric-box">
                <div className="label">This Month</div>
                <div className="value">£85.00</div>
              </div>
              <div className="metric-box">
                <div className="label">Pending</div>
                <div className="value amber">£29.00</div>
              </div>
              <div className="metric-box">
                <div className="label">Paid Out</div>
                <div className="value">£255.00</div>
              </div>
            </div>
            <div className="divider"></div>
            <h4 style={{ marginBottom: "14px", fontSize: ".9rem" }}>
              Referral History
            </h4>
            <table className="dash-table">
              <thead>
                <tr>
                  <th>Member</th>
                  <th>Plan</th>
                  <th>Commission</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {referralHistory.map((row) => (
                  <tr key={row.member}>
                    <td>{row.member}</td>
                    <td>{row.plan}</td>
                    <td className={`mono ${row.commissionClass}`}>
                      {row.commission}
                    </td>
                    <td>
                      <span
                        className="status-dot"
                        style={{ background: row.statusColor }}
                      ></span>
                      {row.status}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="divider"></div>
            <div className="flex-between">
              <div>
                <p style={{ fontSize: ".8rem", color: "var(--slate)" }}>
                  Minimum payout: £50
                </p>
              </div>
              <button className="btn btn-gold btn-sm">Request Payout</button>
            </div>
          </div>

          <div className="card">
            <h3 className="mb-16">🏆 Top Referrers — June 2026</h3>
            {leaderboard.map((row) => (
              <div className="leaderboard-row" key={row.name}>
                <div className={row.rankClass}>{row.rank}</div>
                <div className="lb-avatar">👤</div>
                <div className="lb-name">{row.name}</div>
                <div className="lb-bar-wrap">
                  <div
                    className="lb-bar"
                    style={{
                      width: row.barWidth,
                      ...(row.barColor ? { background: row.barColor } : {}),
                    }}
                  ></div>
                </div>
                <div
                  className={
                    row.earningsClass
                      ? `lb-earnings ${row.earningsClass}`
                      : "lb-earnings"
                  }
                >
                  {row.earnings}
                </div>
              </div>
            ))}
            <div
              style={{
                marginTop: "20px",
                padding: "14px",
                background: "rgba(212,168,67,.07)",
                borderRadius: "var(--radius)",
                border: "1px solid rgba(212,168,67,.2)",
                fontSize: ".83rem",
                color: "#c0a060",
              }}
            >
              🎯 You&apos;re at #5. Refer 3 more Premium members this month to
              reach #4 and unlock a bonus.
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
