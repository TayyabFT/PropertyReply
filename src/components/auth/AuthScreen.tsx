"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import GoogleIcon from "@/components/icons/GoogleIcon";
import { ApiRequestError } from "@/lib/api";
import { useAuth } from "@/lib/auth";

const features: { num: string; text: string }[] = [
  { num: "01", text: "2,400+ verified below-market deals across the UK" },
  { num: "02", text: "Full flip & buy-to-let analysis on every listing" },
  { num: "03", text: "Identity-verified sellers and GDPR-compliant data" },
];

export default function AuthScreen({ mode }: { mode: "login" | "register" }) {
  const router = useRouter();
  const { login, register, loading } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [error, setError] = useState("");

  const isRegister = mode === "register";

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setError("");

    try {
      if (isRegister) {
        await register({
          firstName,
          lastName,
          email,
          password,
        });
        router.push("/app/membership");
        return;
      }
      await login(email, password);
      router.push("/app/dashboard");
    } catch (err) {
      const message =
        err instanceof ApiRequestError
          ? err.message
          : "Unable to connect to the server. Is the API running?";
      setError(message);
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
            The UK&apos;s #1 marketplace for{" "}
            <span className="text-gradient">below-market</span> property deals.
          </h2>
          
        </div>

        <div className="auth-form-panel">
          <form className="auth-form" onSubmit={handleSubmit}>
            <Link href="/" className="auth-back">
              ← Back to home
            </Link>
            <h2>{isRegister ? "Create your account" : "Welcome back"}</h2>
            <p className="sub">
              {isRegister
                ? "Join 18,000+ investors finding BMV deals every day."
                : "Sign in to access your deals, dashboard, and listings."}
            </p>

            {error && (
              <div className="alert alert-error" style={{ marginBottom: "16px" }}>
                <span>!</span>
                <span>{error}</span>
              </div>
            )}

            {isRegister && (
              <div className="grid-2" style={{ gap: "12px" }}>
                <div className="form-group">
                  <label>First Name</label>
                  <input
                    type="text"
                    placeholder="James"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Last Name</label>
                  <input
                    type="text"
                    placeholder="Smith"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    required
                  />
                </div>
              </div>
            )}

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
            <div className="form-group">
              <label>Password</label>
              <input
                type="password"
                placeholder={
                  isRegister ? "Minimum 8 characters" : "••••••••"
                }
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                minLength={isRegister ? 8 : undefined}
                required
              />
            </div>

            {!isRegister && (
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: "20px",
                }}
              >
                <label
                  className="checkbox-item"
                  style={{ border: "none", padding: 0 }}
                >
                  <input type="checkbox" /> Remember me
                </label>
                <Link href="/forgot-password" className="forgot-link">
                  Forgot password?
                </Link>
              </div>
            )}

            <button
              type="submit"
              className="btn btn-gold"
              style={{ width: "100%" }}
              disabled={loading}
            >
              {loading
                ? "Please wait…"
                : isRegister
                  ? "Create Account →"
                  : "Sign In →"}
            </button>

            <div className="divider-text">or continue with</div>
            <button
              type="button"
              className="social-btn"
              disabled
              title="Google sign-in coming soon"
            >
              <GoogleIcon />
              Continue with Google
            </button>

            <p className="auth-switch">
              {isRegister ? (
                <>
                  Already have an account? <Link href="/login">Sign in</Link>
                </>
              ) : (
                <>
                  New to PropertyReply?{" "}
                  <Link href="/register">Create an account</Link>
                </>
              )}
            </p>
            {!isRegister && (
              <p className="auth-switch">
                Didn&apos;t get a verification email?{" "}
                <Link href="/resend-verification">Resend it</Link>
              </p>
            )}
          </form>
        </div>
      </div>
    </div>
  );
}
