import Link from "next/link";

const stats: { label: string; value: string; valueClass?: string; change: string }[] = [
  { label: "Saved Deals", value: "24", valueClass: "gold", change: "↑ 3 this week" },
  { label: "Submissions", value: "7", change: "5 live, 2 pending" },
  { label: "Affiliate Earnings", value: "£340", valueClass: "green", change: "↑ £85 this month" },
  { label: "Referrals", value: "12", change: "↑ 2 this week" },
];

const submissions: {
  property: string;
  location: string;
  price: string;
  discount: string;
  statusColor: string;
  status: string;
  submitted: string;
}[] = [
  { property: "3-Bed Terrace", location: "Manchester", price: "£118k", discount: "34%", statusColor: "var(--green)", status: "Live", submitted: "02 Jun 26" },
  { property: "5-Bed HMO", location: "Birmingham", price: "£195k", discount: "28%", statusColor: "var(--green)", status: "Live", submitted: "28 May 26" },
  { property: "Commercial Unit", location: "Leeds", price: "£89k", discount: "41%", statusColor: "var(--amber)", status: "Pending Review", submitted: "09 Jun 26" },
  { property: "2-Bed Flat", location: "Sheffield", price: "£72k", discount: "22%", statusColor: "var(--red)", status: "Rejected", submitted: "01 Jun 26" },
];

const savedProperties: { title: string; meta: string }[] = [
  { title: "3-Bed Terrace — Manchester", meta: "£118k asking · 34% below market · Added 2h ago" },
  { title: "4-Bed Detached — Liverpool", meta: "£162k asking · 26% below market · Saved yesterday" },
  { title: "5-Bed HMO — Birmingham", meta: "£195k asking · 28% below market · Saved 3d ago" },
];

const savedRowStyle = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  padding: "12px",
  background: "rgba(255,255,255,.04)",
  borderRadius: "var(--radius)",
  border: "1px solid rgba(255,255,255,.06)",
} as const;

export default function Dashboard() {
  return (
    <section className="section section-dark" id="dashboard">
      <div className="container">
        <div className="page-head">
          <h1>Welcome back, James 👋</h1>
          <p>Here&apos;s what&apos;s happening across your account today.</p>
        </div>

        <div className="dashboard-main">
          <div className="dash-stats">
            {stats.map((stat) => (
              <div className="dash-stat" key={stat.label}>
                <div className="ds-label">{stat.label}</div>
                <div
                  className={
                    stat.valueClass ? `ds-value ${stat.valueClass}` : "ds-value"
                  }
                >
                  {stat.value}
                </div>
                <div className="ds-change up">{stat.change}</div>
              </div>
            ))}
          </div>

          <div className="card">
            <div className="flex-between mb-16">
              <h3>💳 Membership Status</h3>
              <span className="tag badge-green">Premium · Active</span>
            </div>
            <div className="grid-3" style={{ gap: "14px" }}>
              <div>
                <p style={{ fontSize: ".75rem", color: "var(--slate)" }}>Plan</p>
                <p style={{ fontWeight: 600 }}>Premium Monthly</p>
              </div>
              <div>
                <p style={{ fontSize: ".75rem", color: "var(--slate)" }}>
                  Renews
                </p>
                <p style={{ fontWeight: 600 }}>12 July 2026</p>
              </div>
              <div>
                <p style={{ fontSize: ".75rem", color: "var(--slate)" }}>
                  Price
                </p>
                <p style={{ fontWeight: 600 }}>£29.00 / month</p>
              </div>
            </div>
            <div className="divider"></div>
            <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
              <Link href="/app/membership" className="btn btn-gold btn-sm">
                Upgrade to VIP
              </Link>
              <button className="btn btn-outline btn-sm">Manage Billing</button>
              <button
                className="btn btn-outline btn-sm"
                style={{
                  color: "var(--red)",
                  borderColor: "rgba(232,64,64,.3)",
                }}
              >
                Cancel
              </button>
            </div>
          </div>

          <div className="card">
            <div className="flex-between mb-16">
              <h3>📝 My Submissions</h3>
              <Link href="/app/submit" className="btn btn-gold btn-sm">
                + Submit New
              </Link>
            </div>
            <table className="dash-table">
              <thead>
                <tr>
                  <th>Property</th>
                  <th>Location</th>
                  <th>Price</th>
                  <th>Discount</th>
                  <th>Status</th>
                  <th>Submitted</th>
                </tr>
              </thead>
              <tbody>
                {submissions.map((row) => (
                  <tr key={row.property + row.submitted}>
                    <td>{row.property}</td>
                    <td>{row.location}</td>
                    <td className="mono">{row.price}</td>
                    <td>
                      <span className="discount-pill">{row.discount}</span>
                    </td>
                    <td>
                      <span
                        className="status-dot"
                        style={{ background: row.statusColor }}
                      ></span>
                      {row.status}
                    </td>
                    <td>{row.submitted}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="card">
            <div className="flex-between mb-16">
              <h3>❤️ Saved & Favourite Properties</h3>
              <span style={{ fontSize: ".8rem", color: "var(--slate)" }}>
                24 saved
              </span>
            </div>
            <div
              style={{ display: "flex", flexDirection: "column", gap: "10px" }}
            >
              {savedProperties.map((item) => (
                <div style={savedRowStyle} key={item.title}>
                  <div>
                    <p style={{ fontWeight: 600, fontSize: ".9rem" }}>
                      {item.title}
                    </p>
                    <p style={{ fontSize: ".78rem", color: "var(--slate)" }}>
                      {item.meta}
                    </p>
                  </div>
                  <div style={{ display: "flex", gap: "8px" }}>
                    <button className="btn btn-gold btn-sm">View</button>
                    <button className="btn btn-outline btn-sm">✕</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
