"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useAuth } from "@/lib/auth";
import { kycApi, type KycData, ApiRequestError } from "@/lib/api";

type VerificationPhase = "idle" | "starting" | "invited" | "error";

function kycStatusLabel(status: string) {
  switch (status) {
    case "approved":
      return "Verified";
    case "in_progress":
      return "In Progress";
    case "consider":
      return "Under Review";
    case "rejected":
      return "Rejected";
    default:
      return "Pending";
  }
}

export default function Kyc() {
  const { token, updateUser, user } = useAuth();
  const searchParams = useSearchParams();
  const submitRequired = searchParams.get("reason") === "submit-required";
  const stripeReturn = searchParams.get("stripe_return") === "1";

  const [data, setData] = useState<KycData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [verificationPhase, setVerificationPhase] =
    useState<VerificationPhase>("idle");
  const [inviteMessage, setInviteMessage] = useState<string | null>(null);

  const pollRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const returnPollStarted = useRef(false);

  const refreshStatus = async (authToken: string) => {
    const res = await kycApi.get(authToken);
    setData(res.data);
    if (user) {
      updateUser({ ...user, kycStatus: res.data.status });
    }
    return res.data;
  };

  useEffect(() => {
    if (!token) return;
    const authToken = token;
    let cancelled = false;

    (async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await kycApi.get(authToken);
        if (!cancelled) setData(res.data);
      } catch (err) {
        if (!cancelled) {
          setError(
            err instanceof ApiRequestError
              ? err.message
              : "Failed to load verification status.",
          );
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [token]);

  useEffect(() => {
    return () => {
      if (pollRef.current) clearTimeout(pollRef.current);
    };
  }, []);

  const pollForCompletion = (authToken: string, attemptsLeft: number) => {
    if (attemptsLeft <= 0) return;

    pollRef.current = setTimeout(async () => {
      try {
        const latest = await refreshStatus(authToken);
        if (latest.status === "in_progress" || latest.status === "pending") {
          pollForCompletion(authToken, attemptsLeft - 1);
        }
      } catch {
        // ignore transient errors and keep polling
        pollForCompletion(authToken, attemptsLeft - 1);
      }
    }, 5000);
  };

  // After Stripe Identity redirect, sync status from Stripe via API and poll
  useEffect(() => {
    if (!token || !stripeReturn || returnPollStarted.current) return;
    returnPollStarted.current = true;

    (async () => {
      try {
        const latest = await refreshStatus(token);
        if (latest.status === "approved") {
          setInviteMessage("Your identity has been verified successfully.");
          setVerificationPhase("invited");
          return;
        }
        if (latest.status === "rejected") {
          setInviteMessage(null);
          setVerificationPhase("idle");
          return;
        }
        setInviteMessage(
          "Thanks — Stripe is finishing your verification. This page will update automatically.",
        );
        setVerificationPhase("invited");
        pollForCompletion(token, 36);
      } catch {
        setInviteMessage(
          "Checking verification status… If this stays pending, click Continue Verification.",
        );
        pollForCompletion(token, 36);
      }
    })();
  }, [token, stripeReturn]);

  const startVerification = async () => {
    if (!token) return;
    setVerificationPhase("starting");
    setError(null);
    setInviteMessage(null);

    try {
      const res = await kycApi.startVerification(token);
      setInviteMessage(res.data.message);
      setVerificationPhase("invited");
      await refreshStatus(token);

      if (res.data.url) {
        window.location.href = res.data.url;
        return;
      }

      pollForCompletion(token, 24); // poll every 5s for ~2 minutes (static / no redirect)
    } catch (err) {
      setVerificationPhase("error");
      setError(
        err instanceof ApiRequestError
          ? err.message
          : "Unable to start identity verification.",
      );
    }
  };

  const stepClass = (state: string) =>
    state === "done"
      ? "kyc-step done"
      : state === "active"
        ? "kyc-step active"
        : "kyc-step";

  const canStartVerification =
    data &&
    !data.verified &&
    data.status !== "consider" &&
    (data.status === "pending" || data.status === "rejected");

  const canResumeVerification =
    data &&
    !data.verified &&
    data.status === "in_progress" &&
    !data.staticMode;

  return (
    <section className="section" id="kyc">
      <div className="container">
        <div className="tag mb-8">Identity Verification</div>
        <h2 className="mb-8">Identity Verification & Compliance</h2>
        <p className="muted mb-32">
          Secure KYC and AML screening are required to submit listings and
          access full seller contact details. Powered by Stripe Identity.
        </p>

        {submitRequired && (
          <div className="alert alert-error" style={{ marginBottom: "16px" }}>
            <span>!</span>
            <span>
              You must complete identity verification before submitting a
              property listing. Please verify your identity below.
            </span>
          </div>
        )}

        {loading && <p className="muted">Loading verification status…</p>}
        {error && (
          <div className="alert alert-error" style={{ marginBottom: "16px" }}>
            <span>!</span>
            <span>{error}</span>
          </div>
        )}

        {inviteMessage && (
          <div
            className="alert"
            style={{
              marginBottom: "16px",
              background: "rgba(34,197,94,.1)",
              border: "1px solid rgba(34,197,94,.3)",
            }}
          >
            <span>✓</span>
            <span>{inviteMessage}</span>
          </div>
        )}

        {!loading && data && (
          <div className="kyc-flow">
            <div className="kyc-steps">
              {data.steps.map((step) => (
                <div className={stepClass(step.state)} key={step.label}>
                  <div className="kyc-step-num">{step.num}</div>
                  <p>{step.label}</p>
                </div>
              ))}
            </div>

            <div className="kyc-card">
              <div className="verification-badge">
                <div className="v-icon">
                  {data.verified
                    ? "✅"
                    : data.status === "in_progress" || data.status === "consider"
                      ? "⏳"
                      : data.status === "rejected"
                        ? "✗"
                        : "🔐"}
                </div>
                <div>
                  <h4>{kycStatusLabel(data.status)}</h4>
                  <p>
                    {data.verified
                      ? `Your identity has been verified and AML screening passed.${
                          data.reference ? ` Reference: ${data.reference}` : ""
                        }`
                      : data.status === "in_progress"
                        ? data.staticMode
                          ? "Demo mode: your request is marked in-progress. An admin will review and approve it manually."
                          : "Complete verification on the secure Stripe Identity page. This page updates automatically once you're done."
                        : data.status === "consider"
                          ? "Your verification requires manual review. Our team will be in touch."
                          : data.status === "rejected"
                            ? `Verification was not successful${
                                data.lastError?.reason
                                  ? `: ${data.lastError.reason}`
                                  : ""
                              }. Click Start Verification below to try again.`
                            : "Complete identity verification to unlock listing submission and seller contact details."}
                  </p>
                </div>
              </div>

              <h3 className="mb-16">Compliance Status</h3>
              {data.compliance.map((row) => (
                <div className="compliance-row" key={row.label}>
                  <span className="c-label">{row.label}</span>
                  <span className={row.mono ? "c-status mono" : "c-status"}>
                    {row.ok !== undefined && (
                      <span
                        style={{
                          color: row.ok ? "var(--green)" : "var(--slate)",
                        }}
                      >
                        {row.ok ? "✓ " : ""}
                      </span>
                    )}
                    {row.value}
                  </span>
                </div>
              ))}

              {data.verified && (
                <div
                  style={{
                    marginTop: "24px",
                    padding: "24px",
                    background: "rgba(34,197,94,.08)",
                    border: "1px solid rgba(34,197,94,.3)",
                    borderRadius: "var(--radius)",
                  }}
                >
                  <h4 style={{ marginBottom: "8px", fontSize: ".95rem" }}>
                    You&apos;re verified
                  </h4>
                  <p
                    style={{
                      fontSize: ".85rem",
                      color: "var(--slate)",
                      marginBottom: "16px",
                    }}
                  >
                    Your identity checks are complete. You can now submit a
                    property deal for review.
                  </p>
                  <Link href="/app/submit" className="btn btn-gold">
                    Submit a Deal Now →
                  </Link>
                </div>
              )}

              {(canStartVerification || canResumeVerification) && (
                <div
                  style={{
                    marginTop: "24px",
                    padding: "24px",
                    background: "rgba(212,168,67,.07)",
                    border: "1px dashed rgba(212,168,67,.3)",
                    borderRadius: "var(--radius)",
                  }}
                >
                  <h4 style={{ marginBottom: "8px", fontSize: ".95rem" }}>
                    {canResumeVerification
                      ? "Continue your verification"
                      : "Start your verification"}
                  </h4>
                  <p
                    style={{
                      fontSize: ".85rem",
                      color: "var(--slate)",
                      marginBottom: "16px",
                    }}
                  >
                    You&apos;ll be redirected to Stripe Identity to securely
                    capture your ID document and a matching selfie. The process
                    usually takes a few minutes.
                  </p>
                  <button
                    className="btn btn-gold"
                    onClick={startVerification}
                    disabled={verificationPhase === "starting"}
                  >
                    {verificationPhase === "starting"
                      ? "Opening Stripe…"
                      : canResumeVerification
                        ? "Continue Verification →"
                        : "Start Verification →"}
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
