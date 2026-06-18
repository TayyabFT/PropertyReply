const adminNav: { label: string; active?: boolean }[] = [
  { label: "📊 Overview", active: true },
  { label: "🏠 Listings" },
  { label: "👥 Users" },
  { label: "💳 Memberships" },
  { label: "🤝 Affiliates" },
  { label: "⚑ Reports" },
  { label: "⭐ Featured" },
  { label: "✅ KYC / Compliance" },
  { label: "📈 Analytics" },
  { label: "🔔 Notifications" },
  { label: "⚙️ Settings" },
];

const analytics: { label: string; value: string; valueClass?: string; sub: string }[] = [
  { label: "Total Users", value: "18,402", sub: "↑ 342 this month" },
  { label: "Active Listings", value: "2,418", sub: "↑ 88 this month" },
  { label: "Premium Members", value: "1,204", sub: "↑ 67 this month" },
  { label: "Monthly Revenue", value: "£38,900", valueClass: "gold", sub: "↑ 12% vs last month" },
];

type Action = { label: string; className: string };

const listingQueue: {
  property: string;
  submittedBy: string;
  price: string;
  discount: string;
  submitted: string;
  kycLabel: string;
  kycBadge: string;
  actions: Action[];
}[] = [
  {
    property: "Commercial Unit, Leeds",
    submittedBy: "J. Smith",
    price: "£89k",
    discount: "41%",
    submitted: "09 Jun",
    kycLabel: "✓ Verified",
    kycBadge: "badge-green",
    actions: [
      { label: "✓ Approve", className: "btn btn-green btn-sm" },
      { label: "👁 View", className: "btn btn-outline btn-sm" },
      { label: "✕ Reject", className: "btn btn-red btn-sm" },
    ],
  },
  {
    property: "Land, Nottingham",
    submittedBy: "A. Patel",
    price: "£145k",
    discount: "35%",
    submitted: "08 Jun",
    kycLabel: "⏳ Pending",
    kycBadge: "badge-amber",
    actions: [
      { label: "✓ Approve", className: "btn btn-green btn-sm" },
      { label: "👁 View", className: "btn btn-outline btn-sm" },
      { label: "✕ Reject", className: "btn btn-red btn-sm" },
    ],
  },
  {
    property: "2-Bed Flat, London",
    submittedBy: "Unknown123",
    price: "£50k",
    discount: "60%",
    submitted: "07 Jun",
    kycLabel: "✗ Unverified",
    kycBadge: "badge-red",
    actions: [
      { label: "👁 View", className: "btn btn-outline btn-sm" },
      { label: "🚫 Spam", className: "btn btn-red btn-sm" },
    ],
  },
];

const users: {
  name: string;
  email: string;
  plan: string;
  planBadge: string;
  kycLabel: string;
  kycBadge: string;
  joined: string;
  statusColor: string;
  status: string;
  actions: Action[];
}[] = [
  {
    name: "James Smith",
    email: "james@smith.co.uk",
    plan: "Premium",
    planBadge: "badge-green",
    kycLabel: "✓ Verified",
    kycBadge: "badge-green",
    joined: "Jan 2025",
    statusColor: "var(--green)",
    status: "Active",
    actions: [
      { label: "Edit", className: "btn btn-outline btn-sm" },
      { label: "Suspend", className: "btn btn-red btn-sm" },
    ],
  },
  {
    name: "A. Patel",
    email: "a.patel@email.co.uk",
    plan: "Free",
    planBadge: "",
    kycLabel: "⏳ Pending",
    kycBadge: "badge-amber",
    joined: "May 2026",
    statusColor: "var(--green)",
    status: "Active",
    actions: [
      { label: "Edit", className: "btn btn-outline btn-sm" },
      { label: "Suspend", className: "btn btn-red btn-sm" },
    ],
  },
  {
    name: "Unknown123",
    email: "spam@temp.io",
    plan: "Free",
    planBadge: "",
    kycLabel: "✗ Failed",
    kycBadge: "badge-red",
    joined: "Jun 2026",
    statusColor: "var(--red)",
    status: "Flagged",
    actions: [
      { label: "Review", className: "btn btn-outline btn-sm" },
      { label: "Ban", className: "btn btn-red btn-sm" },
    ],
  },
];

