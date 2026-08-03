"use client";

import { useCallback, useEffect, useState } from "react";
import { useAuth } from "@/lib/auth";
import {
  adminApi,
  ApiRequestError,
  type AdminStats,
  type AdminSubmission,
  type AdminUser,
  type AdminReport,
  type AdminListing,
} from "@/lib/api";

const adminNav: { label: string; target: string }[] = [
  { label: "📊 Overview", target: "admin-analytics" },
  { label: "🏠 Listing Queue", target: "admin-queue" },
  { label: "👥 Users", target: "admin-users" },
  { label: "🏷 Live Listings", target: "admin-listings" },
  { label: "⚑ Reports", target: "admin-reports" },
];

const reasonLabels: Record<string, string> = {
  misleading: "Misleading / Too good to be true",
  spam: "Spam",
  duplicate: "Duplicate listing",
  inaccurate: "Inaccurate details",
  other: "Other",
};

function scrollToSection(id: string) {
  document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
}

export default function AdminPanel() {
  const { token } = useAuth();

  const [stats, setStats] = useState<AdminStats | null>(null);
  const [submissions, setSubmissions] = useState<AdminSubmission[]>([]);
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [reports, setReports] = useState<AdminReport[]>([]);
  const [listings, setListings] = useState<AdminListing[]>([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  const [userSearch, setUserSearch] = useState("");
  const [planFilter, setPlanFilter] = useState("");

  const showToast = useCallback((message: string) => {
    setToast(message);
    window.setTimeout(() => setToast(null), 3000);
  }, []);

  const loadStats = useCallback(
    async (authToken: string) => {
      const res = await adminApi.getStats(authToken);
      setStats(res.data);
    },
    [],
  );

  const loadUsers = useCallback(
    async (authToken: string, search = "", plan = "") => {
      const res = await adminApi.getUsers(authToken, { search, plan });
      setUsers(res.data);
    },
    [],
  );

  const loadAll = useCallback(
    async (authToken: string) => {
      setLoading(true);
      setError(null);
      try {
        const [statsRes, subsRes, usersRes, reportsRes, listingsRes] = await Promise.all([
          adminApi.getStats(authToken),
          adminApi.getSubmissions(authToken, "pending"),
          adminApi.getUsers(authToken),
          adminApi.getReports(authToken),
          adminApi.getListings(authToken),
        ]);
        setStats(statsRes.data);
        setSubmissions(subsRes.data);
        setUsers(usersRes.data);
        setReports(reportsRes.data);
        setListings(listingsRes.data);
      } catch (err) {
        setError(
          err instanceof ApiRequestError
            ? err.message
            : "Failed to load admin data.",
        );
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  useEffect(() => {
    if (!token) return;
    loadAll(token);
  }, [token, loadAll]);

  const handleApprove = async (id: string) => {
    if (!token) return;
    setBusyId(id);
    try {
      await adminApi.approveSubmission(token, id);
      setSubmissions((prev) => prev.filter((s) => s.id !== id));
      await loadStats(token);
      showToast("Submission approved and published to Browse Deals.");
    } catch (err) {
      showToast(
        err instanceof ApiRequestError ? err.message : "Could not approve.",
      );
    } finally {
      setBusyId(null);
    }
  };

  const handleReject = async (id: string) => {
    if (!token) return;
    setBusyId(id);
    try {
      await adminApi.rejectSubmission(token, id);
      setSubmissions((prev) => prev.filter((s) => s.id !== id));
      await loadStats(token);
      showToast("Submission rejected.");
    } catch (err) {
      showToast(
        err instanceof ApiRequestError ? err.message : "Could not reject.",
      );
    } finally {
      setBusyId(null);
    }
  };

  const handleUserSearch = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!token) return;
    await loadUsers(token, userSearch, planFilter);
  };

  const handlePlanFilter = async (plan: string) => {
    setPlanFilter(plan);
    if (!token) return;
    await loadUsers(token, userSearch, plan);
  };

  const updateUser = async (
    id: string,
    body: { plan?: string; status?: string; kycStatus?: string },
    successMessage: string,
  ) => {
    if (!token) return;
    setBusyId(id);
    try {
      const res = await adminApi.updateUser(token, id, body);
      setUsers((prev) => prev.map((u) => (u.id === id ? res.data : u)));
      await loadStats(token);
      showToast(successMessage);
    } catch (err) {
      showToast(
        err instanceof ApiRequestError ? err.message : "Could not update user.",
      );
    } finally {
      setBusyId(null);
    }
  };

  const handleResolveReport = async (id: string) => {
    if (!token) return;
    setBusyId(id);
    try {
      await adminApi.resolveReport(token, id);
      setReports((prev) => prev.filter((r) => r.id !== id));
      await loadStats(token);
      showToast("Report marked resolved.");
    } catch (err) {
      showToast(
        err instanceof ApiRequestError ? err.message : "Could not resolve report.",
      );
    } finally {
      setBusyId(null);
    }
  };

  const handleRemoveListing = async (report: AdminReport) => {
    if (!token || !report.listingId) {
      // No live listing attached; just resolve the report.
      await handleResolveReport(report.id);
      return;
    }
    setBusyId(report.id);
    try {
      await adminApi.removeListing(token, report.listingId);
      setReports((prev) => prev.filter((r) => r.id !== report.id));
      await loadStats(token);
      showToast("Listing removed and report resolved.");
    } catch (err) {
      showToast(
        err instanceof ApiRequestError ? err.message : "Could not remove listing.",
      );
    } finally {
      setBusyId(null);
    }
  };

  const handleMarkSold = async (listing: AdminListing) => {
    if (!token) return;
    const input = window.prompt(
      `Enter the final sale price for "${listing.title}" (GBP):`,
    );
    if (!input) return;
    const salePrice = Number(input.replace(/[^0-9.]/g, ""));
    if (!salePrice || salePrice <= 0) {
      showToast("Please enter a valid sale price.");
      return;
    }

    setBusyId(listing.id);
    try {
      await adminApi.markSold(token, listing.id, salePrice);
      if (token) {
        const res = await adminApi.getListings(token);
        setListings(res.data);
      }
      showToast("Listing marked as sold — a 10% commission invoice was sent.");
    } catch (err) {
      showToast(
        err instanceof ApiRequestError ? err.message : "Could not mark listing sold.",
      );
    } finally {
      setBusyId(null);
    }
  };

  if (loading) {
    return (
      <section className="section section-alt" id="admin">
        <div className="container">
          <div className="page-head">
            <h2>Admin Panel</h2>
            <p>Loading admin data…</p>
          </div>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="section section-alt" id="admin">
        <div className="container">
          <div className="page-head">
            <h2>Admin Panel</h2>
            <p style={{ color: "var(--red)" }}>{error}</p>
          </div>
          <button
            className="btn btn-outline"
            onClick={() => token && loadAll(token)}
          >
            Retry
          </button>
        </div>
      </section>
    );
  }

  return (
    <section className="section section-alt" id="admin">
      <div className="container">
        {toast && (
          <div
            style={{
              position: "fixed",
              top: "20px",
              right: "20px",
              zIndex: 1000,
              background: "var(--ink, #0f172a)",
              color: "#fff",
              padding: "12px 18px",
              borderRadius: "var(--radius)",
              boxShadow: "0 8px 24px rgba(0,0,0,.2)",
              maxWidth: "320px",
              fontSize: ".85rem",
            }}
          >
            {toast}
          </div>
        )}

        <div className="flex-between mb-32">
          <div>
            <div className="tag mb-8">Admin Only</div>
            <h2>Admin Panel</h2>
          </div>
          <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
            <span className="chip">
              🔴 {stats?.chips.pendingListings ?? 0} Pending Listings
            </span>
            <span className="chip">🟡 {stats?.chips.openReports ?? 0} Reports</span>
            <span className="chip">
              🟢 {(stats?.chips.activeUsers ?? 0).toLocaleString("en-GB")} Active Users
            </span>
          </div>
        </div>

        <div className="admin-layout">
          <div className="admin-sidebar">
            {adminNav.map((item) => (
              <button
                type="button"
                className="admin-nav-item"
                key={item.label}
                onClick={() => scrollToSection(item.target)}
                style={{
                  width: "100%",
                  textAlign: "left",
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                }}
              >
                {item.label}
              </button>
            ))}
          </div>

          <div>
            <div className="admin-card" id="admin-analytics">
              <div className="admin-card-header">
                <h3>📈 Site Analytics</h3>
              </div>
              <div className="admin-card-body">
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(4,1fr)",
                    gap: "14px",
                  }}
                >
                  {(stats?.cards ?? []).map((item) => (
                    <div className="metric-box" key={item.label}>
                      <div className="label">{item.label}</div>
                      <div
                        className={item.valueClass ? `value ${item.valueClass}` : "value"}
                      >
                        {item.value}
                      </div>
                      <div className="sub" style={{ color: "var(--slate)" }}>
                        {item.sub}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="admin-card" id="admin-queue">
              <div className="admin-card-header">
                <h3>🏠 Listing Approval Queue ({submissions.length})</h3>
              </div>
              <div className="admin-card-body">
                {submissions.length === 0 ? (
                  <p className="muted">No pending submissions. All caught up! 🎉</p>
                ) : (
                  <table className="admin-table">
                    <thead>
                      <tr>
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
                      {submissions.map((row) => (
                        <tr key={row.id}>
                          <td>
                            <strong>{row.property}</strong>
                            <div style={{ fontSize: ".74rem", color: "var(--slate)" }}>
                              {row.location}
                            </div>
                          </td>
                          <td>{row.submittedBy}</td>
                          <td className="mono">{row.price}</td>
                          <td>
                            <span className="discount-pill">{row.discount}</span>
                          </td>
                          <td>{row.submitted}</td>
                          <td>
                            <span className={`tag ${row.kycBadge}`}>{row.kycLabel}</span>
                          </td>
                          <td>
                            <div className="action-btns">
                              <button
                                className="btn btn-green btn-sm"
                                disabled={busyId === row.id}
                                onClick={() => handleApprove(row.id)}
                              >
                                ✓ Approve
                              </button>
                              <button
                                className="btn btn-red btn-sm"
                                disabled={busyId === row.id}
                                onClick={() => handleReject(row.id)}
                              >
                                ✕ Reject
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </div>

            <div className="admin-card" id="admin-users">
              <div className="admin-card-header">
                <h3>👥 User Management</h3>
                <form
                  onSubmit={handleUserSearch}
                  style={{ display: "flex", gap: "8px" }}
                >
                  <input
                    type="text"
                    placeholder="Search users…"
                    value={userSearch}
                    onChange={(e) => setUserSearch(e.target.value)}
                    style={{ width: "200px", padding: "8px 12px" }}
                  />
                  <select
                    value={planFilter}
                    onChange={(e) => handlePlanFilter(e.target.value)}
                    style={{ width: "auto", padding: "7px 12px" }}
                  >
                    <option value="">All Plans</option>
                    <option value="Premium">Premium</option>
                    <option value="VIP">VIP</option>
                    <option value="Ultra">Ultra</option>
                  </select>
                  <button className="btn btn-outline btn-sm" type="submit">
                    Search
                  </button>
                </form>
              </div>
              <div className="admin-card-body">
                {users.length === 0 ? (
                  <p className="muted">No users found.</p>
                ) : (
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
                        <tr key={row.id}>
                          <td>
                            <strong>{row.name}</strong>
                          </td>
                          <td>{row.email}</td>
                          <td>
                            <select
                              value={row.plan}
                              disabled={busyId === row.id}
                              onChange={(e) =>
                                updateUser(
                                  row.id,
                                  { plan: e.target.value },
                                  `Plan updated to ${e.target.value}.`,
                                )
                              }
                              style={{ padding: "4px 8px", fontSize: ".78rem" }}
                            >
                              <option value="Premium">Premium</option>
                              <option value="VIP">VIP</option>
                              <option value="Ultra">Ultra</option>
                            </select>
                          </td>
                          <td>
                            <span className={`tag ${row.kycBadge}`}>{row.kycLabel}</span>
                          </td>
                          <td>{row.joined}</td>
                          <td>
                            <span
                              className="status-dot"
                              style={{ background: row.statusColor }}
                            ></span>
                            {row.statusLabel}
                          </td>
                          <td>
                            <div className="action-btns">
                              {row.kycStatus !== "approved" && (
                                <button
                                  className="btn btn-outline btn-sm"
                                  disabled={busyId === row.id}
                                  onClick={() =>
                                    updateUser(
                                      row.id,
                                      { kycStatus: "approved" },
                                      "KYC approved.",
                                    )
                                  }
                                >
                                  Approve KYC
                                </button>
                              )}
                              {row.status === "active" ? (
                                <button
                                  className="btn btn-red btn-sm"
                                  disabled={busyId === row.id}
                                  onClick={() =>
                                    updateUser(
                                      row.id,
                                      { status: "suspended" },
                                      "User suspended.",
                                    )
                                  }
                                >
                                  Suspend
                                </button>
                              ) : (
                                <button
                                  className="btn btn-green btn-sm"
                                  disabled={busyId === row.id}
                                  onClick={() =>
                                    updateUser(
                                      row.id,
                                      { status: "active" },
                                      "User reactivated.",
                                    )
                                  }
                                >
                                  Activate
                                </button>
                              )}
                              <button
                                className="btn btn-red btn-sm"
                                disabled={busyId === row.id}
                                onClick={() =>
                                  updateUser(row.id, { status: "banned" }, "User banned.")
                                }
                              >
                                Ban
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </div>

            <div className="admin-card" id="admin-listings">
              <div className="admin-card-header">
                <h3>🏷 Live Listings — Mark as Sold (10% commission)</h3>
              </div>
              <div className="admin-card-body">
                {listings.length === 0 ? (
                  <p className="muted">No live listings yet.</p>
                ) : (
                  <table className="admin-table">
                    <thead>
                      <tr>
                        <th>Property</th>
                        <th>Asking Price</th>
                        <th>Status</th>
                        <th>Sale Price</th>
                        <th>Commission (10%)</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {listings.map((row) => (
                        <tr key={row.id}>
                          <td>
                            <strong>{row.title}</strong>
                            <div style={{ fontSize: ".74rem", color: "var(--slate)" }}>
                              {row.location}
                            </div>
                          </td>
                          <td className="mono">{row.askingPrice}</td>
                          <td>
                            <span
                              className={row.status === "sold" ? "tag badge-green" : "tag"}
                            >
                              {row.status}
                            </span>
                          </td>
                          <td className="mono">{row.salePrice || "—"}</td>
                          <td className="mono amber">
                            {row.commissionGBP
                              ? `${row.commissionGBP} (${row.commissionInvoiceStatus})`
                              : "—"}
                          </td>
                          <td>
                            {row.status !== "sold" && (
                              <button
                                className="btn btn-gold btn-sm"
                                disabled={busyId === row.id}
                                onClick={() => handleMarkSold(row)}
                              >
                                Mark as Sold
                              </button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </div>

            <div className="admin-card" id="admin-reports">
              <div className="admin-card-header">
                <h3>⚑ Reported Listings ({reports.length})</h3>
              </div>
              <div className="admin-card-body">
                {reports.length === 0 ? (
                  <p className="muted">No open reports.</p>
                ) : (
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      gap: "12px",
                    }}
                  >
                    {reports.map((report) => (
                      <div
                        key={report.id}
                        style={{
                          padding: "14px",
                          background: "rgba(232,64,64,.07)",
                          border: "1px solid rgba(232,64,64,.2)",
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
                            {report.location ? ` — ${report.location}` : ""}
                          </p>
                          <p style={{ fontSize: ".78rem", color: "var(--slate)" }}>
                            Reported by: {report.reportedBy} · Reason:{" "}
                            {reasonLabels[report.reason] || report.reason}
                            {report.details ? ` · "${report.details}"` : ""}
                          </p>
                        </div>
                        <div className="action-btns">
                          <button
                            className="btn btn-outline btn-sm"
                            disabled={busyId === report.id}
                            onClick={() => handleResolveReport(report.id)}
                          >
                            ✓ Resolve
                          </button>
                          <button
                            className="btn btn-red btn-sm"
                            disabled={busyId === report.id}
                            onClick={() => handleRemoveListing(report)}
                          >
                            🗑 Remove Listing
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
