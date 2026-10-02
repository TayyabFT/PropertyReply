"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth";
import {
  overviewApi,
  type OverviewData,
  ApiRequestError,
} from "@/lib/api";

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
  const { user, token } = useAuth();
  const router = useRouter();
  const firstName = user?.firstName || user?.name?.split(" ")[0] || "there";

  const [overview, setOverview] = useState<OverviewData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [removingId, setRemovingId] = useState<string | null>(null);

  async function handleRemoveSaved(id: string) {
    if (!token) return;
    setRemovingId(id);
    try {
      await overviewApi.removeSaved(token, id);
      setOverview((current) =>
        current
          ? {
              ...current,
              savedProperties: current.savedProperties.filter(
                (item) => item.id !== id,
              ),
              savedCount: Math.max(0, current.savedCount - 1),
            }
          : current,
      );
    } catch (err) {
      setError(
        err instanceof ApiRequestError
          ? err.message
          : "Unable to remove saved property.",
      );
    } finally {
      setRemovingId(null);
    }
  }

  useEffect(() => {
    if (!token) return;

    let cancelled = false;

    async function loadOverview() {
      setLoading(true);
      setError(null);

      try {
        const response = await overviewApi.get(token!);
        if (!cancelled) {
          setOverview(response.data);
        }
      } catch (err) {
        if (!cancelled) {
          const message =
            err instanceof ApiRequestError
              ? err.message
              : "Failed to load dashboard data.";
          setError(message);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    loadOverview();

    return () => {
      cancelled = true;
    };
  }, [token]);

  if (loading) {
    return (
      <section className="section section-dark" id="dashboard">
        <div className="container">
          <div className="page-head">
            <h1>Welcome back, {firstName} 👋</h1>
            <p>Loading your dashboard…</p>
          </div>
        </div>
      </section>
    );
  }

  if (error || !overview) {
    return (
      <section className="section section-dark" id="dashboard">
        <div className="container">
          <div className="page-head">
            <h1>Welcome back, {firstName} 👋</h1>
            <p style={{ color: "var(--red)" }}>
              {error || "Unable to load dashboard data."}
            </p>
          </div>
        </div>
      </section>
    );
  }

  const { stats, submissions, savedProperties, savedCount } = overview;

  // Prefer live auth trial state so Membership Status never shows paid Premium
  // for complimentary / free-trial accounts (even if overview payload is stale).
  const membership = (() => {
    const fromApi = overview.membership;
    if (user?.hasPaidPlan) return fromApi;

    const trialEndsAt = user?.trialEndsAt ? new Date(user.trialEndsAt) : null;
    const trialStillValid = Boolean(trialEndsAt && trialEndsAt > new Date());
    const trialActive =
      Boolean(user?.onTrial) ||
      Boolean(fromApi.onTrial) ||
      user?.subscriptionStatus === "trialing" ||
      (Boolean(user?.plan) && trialStillValid) ||
      // Unpaid account that still has a plan — treat as free trial, never paid Premium
      (Boolean(user?.plan) && user?.hasPaidPlan === false);

    if (!trialActive) return fromApi;

    const endsLabel = trialEndsAt
      ? trialEndsAt.toLocaleDateString("en-GB", {
          day: "numeric",
          month: "long",
          year: "numeric",
        })
      : fromApi.onTrial
        ? fromApi.renewsAt
        : "—";

    return {
      ...fromApi,
      plan: "Free Trial",
      status: "Trialing",
      billingLabel: "Free Trial",
      renewsAt: endsLabel,
      price: "£0.00 — 7-day free trial",
      badgeLabel: "Free Trial · Active",
      badgeClass: "tag badge-blue",
      onTrial: true,
    };
  })();

  return (
    <section className="section section-dark" id="dashboard">
      <div className="container">
        <div className="page-head">
          <h1>Welcome back, {firstName} 👋</h1>
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
                <div
                  className={
                    stat.trend === "up"
                      ? "ds-change up"
                      : stat.trend === "down"
                        ? "ds-change down"
                        : "ds-change"
                  }
                >
                  {stat.change}
                </div>
              </div>
            ))}
          </div>

          <div className="card">
            <div className="flex-between mb-16">
              <h3>💳 Membership Status</h3>
              <span className={membership.badgeClass}>
                {membership.badgeLabel}
              </span>
            </div>
            <div className="grid-3" style={{ gap: "14px" }}>
              <div>
                <p style={{ fontSize: ".75rem", color: "var(--slate)" }}>Plan</p>
                <p style={{ fontWeight: 600 }}>{membership.billingLabel}</p>
              </div>
              <div>
                <p style={{ fontSize: ".75rem", color: "var(--slate)" }}>
                  {membership.onTrial || membership.onInvitedPartner ? "Ends" : "Renews"}
                </p>
                <p style={{ fontWeight: 600 }}>{membership.renewsAt}</p>
              </div>
              <div>
                <p style={{ fontSize: ".75rem", color: "var(--slate)" }}>
                  Price
                </p>
                <p style={{ fontWeight: 600 }}>{membership.price}</p>
              </div>
            </div>
            <div className="divider"></div>
            <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
              {membership.onInvitedPartner ? (
                <Link href="/app/membership" className="btn btn-gold btn-sm">View offer and membership</Link>
              ) : membership.onTrial ? (
                <Link href="/app/membership" className="btn btn-gold btn-sm">
                  Upgrade to Premium
                </Link>
              ) : membership.plan !== "VIP" && membership.plan !== "None" ? (
                <Link href="/app/membership" className="btn btn-gold btn-sm">
                  Upgrade to VIP
                </Link>
              ) : membership.plan === "None" ? (
                <Link href="/app/membership" className="btn btn-gold btn-sm">
                  Choose a Plan
                </Link>
              ) : null}
              {!membership.onTrial && !membership.onInvitedPartner && membership.plan !== "None" && (
                <>
                  <button className="btn btn-outline btn-sm">
                    Manage Billing
                  </button>
                  <button
                    className="btn btn-outline btn-sm"
                    style={{
                      color: "var(--red)",
                      borderColor: "rgba(232,64,64,.3)",
                    }}
                  >
                    Cancel
                  </button>
                </>
              )}
            </div>
          </div>

          <div className="card">
            <div className="flex-between mb-16">
              <h3>📝 My Submissions</h3>
              <Link href="/app/submit" className="btn btn-gold btn-sm">
                + Submit New
              </Link>
            </div>
            <div className="table-scroll">
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
                  <tr key={row.id}>
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
          </div>

          <div className="card">
            <div className="flex-between mb-16">
              <h3>❤️ Saved & Favourite Properties</h3>
              <span style={{ fontSize: ".8rem", color: "var(--slate)" }}>
                {savedCount} saved
              </span>
            </div>
            <div
              style={{ display: "flex", flexDirection: "column", gap: "10px" }}
            >
              {savedProperties.map((item) => (
                <div style={savedRowStyle} key={item.id}>
                  <div>
                    <p style={{ fontWeight: 600, fontSize: ".9rem" }}>
                      {item.title}
                    </p>
                    <p style={{ fontSize: ".78rem", color: "var(--slate)" }}>
                      {item.meta}
                    </p>
                  </div>
                  <div style={{ display: "flex", gap: "8px" }}>
                    <button
                      className="btn btn-gold btn-sm"
                      onClick={() =>
                        router.push(`/app/deal-analysis?listingId=${item.id}`)
                      }
                    >
                      View
                    </button>
                    <button
                      className="btn btn-outline btn-sm"
                      onClick={() => handleRemoveSaved(item.id)}
                      disabled={removingId === item.id}
                      aria-label={`Remove ${item.title}`}
                    >
                      {removingId === item.id ? "…" : "✕"}
                    </button>
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
