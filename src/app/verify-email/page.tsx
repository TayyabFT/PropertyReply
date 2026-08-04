"use client";

import Link from "next/link";
import BrandLogo from "@/components/BrandLogo";
import { useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import { authApi, ApiRequestError } from "@/lib/api";
import { useAuth } from "@/lib/auth";

function VerifyEmailStatus() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token") || "";
  const { user, updateUser } = useAuth();

  const [status, setStatus] = useState<"verifying" | "success" | "error">(
    token ? "verifying" : "error",
  );
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (!token) {
      setMessage("This verification link is invalid or incomplete.");
      return;
    }

    let cancelled = false;

    async function run() {
      try {
        const response = await authApi.verifyEmail({ token });
        if (cancelled) return;
        setStatus("success");
        setMessage(response.message);
        if (user) {
          updateUser({ ...user, isEmailVerified: true });
        }
      } catch (err) {
        if (cancelled) return;
        setStatus("error");
        setMessage(
          err instanceof ApiRequestError
            ? err.message
            : "Unable to connect to the server. Is the API running?",
        );
      }
    }

    run();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  return (
    <div className="auth-page">
      <div className="auth-split">
        <div className="auth-brand">
          <BrandLogo href="/" iconSize={48} />
          <h2 style={{ marginTop: "28px" }}>
            Confirming your <span className="text-gradient">email address</span>.
          </h2>
        </div>

        <div className="auth-form-panel">
          <div className="auth-form">
            <Link href="/login" className="auth-back">
              ← Back to sign in
            </Link>
            <h2>Email verification</h2>

            {status === "verifying" && <p className="sub">Verifying your email…</p>}

            {status === "success" && (
              <div className="alert alert-success" style={{ marginBottom: "16px" }}>
                <span>✓</span>
                <span>{message}</span>
              </div>
            )}

            {status === "error" && (
              <div className="alert alert-error" style={{ marginBottom: "16px" }}>
                <span>!</span>
                <span>{message}</span>
              </div>
            )}

            {status === "success" ? (
              <Link href="/app/dashboard" className="btn btn-gold" style={{ width: "100%" }}>
                Go to Dashboard →
              </Link>
            ) : status === "error" ? (
              <p className="auth-switch">
                Link expired or already used?{" "}
                <Link href="/resend-verification">Resend verification email</Link>
              </p>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={null}>
      <VerifyEmailStatus />
    </Suspense>
  );
}
