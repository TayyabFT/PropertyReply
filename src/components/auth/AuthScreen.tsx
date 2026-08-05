"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import BrandLogo from "@/components/BrandLogo";
import GoogleIcon from "@/components/icons/GoogleIcon";
import { ApiRequestError } from "@/lib/api";
import { useAuth } from "@/lib/auth";

function PasswordField({
  label,
  value,
  onChange,
  placeholder,
  minLength,
  autoComplete,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  minLength?: number;
  autoComplete?: string;
}) {
  const [visible, setVisible] = useState(false);

  return (
    <div className="form-group">
      <label>{label}</label>
      <div className="password-field">
        <input
          type={visible ? "text" : "password"}
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          minLength={minLength}
          autoComplete={autoComplete}
          required
        />
        <button
          type="button"
          className="password-toggle"
          onClick={() => setVisible((v) => !v)}
          aria-label={visible ? "Hide password" : "Show password"}
        >
          {visible ? "Hide" : "View"}
        </button>
      </div>
    </div>
  );
}

export default function AuthScreen({ mode }: { mode: "login" | "register" }) {
  const router = useRouter();
  const { login, register, loading, user } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [error, setError] = useState("");

  const isRegister = mode === "register";

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setError("");

    try {
      if (isRegister) {
        if (password.length < 8) {
          setError("Password must be at least 8 characters.");
          return;
        }
        if (password !== confirmPassword) {
          setError("Passwords do not match.");
          return;
        }
        await register({
          firstName,
          lastName,
          email,
          password,
        });
        // Choose free trial or paid plan after signup
        router.push("/app/membership");
        return;
      }
      const loggedInUser = await login(email, password);
      // Returning members with access go to the app; others choose a plan/trial
      const nextUser = loggedInUser ?? user;
      if (
        nextUser?.role === "admin" ||
        nextUser?.onTrial ||
        nextUser?.subscriptionStatus === "active"
      ) {
        router.push("/app/dashboard");
      } else {
        router.push("/app/membership");
      }
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
          <BrandLogo href="/" iconSize={48} />
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
                ? "Join many investors finding BMV deals every day."
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
            <PasswordField
              label="Password"
              value={password}
              onChange={setPassword}
              placeholder={isRegister ? "Minimum 8 characters" : "••••••••"}
              minLength={isRegister ? 8 : undefined}
              autoComplete={isRegister ? "new-password" : "current-password"}
            />

            {isRegister && (
              <PasswordField
                label="Confirm Password"
                value={confirmPassword}
                onChange={setConfirmPassword}
                placeholder="Re-enter your password"
                minLength={8}
                autoComplete="new-password"
              />
            )}

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
