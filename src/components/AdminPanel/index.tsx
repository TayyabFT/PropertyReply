"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth";
import { adminApi, type AdminStats } from "@/lib/api";
import { AdminPage, errorMessage } from "./shared";

/** Admin landing page: key numbers and shortcuts to each admin area. */
export default function AdminOverview() {
  const { token } = useAuth();
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!token) return;
    let cancelled = false;
    adminApi
      .getStats(token)
      .then((res) => { if (!cancelled) setStats(res.data); })
      .catch((err) => { if (!cancelled) setError(errorMessage(err, "Failed to load admin stats.")); });
    return () => { cancelled = true; };
  }, [token]);

  const shortcuts = [
    { href: "/app/admin/queue", label: "🏠 Listing Queue", sub: `${stats?.chips.pendingListings ?? 0} waiting for review` },
    { href: "/app/admin/reports", label: "⚑ Reports", sub: `${stats?.chips.openReports ?? 0} open` },
    { href: "/app/admin/users", label: "👥 Users", sub: `${(stats?.chips.activeUsers ?? 0).toLocaleString("en-GB")} active` },
    { href: "/app/admin/listings", label: "🏷 Live Listings", sub: "Mark as sold" },
    { href: "/app/admin/affiliates", label: "🤝 Affiliates", sub: "Commissions and payouts" },
    { href: "/app/admin/founders", label: "🏛 Founders Club", sub: "Invite codes" },
    { href: "/app/admin/partner-invites", label: "✉ Invited Partners", sub: "Two-month offers" },
    { href: "/app/admin/admins", label: "🛡 Admins", sub: "Admin accounts" },
  ];

  return (
    <AdminPage title="Overview" description="Site activity at a glance. Use the sidebar or the shortcuts below to manage each area.">
      {error && <p className="alert alert-error" role="alert">{error}</p>}

      <div className="admin-card">
        <div className="admin-card-header"><h3>📈 Site Analytics</h3></div>
        <div className="admin-card-body">
          {!stats && !error ? <p className="muted">Loading…</p> : (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "14px" }}>
              {(stats?.cards ?? []).map((item) => (
                <div className="metric-box" key={item.label}>
                  <div className="label">{item.label}</div>
                  <div className={item.valueClass ? `value ${item.valueClass}` : "value"}>{item.value}</div>
                  <div className="sub" style={{ color: "var(--slate)" }}>{item.sub}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="admin-card">
        <div className="admin-card-header"><h3>Manage</h3></div>
        <div className="admin-card-body">
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "12px" }}>
            {shortcuts.map((item) => (
              <Link key={item.href} href={item.href} className="metric-box" style={{ textDecoration: "none", color: "inherit" }}>
                <div style={{ fontWeight: 600 }}>{item.label}</div>
                <div className="sub" style={{ color: "var(--slate)", marginTop: "4px" }}>{item.sub}</div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </AdminPage>
  );
}
