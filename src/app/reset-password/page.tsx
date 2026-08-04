"use client";

import Link from "next/link";
import BrandLogo from "@/components/BrandLogo";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useState, type FormEvent } from "react";
import { authApi, ApiRequestError } from "@/lib/api";

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token") || "";

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setError("");

    if (!token) {
      setError("This reset link is invalid or incomplete. Please request a new one.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);
    try {
      const response = await authApi.resetPassword({ token, newPassword });
      setMessage(response.message);
      setTimeout(() => router.push("/login"), 2000);
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
            Choose a <span className="text-gradient">new password</span> for
            your account.
          </h2>
        </div>

        <div className="auth-form-panel">
          <form className="auth-form" onSubmit={handleSubmit}>
            <Link href="/login" className="auth-back">
              ← Back to sign in
            </Link>
            <h2>Set a new password</h2>
            <p className="sub">Choose a strong password with at least 8 characters.</p>

            {error && (
              <div className="alert alert-error" style={{ marginBottom: "16px" }}>
                <span>!</span>
                <span>{error}</span>
              </div>
            )}

            {message ? (
              <div className="alert alert-success" style={{ marginBottom: "16px" }}>
                <span>✓</span>
                <span>{message} Redirecting you to sign in…</span>
              </div>
            ) : (
              <>
                <div className="form-group">
                  <label>New Password</label>
                  <input
                    type="password"
                    placeholder="Minimum 8 characters"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    minLength={8}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Confirm New Password</label>
                  <input
                    type="password"
                    placeholder="Minimum 8 characters"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    minLength={8}
                    required
                  />
                </div>
                <button
                  type="submit"
                  className="btn btn-gold"
                  style={{ width: "100%" }}
                  disabled={loading}
                >
                  {loading ? "Please wait…" : "Reset Password →"}
                </button>
              </>
            )}

            <p className="auth-switch">
              Need a new reset link?{" "}
              <Link href="/forgot-password">Request one</Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={null}>
      <ResetPasswordForm />
    </Suspense>
  );
}
