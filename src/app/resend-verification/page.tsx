"use client";

import Link from "next/link";
import BrandLogo from "@/components/BrandLogo";
import { useState, type FormEvent } from "react";
import { authApi, ApiRequestError } from "@/lib/api";

export default function ResendVerificationPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await authApi.resendVerification({ email });
      setMessage(response.message);
    } catch (err) {
      setError(
        err instanceof ApiRequestError
          ? err.message
          : "Unable to connect to the server. Is the API running?",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-split">
        <div className="auth-brand">
          <BrandLogo href="/" iconSize={48} />
          <h2 style={{ marginTop: "28px" }}>
            Get a fresh <span className="text-gradient">verification link</span>.
          </h2>
        </div>

        <div className="auth-form-panel">
          <form className="auth-form" onSubmit={handleSubmit}>
            <Link href="/login" className="auth-back">
              ← Back to sign in
            </Link>
            <h2>Resend verification email</h2>
            <p className="sub">
              Enter your account email and we&apos;ll send a new verification
              link if it hasn&apos;t been confirmed yet.
            </p>

            {error && (
              <div className="alert alert-error" style={{ marginBottom: "16px" }}>
                <span>!</span>
                <span>{error}</span>
              </div>
            )}

            {message ? (
              <div className="alert alert-success" style={{ marginBottom: "16px" }}>
                <span>✓</span>
                <span>{message}</span>
              </div>
            ) : (
              <div className="form-group">
                <label>Email Address</label>
                <input
                  type="email"
                  placeholder="your@email.co.uk"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            )}

            {!message && (
              <button
                type="submit"
                className="btn btn-gold"
                style={{ width: "100%" }}
                disabled={loading}
              >
                {loading ? "Please wait…" : "Resend Verification Email →"}
              </button>
            )}

            <p className="auth-switch">
              Already verified? <Link href="/login">Sign in</Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}
