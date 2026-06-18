const kycSteps: { stepClass: string; num: string; label: string }[] = [
  { stepClass: "kyc-step done", num: "✓", label: "Create Account" },
  { stepClass: "kyc-step done", num: "✓", label: "Email Verified" },
  { stepClass: "kyc-step active", num: "3", label: "ID Verification" },
  { stepClass: "kyc-step", num: "4", label: "AML Check" },
  { stepClass: "kyc-step", num: "5", label: "Verified ✓" },
];

const complianceRows: { label: string; status: React.ReactNode; mono?: boolean }[] = [
  {
    label: "Identity Document (Passport / Driving Licence)",
    status: (
      <>
        <span style={{ color: "var(--green)" }}>✓</span> Verified
      </>
    ),
  },
  {
    label: "Selfie / Liveness Check",
    status: (
      <>
        <span style={{ color: "var(--green)" }}>✓</span> Passed
      </>
    ),
  },
  {
    label: "KYC — Know Your Customer",
    status: (
      <>
        <span style={{ color: "var(--green)" }}>✓</span> Completed
      </>
    ),
  },
  {
    label: "AML — Anti-Money Laundering Screening",
    status: (
      <>
        <span style={{ color: "var(--green)" }}>✓</span> Clear
      </>
    ),
  },
  {
    label: "PEP & Sanctions Check",
    status: (
      <>
        <span style={{ color: "var(--green)" }}>✓</span> Clear
      </>
    ),
  },
  { label: "Verification Date", status: "14 Feb 2026", mono: true },
  { label: "Next Review Due", status: "14 Feb 2027", mono: true },
  { label: "Credas Reference", status: "CRED-2026-08432", mono: true },
];

const auditTrail: {
  user: string;
  check: string;
  resultLabel: string;
  resultBadge: string;
  date: string;
  ref: string;
}[] = [
  { user: "James Smith", check: "Full KYC + AML", resultLabel: "Passed", resultBadge: "badge-green", date: "14 Feb 2026", ref: "CRED-2026-08432" },
  { user: "A. Patel", check: "KYC", resultLabel: "In Progress", resultBadge: "badge-amber", date: "09 Jun 2026", ref: "CRED-2026-19287" },
  { user: "Unknown123", check: "KYC", resultLabel: "Failed", resultBadge: "badge-red", date: "07 Jun 2026", ref: "CRED-2026-19104" },
];

export default function Kyc() {
  return (
    <section className="section" id="kyc">
      <div className="container">
        <div className="tag mb-8">Credas Integration</div>
        <h2 className="mb-8">Identity Verification & Compliance</h2>
        <p className="muted mb-32">
          Powered by Credas. Secure KYC, AML screening, and compliance checks
          are required to submit listings and access full contact details.
        </p>

        <div className="kyc-flow">
          <div className="kyc-steps">
            {kycSteps.map((step) => (
              <div className={step.stepClass} key={step.label}>
                <div className="kyc-step-num">{step.num}</div>
                <p>{step.label}</p>
              </div>
            ))}
          </div>

          <div className="kyc-card">
            <div className="verification-badge">
              <div className="v-icon">✅</div>
              <div>
                <h4>Identity Verified via Credas</h4>
                <p>
                  Your identity has been verified. AML screening passed.
                  Verification ID: CRED-2026-08432
                </p>
              </div>
            </div>

            <h3 className="mb-16">Compliance Status</h3>
            {complianceRows.map((row) => (
              <div className="compliance-row" key={row.label}>
                <span className="c-label">{row.label}</span>
                <span className={row.mono ? "c-status mono" : "c-status"}>
                  {row.status}
                </span>
              </div>
            ))}

            <div className="divider"></div>

            <div className="alert alert-info">
              <span>ℹ️</span>
              <div>
                Your verification data is stored securely in compliance with
                GDPR. It is used solely for the purpose of identity and AML
                screening. View our{" "}
                <a href="#trust" className="inline-link">
                  Privacy Policy
                </a>{" "}
                for full details.
              </div>
            </div>

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
                🔐 Not yet verified?
              </h4>
              <p
                style={{
                  fontSize: ".85rem",
                  color: "var(--slate)",
                  marginBottom: "16px",
                }}
              >
                Verification is required to submit listings and view contact
                details. The process takes under 5 minutes via Credas secure
                identity checks.
              </p>
              <button className="btn btn-gold">
                Start Verification with Credas →
              </button>
            </div>
          </div>

          <div className="card" style={{ marginTop: "28px" }}>
            <h3 className="mb-16">🛡 Admin: Compliance Audit Trail</h3>
            <table className="admin-table">
              <thead>
                <tr>
                  <th>User</th>
                  <th>Check Type</th>
                  <th>Result</th>
                  <th>Date</th>
                  <th>Credas Ref</th>
                </tr>
              </thead>
              <tbody>
                {auditTrail.map((row) => (
                  <tr key={row.ref}>
                    <td>{row.user}</td>
                    <td>{row.check}</td>
                    <td>
                      <span className={`tag ${row.resultBadge}`}>
                        {row.resultLabel}
                      </span>
                    </td>
                    <td className="mono">{row.date}</td>
                    <td className="mono">{row.ref}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <p
              style={{
                marginTop: "12px",
                fontSize: ".78rem",
                color: "var(--slate)",
              }}
            >
              Audit records retained for 5 years in accordance with AML
              regulations. All checks performed via Credas API.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
