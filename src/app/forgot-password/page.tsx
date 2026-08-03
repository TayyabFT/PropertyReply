"use client";

import Link from "next/link";
import { useState, type FormEvent } from "react";
import { authApi, ApiRequestError } from "@/lib/api";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await authApi.forgotPassword({ email });
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
          <Link href="/" className="logo" style={{ fontSize: "1.6rem" }}>
            Property<span>Reply</span>
          </Link>
          <h2 style={{ marginTop: "28px" }}>
            Forgot your password? We&apos;ll help you{" "}
            <span className="text-gradient">get back in</span>.
          </h2>
        </div>

        <div className="auth-form-panel">
          <form className="auth-form" onSubmit={handleSubmit}>
            <Link href="/login" className="auth-back">
              ← Back to sign in
            </Link>
            <h2>Reset your password</h2>
            <p className="sub">
              Enter the email address on your account and we&apos;ll send you
              a link to reset your password.
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
                {loading ? "Please wait…" : "Send Reset Link →"}
              </button>
            )}

            <p className="auth-switch">
              Remembered your password? <Link href="/login">Sign in</Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}
