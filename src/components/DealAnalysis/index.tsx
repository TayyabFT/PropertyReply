const flipRows: { lbl: string; val: string; valClass?: string }[] = [
  { lbl: "Purchase Price", val: "£118,000" },
  { lbl: "Stamp Duty", val: "- £3,600", valClass: "neg" },
  { lbl: "Refurbishment (est.)", val: "- £18,000", valClass: "neg" },
  { lbl: "Legal & Finance Costs", val: "- £2,400", valClass: "neg" },
  { lbl: "Total Investment", val: "£142,000" },
  { lbl: "Estimated Sale Price", val: "£182,000", valClass: "green" },
];

const btlRows: { lbl: string; val: string; valClass?: string }[] = [
  { lbl: "Gross Monthly Rent", val: "£730", valClass: "green" },
  { lbl: "Annual Gross Rent", val: "£8,760", valClass: "green" },
  { lbl: "Gross Yield", val: "7.4%" },
  { lbl: "Est. Mortgage (75% LTV)", val: "- £440/mo", valClass: "neg" },
  { lbl: "Management (10%)", val: "- £73/mo", valClass: "neg" },
  { lbl: "Insurance & Maintenance", val: "- £60/mo", valClass: "neg" },
];

const contactBox = {
  background: "rgba(255,255,255,.04)",
  border: "1px solid rgba(255,255,255,.07)",
  borderRadius: "var(--radius)",
  padding: "14px",
} as const;

export default function DealAnalysis() {
  return (
    <section className="section" id="deal-analysis">
      <div className="container">
        <div className="tag mb-8">Premium Feature</div>
        <h2 className="mb-32">Deal Analysis — 3-Bed Terrace, Manchester</h2>

        <div className="analysis-card">
          <div className="analysis-header">
            <div>
              <h3 style={{ fontSize: "1.05rem" }}>
                📍 12 Oakfield Road, Salford, M6 5PX
              </h3>
              <p
                style={{
                  color: "var(--slate)",
                  fontSize: ".82rem",
                  marginTop: "4px",
                }}
              >
                Submitted by: J. Thompson · Verified Seller{" "}
                <span className="tag badge-green" style={{ marginLeft: "8px" }}>
                  ✓ KYC Passed
                </span>
              </p>
            </div>
            <div style={{ display: "flex", gap: "10px" }}>
              <button className="btn btn-outline btn-sm">❤ Save</button>
              <button className="btn btn-outline btn-sm">⚑ Report</button>
              <button className="btn btn-gold btn-sm">Contact Seller</button>
            </div>
          </div>

          <div className="analysis-body">
            <div className="analysis-grid">
              <div className="metric-box">
                <div className="label">Asking Price</div>
                <div className="value gold">£118,000</div>
                <div className="sub">Negotiable</div>
              </div>
              <div className="metric-box">
                <div className="label">Market Value</div>
                <div className="value">£178,000</div>
                <div className="sub">Est. via comparables</div>
              </div>
              <div className="metric-box">
                <div className="label">Discount</div>
                <div className="value green">34%</div>
                <div className="sub">£60,000 below market</div>
              </div>
              <div className="metric-box">
                <div className="label">Est. Rental Yield</div>
                <div className="value">7.4%</div>
                <div className="sub">~£730/month gross</div>
              </div>
            </div>

            <div className="discount-meter mb-24">
              <div className="flex-between mb-8">
                <span style={{ fontSize: ".82rem", color: "var(--slate)" }}>
                  Discount calculator
                </span>
                <span
                  className="mono"
                  style={{ fontSize: ".82rem", color: "var(--gold)" }}
                >
                  34% Below Market Value
                </span>
              </div>
              <div className="meter-track">
                <div className="meter-fill" style={{ width: "68%" }}></div>
              </div>
              <div
                className="flex-between"
                style={{
                  fontSize: ".72rem",
                  color: "var(--slate)",
                  marginTop: "4px",
                }}
              >
                <span>0%</span>
                <span style={{ color: "var(--gold)" }}>34% discount</span>
                <span>50%</span>
              </div>
            </div>

            <div className="grid-2">
              <div>
                <p className="form-section-title">📊 Flip Analysis</p>
                {flipRows.map((row) => (
                  <div className="calc-row" key={row.lbl}>
                    <span className="lbl">{row.lbl}</span>
                    <span className={row.valClass ? `val ${row.valClass}` : "val"}>
                      {row.val}
                    </span>
                  </div>
                ))}
                <div className="divider"></div>
                <div className="calc-row total">
                  <span className="lbl" style={{ fontWeight: 600 }}>
                    Gross Profit Potential
                  </span>
                  <span className="val">£40,000</span>
                </div>
              </div>
              <div>
                <p className="form-section-title">🏠 Buy-to-Let Analysis</p>
                {btlRows.map((row) => (
                  <div className="calc-row" key={row.lbl}>
                    <span className="lbl">{row.lbl}</span>
                    <span className={row.valClass ? `val ${row.valClass}` : "val"}>
                      {row.val}
                    </span>
                  </div>
                ))}
                <div className="divider"></div>
                <div className="calc-row total">
                  <span className="lbl" style={{ fontWeight: 600 }}>
                    Net Monthly Cashflow
                  </span>
                  <span className="val">£157/mo</span>
                </div>
              </div>
            </div>

            <div
              style={{
                marginTop: "28px",
                padding: "20px",
                background: "rgba(255,255,255,.04)",
                borderRadius: "var(--radius)",
                border: "1px solid rgba(255,255,255,.07)",
              }}
            >
              <p className="form-section-title">📝 Seller&apos;s Description</p>
              <p
                style={{
                  fontSize: ".88rem",
                  color: "#a0b8cc",
                  lineHeight: 1.8,
                }}
              >
                3-bedroom end-of-terrace house requiring cosmetic refurbishment.
                Property has been vacant for 8 months, vendor motivated to sell
                quickly due to relocation. Gas central heating, double glazed
                throughout. Rear garden. Close to schools and transport links.
                Chain-free. Similar sold comparables in the area range from
                £168k–£188k. Vendor will consider quick cash offers.
              </p>
            </div>

            <div style={{ marginTop: "24px" }}>
              <p className="form-section-title">
                📞 Contact Details{" "}
                <span className="tag" style={{ marginLeft: "8px" }}>
                  Premium Only
                </span>
              </p>
              <div className="grid-2" style={{ gap: "12px" }}>
                <div style={contactBox}>
                  <p style={{ fontSize: ".75rem", color: "var(--slate)" }}>
                    Name
                  </p>
                  <p style={{ fontSize: ".9rem", fontWeight: 600 }}>
                    James Thompson
                  </p>
                </div>
                <div style={contactBox}>
                  <p style={{ fontSize: ".75rem", color: "var(--slate)" }}>
                    Phone
                  </p>
                  <p style={{ fontSize: ".9rem", fontWeight: 600 }}>
                    07912 ••• •••{" "}
                    <span style={{ fontSize: ".75rem", color: "var(--slate)" }}>
                      (Upgrade to see)
                    </span>
                  </p>
                </div>
                <div style={contactBox}>
                  <p style={{ fontSize: ".75rem", color: "var(--slate)" }}>
                    Email
                  </p>
                  <p style={{ fontSize: ".9rem", fontWeight: 600 }}>
                    j.thom••••@••••.co.uk
                  </p>
                </div>
                <div style={contactBox}>
                  <p style={{ fontSize: ".75rem", color: "var(--slate)" }}>
                    Role
                  </p>
                  <p style={{ fontSize: ".9rem", fontWeight: 600 }}>
                    Sourcing Agent
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
