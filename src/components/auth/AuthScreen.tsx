"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import GoogleIcon from "@/components/icons/GoogleIcon";
import { useAuth } from "@/lib/auth";

const features: { num: string; text: string }[] = [
  { num: "01", text: "2,400+ verified below-market deals across the UK" },
  { num: "02", text: "Full flip & buy-to-let analysis on every listing" },
  { num: "03", text: "Earn up to 30% commission with the affiliate programme" },
  { num: "04", text: "Credas-verified sellers and GDPR-compliant data" },
];

export default function AuthScreen({ mode }: { mode: "login" | "register" }) {
  const router = useRouter();
  const { signIn } = useAuth();
  const [email, setEmail] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");

  const isRegister = mode === "register";

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    const name = `${firstName} ${lastName}`.trim();
    signIn({ email, name: isRegister ? name : undefined });
    router.push("/app/dashboard");
  };

  const handleGoogle = () => {
    signIn();
    router.push("/app/dashboard");
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
          <ul className="auth-feature-list">
            {features.map((feature) => (
              <li key={feature.num}>
                <span className="dot">{feature.num}</span>
                {feature.text}
              </li>
            ))}
          </ul>
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

            {isRegister && (
              <div className="grid-2" style={{ gap: "12px" }}>
                <div className="form-group">
                  <label>First Name</label>
                  <input
                    type="text"
                    placeholder="James"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                  />
                </div>
                <div className="form-group">
                  <label>Last Name</label>
                  <input
                    type="text"
                    placeholder="Smith"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
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
              />
            </div>
            <div className="form-group">
              <label>Password</label>
              <input
                type="password"
                placeholder={
                  isRegister ? "Minimum 8 characters" : "••••••••"
                }
              />
            </div>

            {isRegister ? (
              <div className="form-group">
                <label>Referral Code (optional)</label>
                <input type="text" placeholder="e.g. JS92840" />
              </div>
            ) : (
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
                <a href="#" className="forgot-link">
                  Forgot password?
                </a>
              </div>
            )}

            <button
              type="submit"
              className="btn btn-gold"
              style={{ width: "100%" }}
            >
              {isRegister ? "Create Free Account →" : "Sign In →"}
            </button>

            <div className="divider-text">or continue with</div>
            <button
              type="button"
              className="social-btn"
              onClick={handleGoogle}
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
                  <Link href="/register">Create a free account</Link>
                </>
              )}
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}
