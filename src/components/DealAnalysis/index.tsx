"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { useAuth } from "@/lib/auth";
import {
  dealAnalysisApi,
  type DealAnalysisContactData,
  type DealAnalysisData,
  type DealAnalysisDeal,
  ApiRequestError,
} from "@/lib/api";
import ContactModal, { UpgradePrompt } from "./ContactModal";
import ReportModal from "./ReportModal";

const contactBox = {
  background: "rgba(255,255,255,.04)",
  border: "1px solid rgba(255,255,255,.07)",
  borderRadius: "var(--radius)",
  padding: "14px",
} as const;

function isLockedSection<T extends { locked?: boolean }>(
  section: T,
): section is T & { locked: true; message: string } {
  return Boolean(section.locked);
}

export default function DealAnalysis() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { token } = useAuth();

  const [deals, setDeals] = useState<DealAnalysisDeal[]>([]);
  const [analysis, setAnalysis] = useState<DealAnalysisData | null>(null);
  const [selectedId, setSelectedId] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionMessage, setActionMessage] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [reportOpen, setReportOpen] = useState(false);
  const [reportLoading, setReportLoading] = useState(false);
  const [contact, setContact] = useState<DealAnalysisContactData | null>(null);
  const [contactLoading, setContactLoading] = useState(false);
  const [upgradeOpen, setUpgradeOpen] = useState(false);

  const loadAnalysis = useCallback(
    async (listingId: string, authToken: string) => {
      const response = await dealAnalysisApi.getAnalysis(authToken, listingId);
      setAnalysis(response.data);
      setSelectedId(listingId);
      router.replace(`/app/deal-analysis?listingId=${listingId}`, {
        scroll: false,
      });
    },
    [router],
  );

  useEffect(() => {
    if (!token) return;

    const authToken = token;
    let cancelled = false;

    async function init() {
      setLoading(true);
      setError(null);

      try {
        const dealsResponse = await dealAnalysisApi.getDeals(authToken);
        if (cancelled) return;

        const availableDeals = dealsResponse.data.deals;
        setDeals(availableDeals);

        const queryId = searchParams.get("listingId");
        const initialId = queryId || availableDeals[0]?.id;

        if (!initialId) {
          setAnalysis(null);
          return;
        }

        await loadAnalysis(initialId, authToken);
      } catch (err) {
        if (!cancelled) {
          const message =
            err instanceof ApiRequestError
              ? err.message
              : "Failed to load deal analysis.";
          setError(message);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    init();

    return () => {
      cancelled = true;
    };
  }, [token, searchParams, loadAnalysis]);

  const handleDealChange = async (listingId: string) => {
    if (!token || listingId === selectedId) return;

    setLoading(true);
    setError(null);
    setActionMessage(null);

    try {
      await loadAnalysis(listingId, token);
    } catch (err) {
      const message =
        err instanceof ApiRequestError
          ? err.message
          : "Failed to load deal analysis.";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!token || !analysis) return;

    setSaving(true);
    setActionMessage(null);

    try {
      if (analysis.isSaved) {
        await dealAnalysisApi.unsave(token, analysis.listingId);
        setActionMessage("Deal removed from favourites.");
      } else {
        await dealAnalysisApi.save(token, analysis.listingId);
        setActionMessage("Deal saved to your favourites.");
      }

      const refreshed = await dealAnalysisApi.getAnalysis(
        token,
        analysis.listingId,
      );
      setAnalysis(refreshed.data);
    } catch (err) {
      const message =
        err instanceof ApiRequestError
          ? err.message
          : "Unable to update saved deal.";
      setError(message);
    } finally {
      setSaving(false);
    }
  };

  const handleReport = async (reason: string, details: string) => {
    if (!token || !analysis) return;

    setReportLoading(true);
    setError(null);

    try {
      const response = await dealAnalysisApi.report(token, analysis.listingId, {
        reason,
        details,
      });
      setActionMessage(response.message);
      setReportOpen(false);
    } catch (err) {
      const message =
        err instanceof ApiRequestError
          ? err.message
          : "Unable to submit report.";
      setError(message);
    } finally {
      setReportLoading(false);
    }
  };

  const handleContact = async () => {
    if (!token || !analysis) return;

    if (!analysis.actions.canContact) {
      setUpgradeOpen(true);
      return;
    }

    setContactLoading(true);
    setContact(null);

    try {
      const response = await dealAnalysisApi.getContact(
        token,
        analysis.listingId,
      );
      setContact(response.data);
    } catch (err) {
      if (err instanceof ApiRequestError && err.status === 403) {
        setUpgradeOpen(true);
        return;
      }
      const message =
        err instanceof ApiRequestError
          ? err.message
          : "Unable to load contact details.";
      setError(message);
    } finally {
      setContactLoading(false);
    }
  };

  const handleSendEnquiry = async (message: string) => {
    if (!token || !analysis) throw new Error("Not ready");

    const response = await dealAnalysisApi.sendEnquiry(
      token,
      analysis.listingId,
      { message },
    );
    return response.message;
  };

  if (loading && !analysis) {
    return (
      <section className="section" id="deal-analysis">
        <div className="container">
          <div className="page-head">
            <h1>Deal Analysis</h1>
            <p>Loading analysis…</p>
          </div>
        </div>
      </section>
    );
  }

  if (error && !analysis) {
    return (
      <section className="section" id="deal-analysis">
        <div className="container">
          <div className="page-head">
            <h1>Deal Analysis</h1>
            <p style={{ color: "var(--red)" }}>{error}</p>
          </div>
        </div>
      </section>
    );
  }

  if (!analysis) {
    return (
      <section className="section" id="deal-analysis">
        <div className="container">
          <div className="page-head">
            <h1>Deal Analysis</h1>
            <p>No deals available for analysis yet.</p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="section" id="deal-analysis">
      <div className="container">
        <div className="tag mb-8">{analysis.featureBadge}</div>

        <div
          className="flex-between mb-16"
          style={{ alignItems: "flex-end", flexWrap: "wrap", gap: "12px" }}
        >
          <h2 className="mb-0">{analysis.pageTitle}</h2>
          {deals.length > 1 && (
            <div className="form-group" style={{ minWidth: "260px", margin: 0 }}>
              <label>Select Deal</label>
              <select
                value={selectedId}
                onChange={(event) => handleDealChange(event.target.value)}
              >
                {deals.map((deal) => (
                  <option key={deal.id} value={deal.id}>
                    {deal.title} — {deal.discountPercent}% BMV
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>

        {!analysis.hasFullAccess && (
          <div className="alert alert-error" style={{ marginBottom: "16px" }}>
            <span>!</span>
            <span>
              Full flip &amp; BTL analysis requires Premium.{" "}
              <Link href="/app/membership" style={{ color: "var(--gold)" }}>
                Upgrade now
              </Link>
            </span>
          </div>
        )}

        {error && (
          <div className="alert alert-error" style={{ marginBottom: "16px" }}>
            <span>!</span>
            <span>{error}</span>
          </div>
        )}

        {actionMessage && (
          <div
            className="alert"
            style={{
              marginBottom: "16px",
              background: "rgba(46,204,113,.12)",
              border: "1px solid rgba(46,204,113,.25)",
            }}
          >
            <span>✓</span>
            <span>{actionMessage}</span>
          </div>
        )}

        <div className="analysis-card">
          <div className="analysis-header">
            <div>
              <h3 style={{ fontSize: "1.05rem" }}>📍 {analysis.header.address}</h3>
              <p
                style={{
                  color: "var(--slate)",
                  fontSize: ".82rem",
                  marginTop: "4px",
                }}
              >
                {analysis.header.sellerLine} · Verified Seller{" "}
                {analysis.header.kycPassed && (
                  <span className="tag badge-green" style={{ marginLeft: "8px" }}>
                    {analysis.header.kycBadge}
                  </span>
                )}
              </p>
            </div>
            <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
              <button
                type="button"
                className={
                  analysis.isSaved
                    ? "btn btn-gold btn-sm"
                    : "btn btn-outline btn-sm"
                }
                onClick={handleSave}
                disabled={saving}
              >
                {saving ? "…" : analysis.isSaved ? "♥ Saved" : "♡ Save"}
              </button>
              <button
                type="button"
                className="btn btn-outline btn-sm"
                onClick={() => setReportOpen(true)}
              >
                ⚑ Report
              </button>
              <button
                type="button"
                className="btn btn-gold btn-sm"
                onClick={handleContact}
              >
                Contact Seller
              </button>
            </div>
          </div>

          <div className="analysis-body">
            <div className="analysis-grid">
              {analysis.metrics.map((metric) => (
                <div className="metric-box" key={metric.label}>
                  <div className="label">{metric.label}</div>
                  <div
                    className={
                      metric.valueClass
                        ? `value ${metric.valueClass}`
                        : "value"
                    }
                  >
                    {metric.value}
                  </div>
                  <div className="sub">{metric.sub}</div>
                </div>
              ))}
            </div>

            <div className="discount-meter mb-24">
              <div className="flex-between mb-8">
                <span style={{ fontSize: ".82rem", color: "var(--slate)" }}>
                  Discount calculator
                </span>
                <span
                  className="mono"
                  style={{ fontSize: ".82rem", color: "var(--gold)" }}
                >
                  {analysis.discountMeter.label}
                </span>
              </div>
              <div className="meter-track">
                <div
                  className="meter-fill"
                  style={{ width: `${analysis.discountMeter.fillWidth}%` }}
                ></div>
              </div>
              <div
                className="flex-between"
                style={{
                  fontSize: ".72rem",
                  color: "var(--slate)",
                  marginTop: "4px",
                }}
              >
                <span>0%</span>
                <span style={{ color: "var(--gold)" }}>
                  {analysis.discountMeter.percent}% discount
                </span>
                <span>50%</span>
              </div>
            </div>

            <div className="grid-2">
              <div>
                <p className="form-section-title">📊 Flip Analysis</p>
                {isLockedSection(analysis.flipAnalysis) ? (
                  <p className="muted" style={{ fontSize: ".88rem" }}>
                    {analysis.flipAnalysis.message}
                  </p>
                ) : (
                  <>
                    {analysis.flipAnalysis.rows.map((row) => (
                      <div className="calc-row" key={row.label}>
                        <span className="lbl">{row.label}</span>
                        <span
                          className={
                            row.valueClass ? `val ${row.valueClass}` : "val"
                          }
                        >
                          {row.value}
                        </span>
                      </div>
                    ))}
                    <div className="divider"></div>
                    <div className="calc-row total">
                      <span className="lbl" style={{ fontWeight: 600 }}>
                        {analysis.flipAnalysis.total.label}
                      </span>
                      <span className="val">
                        {analysis.flipAnalysis.total.value}
                      </span>
                    </div>
                  </>
                )}
              </div>

              <div>
                <p className="form-section-title">🏠 Buy-to-Let Analysis</p>
                {isLockedSection(analysis.btlAnalysis) ? (
                  <p className="muted" style={{ fontSize: ".88rem" }}>
                    {analysis.btlAnalysis.message}
                  </p>
                ) : (
                  <>
                    {analysis.btlAnalysis.rows.map((row) => (
                      <div className="calc-row" key={row.label}>
                        <span className="lbl">{row.label}</span>
                        <span
                          className={
                            row.valueClass ? `val ${row.valueClass}` : "val"
                          }
                        >
                          {row.value}
                        </span>
                      </div>
                    ))}
                    <div className="divider"></div>
                    <div className="calc-row total">
                      <span className="lbl" style={{ fontWeight: 600 }}>
                        {analysis.btlAnalysis.total.label}
                      </span>
                      <span className="val">
                        {analysis.btlAnalysis.total.value}
                      </span>
                    </div>
                  </>
                )}
              </div>
            </div>

            <div
              style={{
                marginTop: "28px",
                padding: "20px",
                background: "rgba(255,255,255,.04)",
                borderRadius: "var(--radius)",
                border: "1px solid rgba(255,255,255,.07)",
              }}
            >
              <p className="form-section-title">📝 Seller&apos;s Description</p>
              <p
                style={{
                  fontSize: ".88rem",
                  color: "#a0b8cc",
                  lineHeight: 1.8,
                }}
              >
                {analysis.sellerDescription}
              </p>
              {analysis.comparableRange && (
                <p
                  style={{
                    fontSize: ".8rem",
                    color: "var(--slate)",
                    marginTop: "10px",
                  }}
                >
                  Comparable range: {analysis.comparableRange}
                </p>
              )}
            </div>

            <div style={{ marginTop: "24px" }}>
              <p className="form-section-title">
                📞 Contact Details{" "}
                {analysis.contact.badge && (
                  <span className="tag" style={{ marginLeft: "8px" }}>
                    {analysis.contact.badge}
                  </span>
                )}
              </p>
              <div className="grid-2" style={{ gap: "12px" }}>
                {analysis.contact.fields.map((field) => (
                  <div style={contactBox} key={field.label}>
                    <p style={{ fontSize: ".75rem", color: "var(--slate)" }}>
                      {field.label}
                    </p>
                    <p style={{ fontSize: ".9rem", fontWeight: 600 }}>
                      {field.value}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      <ReportModal
        open={reportOpen}
        reasons={analysis.reportReasons}
        loading={reportLoading}
        onClose={() => setReportOpen(false)}
        onSubmit={handleReport}
      />

      <ContactModal
        contact={contact}
        loading={contactLoading}
        onClose={() => setContact(null)}
        onSendEnquiry={handleSendEnquiry}
      />

      {upgradeOpen && (
        <UpgradePrompt onClose={() => setUpgradeOpen(false)} />
      )}
    </section>
  );
}
