"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth";
import { authApi, ApiRequestError } from "@/lib/api";
import { userPlanLabel } from "@/lib/planAccess";

const ALL_NOTIFICATION_PREFS = [
  "New deal alerts (instant)",
  "Daily deal digest",
  "Listing approved",
  "Listing rejected",
  "Membership renewal",
  "Weekly performance report",
  "Security alerts",
  "Platform news",
];

const INVESTOR_TYPES = [
  "Property Investor",
  "Sourcing Agent",
  "Developer",
  "First-Time Buyer",
];

function memberSince(createdAt?: string): string {
  if (!createdAt) return "—";
  return new Intl.DateTimeFormat("en-GB", {
    month: "short",
    year: "numeric",
  }).format(new Date(createdAt));
}

function kycBadge(status?: string) {
  switch (status) {
    case "approved":
      return { label: "✓ KYC Approved", className: "tag badge-green" };
    case "in_progress":
      return { label: "KYC In Progress", className: "tag badge-amber" };
    case "consider":
      return { label: "KYC Under Review", className: "tag badge-amber" };
    case "rejected":
      return { label: "KYC Rejected", className: "tag badge-red" };
    default:
      return { label: "KYC Pending", className: "tag badge-amber" };
  }
}

export default function Profile() {
  const { user, token, updateUser } = useAuth();

  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    phone: "",
    location: "",
    investorType: "Property Investor",
  });
  const [prefs, setPrefs] = useState<string[]>([]);
  const [passwords, setPasswords] = useState({
    current: "",
    next: "",
    confirm: "",
  });

  const [savingProfile, setSavingProfile] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);
  const [savingPrefs, setSavingPrefs] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;
    setForm({
      firstName: user.firstName || "",
      lastName: user.lastName || "",
      phone: user.phone || "",
      location: user.location || "",
      investorType: user.investorType || "Property Investor",
    });
    setPrefs(user.notificationPrefs || []);
  }, [user]);

  if (!user) return null;

  const flash = (msg: string) => {
    setMessage(msg);
    setError(null);
    window.setTimeout(() => setMessage(null), 3000);
  };

  const togglePref = (pref: string) => {
    setPrefs((current) =>
      current.includes(pref)
        ? current.filter((item) => item !== pref)
        : [...current, pref],
    );
  };

  const handleSaveProfile = async () => {
    if (!token) return;
    setSavingProfile(true);
    setError(null);
    try {
      const res = await authApi.updateProfile(token, {
        firstName: form.firstName,
        lastName: form.lastName,
        phone: form.phone,
        location: form.location,
        investorType: form.investorType,
      });
      updateUser(res.data.user);
      flash("Profile saved.");
    } catch (err) {
      setError(
        err instanceof ApiRequestError ? err.message : "Unable to save profile.",
      );
    } finally {
      setSavingProfile(false);
    }
  };

  const handleSavePrefs = async () => {
    if (!token) return;
    setSavingPrefs(true);
    setError(null);
    try {
      const res = await authApi.updateProfile(token, { notificationPrefs: prefs });
      updateUser(res.data.user);
      flash("Preferences saved.");
    } catch (err) {
      setError(
        err instanceof ApiRequestError
          ? err.message
          : "Unable to save preferences.",
      );
    } finally {
      setSavingPrefs(false);
    }
  };

  const handleChangePassword = async () => {
    if (!token) return;
    setError(null);
    if (passwords.next !== passwords.confirm) {
      setError("New passwords do not match.");
      return;
    }
    setSavingPassword(true);
    try {
      await authApi.changePassword(token, {
        currentPassword: passwords.current,
        newPassword: passwords.next,
      });
      setPasswords({ current: "", next: "", confirm: "" });
      flash("Password updated.");
    } catch (err) {
      setError(
        err instanceof ApiRequestError
          ? err.message
          : "Unable to update password.",
      );
    } finally {
      setSavingPassword(false);
    }
  };

  const kyc = kycBadge(user.kycStatus);

  return (
    <section className="section section-alt" id="profile">
      <div className="container">
        <div className="tag mb-16">My Account</div>

        {message && (
          <div
            className="alert"
            style={{
              marginBottom: "16px",
              background: "rgba(46,204,113,.12)",
              border: "1px solid rgba(46,204,113,.25)",
            }}
          >
            <span>✓</span>
            <span>{message}</span>
          </div>
        )}
        {error && (
          <div className="alert alert-error" style={{ marginBottom: "16px" }}>
            <span>!</span>
            <span>{error}</span>
          </div>
        )}

        <div className="profile-header-card">
          <div className="profile-avatar-lg">{user.initials}</div>
          <div className="profile-info">
            <h2>{user.name}</h2>
            <div
              style={{
                display: "flex",
                gap: "8px",
                flexWrap: "wrap",
                marginTop: "6px",
              }}
            >
              <span
                className={
                  user.onTrial
                    ? "tag badge-blue"
                    : user.plan
                      ? "tag badge-green"
                      : "tag badge-blue"
                }
              >
                {userPlanLabel(user)}
              </span>
              <span className={kyc.className}>{kyc.label}</span>
              {user.investorType && (
                <span className="tag badge-blue">{user.investorType}</span>
              )}
            </div>
            <div className="profile-meta">
              <span className="profile-meta-item">✉ {user.email}</span>
              {user.location && (
                <span className="profile-meta-item">📍 {user.location}</span>
              )}
              <span className="profile-meta-item">
                📅 Member since {memberSince(user.createdAt)}
              </span>
            </div>
          </div>
        </div>

        <div className="grid-2" style={{ gap: "22px" }}>
          <div className="card">
            <h3 className="mb-16">Profile Settings</h3>
            <div className="form-group">
              <label>First Name</label>
              <input
                type="text"
                value={form.firstName}
                onChange={(e) =>
                  setForm({ ...form, firstName: e.target.value })
                }
              />
            </div>
            <div className="form-group">
              <label>Last Name</label>
              <input
                type="text"
                value={form.lastName}
                onChange={(e) => setForm({ ...form, lastName: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label>Email Address</label>
              <input type="email" value={user.email} disabled />
            </div>
            <div className="form-group">
              <label>Phone Number</label>
              <input
                type="tel"
                placeholder="+44 7700 900000"
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label>Location</label>
              <input
                type="text"
                placeholder="e.g. Manchester, UK"
                value={form.location}
                onChange={(e) => setForm({ ...form, location: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label>Investor Type</label>
              <select
                value={form.investorType}
                onChange={(e) =>
                  setForm({ ...form, investorType: e.target.value })
                }
              >
                {INVESTOR_TYPES.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
            </div>
            <button
              className="btn btn-gold"
              onClick={handleSaveProfile}
              disabled={savingProfile}
            >
              {savingProfile ? "Saving…" : "Save Changes"}
            </button>
          </div>

          <div className="card">
            <h3 className="mb-16">Password & Security</h3>
            <div className="form-group">
              <label>Current Password</label>
              <input
                type="password"
                placeholder="••••••••"
                value={passwords.current}
                onChange={(e) =>
                  setPasswords({ ...passwords, current: e.target.value })
                }
              />
            </div>
            <div className="form-group">
              <label>New Password</label>
              <input
                type="password"
                placeholder="Minimum 8 characters"
                value={passwords.next}
                onChange={(e) =>
                  setPasswords({ ...passwords, next: e.target.value })
                }
              />
            </div>
            <div className="form-group">
              <label>Confirm New Password</label>
              <input
                type="password"
                placeholder="Repeat new password"
                value={passwords.confirm}
                onChange={(e) =>
                  setPasswords({ ...passwords, confirm: e.target.value })
                }
              />
            </div>
            <button
              className="btn btn-gold btn-sm"
              onClick={handleChangePassword}
              disabled={savingPassword}
            >
              {savingPassword ? "Updating…" : "Update Password"}
            </button>
          </div>

          <div className="card" style={{ gridColumn: "1/-1" }}>
            <h3 className="mb-16">Notification Preferences</h3>
            <div className="grid-3" style={{ gap: "10px" }}>
              {ALL_NOTIFICATION_PREFS.map((pref) => (
                <label className="checkbox-item" key={pref}>
                  <input
                    type="checkbox"
                    checked={prefs.includes(pref)}
                    onChange={() => togglePref(pref)}
                  />{" "}
                  {pref}
                </label>
              ))}
            </div>
            <button
              className="btn btn-gold btn-sm"
              style={{ marginTop: "18px" }}
              onClick={handleSavePrefs}
              disabled={savingPrefs}
            >
              {savingPrefs ? "Saving…" : "Save Preferences"}
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