const payouts: {
  affiliate: string;
  referrals: string;
  earned: string;
  pending: string;
}[] = [
  { affiliate: "M. Thompson", referrals: "62", earned: "£1,240", pending: "£320" },
  { affiliate: "J. Smith", referrals: "12", earned: "£340", pending: "£85" },
];

const reports: {
  bg: string;
  border: string;
  title: string;
  detail: string;
}[] = [
  {
    bg: "rgba(232,64,64,.07)",
    border: "1px solid rgba(232,64,64,.2)",
    title: '2-Bed Flat, London — "Too good to be true"',
    detail:
      "Reported by: 3 users · Reason: Suspected fraudulent listing · Submitted by: Unknown123",
  },
  {
    bg: "rgba(240,160,32,.07)",
    border: "1px solid rgba(240,160,32,.2)",
    title: 'Studio Flat, London — "Duplicate listing"',
    detail: "Reported by: 1 user · Reason: Duplicate · Submitted by: K. Brown",
  },
];

export default function AdminPanel() {
  return (
    <section className="section section-alt" id="admin">
      <div className="container">
        <div className="flex-between mb-32">
          <div>
            <div className="tag mb-8">Admin Only</div>
            <h2>Admin Panel</h2>
          </div>
          <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
            <span className="chip">🔴 12 Pending Listings</span>
            <span className="chip">🟡 3 Reports</span>
            <span className="chip">🟢 1,840 Active Users</span>
          </div>
        </div>

        <div className="admin-layout">
          <div className="admin-sidebar">
            {adminNav.map((item) => (
              <div
                className={
                  item.active ? "admin-nav-item active" : "admin-nav-item"
                }
                key={item.label}
              >
                {item.label}
              </div>
            ))}
          </div>

          <div>
            <div className="admin-card">
              <div className="admin-card-header">
                <h3>📈 Site Analytics — June 2026</h3>
                <select style={{ width: "auto", padding: "7px 12px" }}>
                  <option>Last 30 days</option>
                  <option>Last 7 days</option>
                  <option>All time</option>
                </select>
              </div>
              <div className="admin-card-body">
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(4,1fr)",
                    gap: "14px",
                  }}
                >
                  {analytics.map((item) => (
                    <div className="metric-box" key={item.label}>
                      <div className="label">{item.label}</div>
                      <div
                        className={
                          item.valueClass
                            ? `value ${item.valueClass}`
                            : "value"
                        }
                      >
                        {item.value}
                      </div>
                      <div className="sub" style={{ color: "var(--green)" }}>
                        {item.sub}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="admin-card">
              <div className="admin-card-header">
                <h3>🏠 Listing Approval Queue (12)</h3>
                <div style={{ display: "flex", gap: "8px" }}>
                  <button className="btn btn-outline btn-sm">Approve All</button>
                  <button
                    className="btn btn-sm"
                    style={{
                      background: "rgba(232,64,64,.15)",
                      color: "var(--red)",
                      border: "1px solid rgba(232,64,64,.3)",
                    }}
                  >
                    Reject Selected
                  </button>
                </div>
              </div>
              <div className="admin-card-body">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>
                        <input type="checkbox" />
                      </th>
                      <th>Property</th>
                      <th>Submitted By</th>
                      <th>Price</th>
                      <th>Discount</th>
                      <th>Submitted</th>
                      <th>KYC</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {listingQueue.map((row) => (
                      <tr key={row.property}>
                        <td>
                          <input type="checkbox" />
                        </td>
                        <td>{row.property}</td>
                        <td>{row.submittedBy}</td>
                        <td className="mono">{row.price}</td>
                        <td>
                          <span className="discount-pill">{row.discount}</span>
                        </td>
                        <td>{row.submitted}</td>
                        <td>
                          <span className={`tag ${row.kycBadge}`}>
                            {row.kycLabel}
                          </span>
                        </td>
                        <td>
                          <div className="action-btns">
                            {row.actions.map((action) => (
                              <button
                                className={action.className}
                                key={action.label}
                              >
                                {action.label}
                              </button>
                            ))}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="admin-card">
              <div className="admin-card-header">
                <h3>👥 User Management</h3>
                <div style={{ display: "flex", gap: "8px" }}>
                  <input
                    type="text"
                    placeholder="Search users…"
                    style={{ width: "200px", padding: "8px 12px" }}
                  />
                  <select style={{ width: "auto", padding: "7px 12px" }}>
                    <option>All Plans</option>
                    <option>Free</option>
                    <option>Premium</option>
                    <option>VIP</option>
                  </select>
                </div>
              </div>
              <div className="admin-card-body">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>User</th>
                      <th>Email</th>
                      <th>Plan</th>
                      <th>KYC</th>
                      <th>Joined</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map((row) => (
                      <tr key={row.email}>
                        <td>
                          <strong>{row.name}</strong>
                        </td>
                        <td>{row.email}</td>
                        <td>
                          <span
                            className={
                              row.planBadge ? `tag ${row.planBadge}` : "tag"
                            }
                          >
                            {row.plan}
                          </span>
                        </td>
                        <td>
                          <span className={`tag ${row.kycBadge}`}>
                            {row.kycLabel}
                          </span>
                        </td>
                        <td>{row.joined}</td>
                        <td>
                          <span
                            className="status-dot"
                            style={{ background: row.statusColor }}
                          ></span>
                          {row.status}
                        </td>
                        <td>
                          <div className="action-btns">
                            {row.actions.map((action) => (
                              <button
                                className={action.className}
                                key={action.label}
                              >
                                {action.label}
                              </button>
                            ))}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="admin-card">
              <div className="admin-card-header">
                <h3>🤝 Affiliate Payout Management</h3>
                <button className="btn btn-gold btn-sm">
                  Process All Payouts
                </button>
              </div>
              <div className="admin-card-body">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>Affiliate</th>
                      <th>Referrals</th>
                      <th>Total Earned</th>
                      <th>Pending</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {payouts.map((row) => (
                      <tr key={row.affiliate}>
                        <td>{row.affiliate}</td>
                        <td>{row.referrals}</td>
                        <td className="mono green">{row.earned}</td>
                        <td className="mono amber">{row.pending}</td>
                        <td>
                          <span className="tag badge-amber">
                            Pending Payout
                          </span>
                        </td>
                        <td>
                          <button className="btn btn-gold btn-sm">
                            Pay Out
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="admin-card">
              <div className="admin-card-header">
                <h3>⚑ Reported Listings (3)</h3>
              </div>
              <div className="admin-card-body">
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "12px",
                  }}
                >
                  {reports.map((report) => (
                    <div
                      key={report.title}
                      style={{
                        padding: "14px",
                        background: report.bg,
                        border: report.border,
                        borderRadius: "var(--radius)",
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        flexWrap: "wrap",
                        gap: "10px",
                      }}
                    >
                      <div>
                        <p style={{ fontWeight: 600, fontSize: ".88rem" }}>
                          {report.title}
                        </p>
                        <p style={{ fontSize: ".78rem", color: "var(--slate)" }}>
                          {report.detail}
                        </p>
                      </div>
                      <div className="action-btns">
                        <button className="btn btn-outline btn-sm">
                          👁 Review
                        </button>
                        <button className="btn btn-red btn-sm">🗑 Remove</button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
