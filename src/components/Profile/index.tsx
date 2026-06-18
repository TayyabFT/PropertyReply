const notificationPrefs: { text: string; checked: boolean }[] = [
  { text: "New deal alerts (instant)", checked: true },
  { text: "Daily deal digest", checked: true },
  { text: "Listing approved", checked: true },
  { text: "Listing rejected", checked: false },
  { text: "Membership renewal", checked: true },
  { text: "Affiliate commissions", checked: true },
  { text: "Weekly performance report", checked: false },
  { text: "Security alerts", checked: true },
  { text: "Platform news", checked: false },
];

export default function Profile() {
  return (
    <section className="section section-alt" id="profile">
      <div className="container">
        <div className="tag mb-16">My Account</div>

        <div className="profile-header-card">
          <div className="profile-avatar-lg">JS</div>
          <div className="profile-info">
            <h2>James Smith</h2>
            <div
              style={{
                display: "flex",
                gap: "8px",
                flexWrap: "wrap",
                marginTop: "6px",
              }}
            >
              <span className="tag badge-green">Premium Member</span>
              <span className="tag badge-green">✓ KYC Verified</span>
              <span className="tag badge-blue">Property Investor</span>
            </div>
            <div className="profile-meta">
              <span className="profile-meta-item">✉ james@smith.co.uk</span>
              <span className="profile-meta-item">📍 Manchester, UK</span>
              <span className="profile-meta-item">📅 Member since Jan 2025</span>
              <span className="profile-meta-item">🏠 7 listings submitted</span>
            </div>
          </div>
          <div style={{ marginLeft: "auto" }}>
            <button className="btn btn-gold">Edit Profile</button>
          </div>
        </div>

        <div className="grid-2" style={{ gap: "22px" }}>
          <div className="card">
            <h3 className="mb-16">Profile Settings</h3>
            <div className="form-group">
              <label>Full Name</label>
              <input type="text" defaultValue="James Smith" />
            </div>
            <div className="form-group">
              <label>Email Address</label>
              <input type="email" defaultValue="james@smith.co.uk" />
            </div>
            <div className="form-group">
              <label>Phone Number</label>
              <input type="tel" placeholder="+44 7700 900000" />
            </div>
            <div className="form-group">
              <label>Location</label>
              <input type="text" defaultValue="Manchester, UK" />
            </div>
            <div className="form-group">
              <label>Investor Type</label>
              <select>
                <option>Property Investor</option>
                <option>Sourcing Agent</option>
                <option>Developer</option>
                <option>First-Time Buyer</option>
              </select>
            </div>
            <button className="btn btn-gold">Save Changes</button>
          </div>

          <div className="card">
            <h3 className="mb-16">Password & Security</h3>
            <div className="form-group">
              <label>Current Password</label>
              <input type="password" placeholder="••••••••" />
            </div>
            <div className="form-group">
              <label>New Password</label>
              <input type="password" placeholder="Minimum 8 characters" />
            </div>
            <div className="form-group">
              <label>Confirm New Password</label>
              <input type="password" placeholder="Repeat new password" />
            </div>
            <button className="btn btn-gold btn-sm">Update Password</button>
            <div className="divider"></div>
            <h3 className="mb-16" style={{ fontSize: ".95rem" }}>
              Two-Factor Authentication
            </h3>
            <p
              style={{
                fontSize: ".85rem",
                color: "var(--slate)",
                marginBottom: "14px",
              }}
            >
              Protect your account with 2FA via authenticator app or SMS.
            </p>
            <button className="btn btn-outline btn-sm">Enable 2FA</button>
            <div className="divider"></div>
            <h3
              className="mb-16"
              style={{ fontSize: ".95rem", color: "var(--red)" }}
            >
              Danger Zone
            </h3>
            <button
              className="btn btn-sm"
              style={{
                background: "rgba(232,64,64,.15)",
                color: "var(--red)",
                border: "1px solid rgba(232,64,64,.3)",
              }}
            >
              Delete Account
            </button>
          </div>

          <div className="card" style={{ gridColumn: "1/-1" }}>
            <h3 className="mb-16">Notification Preferences</h3>
            <div className="grid-3" style={{ gap: "10px" }}>
              {notificationPrefs.map((pref) => (
                <label className="checkbox-item" key={pref.text}>
                  <input type="checkbox" defaultChecked={pref.checked} />{" "}
                  {pref.text}
                </label>
              ))}
            </div>
            <button
              className="btn btn-gold btn-sm"
              style={{ marginTop: "18px" }}
            >
              Save Preferences
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
