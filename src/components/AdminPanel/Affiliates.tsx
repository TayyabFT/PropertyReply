"use client";

import { useState, type FormEvent } from "react";
import { useAuth } from "@/lib/auth";
import { affiliatesApi, type AffiliateReport } from "@/lib/api";
import Pagination from "@/components/Pagination";
import { affiliateMetrics, commissionBadge, formatDate, formatGBP } from "@/components/Affiliate/format";
import { AdminPage, ListState, errorMessage, usePagedList } from "./shared";

const inputStyle = { padding: "8px 12px" };

export default function Affiliates() {
  const { token } = useAuth();
  const [totalUnpaid, setTotalUnpaid] = useState(0);
  const list = usePagedList((authToken, page) =>
    affiliatesApi.list(authToken, page).then((res) => {
      setTotalUnpaid(res.totalUnpaidGBP);
      return res;
    }),
  );
  const [selected, setSelected] = useState<AffiliateReport | null>(null);
  const [form, setForm] = useState({ email: "", code: "", commissionGBP: "15", note: "" });
  const [payoutReference, setPayoutReference] = useState("");
  const [busy, setBusy] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  /** Run an action that returns a fresh report, show it, and optionally refresh the list totals. */
  async function run(key: string, action: () => Promise<{ data: AffiliateReport }>, success: string, refreshList = true) {
    setBusy(key); setError(""); setMessage("");
    try {
      const { data } = await action();
      setSelected(data);
      if (refreshList) list.reload();
      setMessage(success);
      return true;
    } catch (err) {
      setError(errorMessage(err, "Something went wrong."));
      return false;
    } finally { setBusy(""); }
  }

  async function create(event: FormEvent) {
    event.preventDefault();
    if (!token) return;
    const ok = await run("create", () => affiliatesApi.create(token, {
      email: form.email,
      code: form.code.trim() || undefined,
      commissionGBP: Number(form.commissionGBP),
      note: form.note,
    }), "Affiliate added. They can now see the Affiliate page in their account.");
    if (ok) setForm({ email: "", code: "", commissionGBP: "15", note: "" });
  }

  return <AdminPage
    title="Affiliates"
    description="Each affiliate earns their commission (default £15) once per referred user, when that user makes their first subscription payment. Free-trial signups earn nothing. Pay them yourself, then press “Mark as paid” to record it."
    actions={<span className="chip">Total unpaid: <strong>&nbsp;{formatGBP(totalUnpaid)}</strong></span>}
  >
    {error && <p role="alert" className="alert alert-error">{error}</p>}
    {message && <p role="status" className="alert alert-success">{message}</p>}

    <div className="admin-card">
      <div className="admin-card-header"><h3>🤝 Add an affiliate</h3></div>
      <div className="admin-card-body">
        <p className="muted" style={{ marginBottom: 12 }}>The person must already have a PropertyReply account.</p>
        <form onSubmit={create} style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: 12, alignItems: "end" }}>
          <label style={{ display: "grid", gap: 4 }}>
            <span style={{ fontSize: ".75rem", color: "var(--slate)" }}>Account email</span>
            <input type="email" required maxLength={254} value={form.email} onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))} placeholder="marketer@example.com" style={inputStyle} />
          </label>
          <label style={{ display: "grid", gap: 4 }}>
            <span style={{ fontSize: ".75rem", color: "var(--slate)" }}>Referral code (optional)</span>
            <input maxLength={20} pattern="[A-Za-z0-9]{3,20}" title="3–20 letters or numbers" value={form.code} onChange={(e) => setForm((f) => ({ ...f, code: e.target.value.toUpperCase() }))} placeholder="Auto, e.g. ALI123" style={inputStyle} />
          </label>
          <label style={{ display: "grid", gap: 4 }}>
            <span style={{ fontSize: ".75rem", color: "var(--slate)" }}>Commission per paying user (£)</span>
            <input type="number" min={0} max={1000} step="0.01" required value={form.commissionGBP} onChange={(e) => setForm((f) => ({ ...f, commissionGBP: e.target.value }))} style={inputStyle} />
          </label>
          <label style={{ display: "grid", gap: 4 }}>
            <span style={{ fontSize: ".75rem", color: "var(--slate)" }}>Admin note</span>
            <input maxLength={200} value={form.note} onChange={(e) => setForm((f) => ({ ...f, note: e.target.value }))} style={inputStyle} />
          </label>
          <button className="btn btn-gold btn-sm" disabled={Boolean(busy)} style={{ height: 40 }}>{busy === "create" ? "Adding…" : "Add affiliate"}</button>
        </form>
      </div>
    </div>

    <div className="admin-card">
      <div className="admin-card-header"><h3>Affiliates ({list.pagination?.total ?? 0})</h3></div>
      <div className="admin-card-body" style={{ overflowX: "auto" }}>
        <ListState loading={list.loading} error={list.error} empty={list.items.length === 0} emptyText="No affiliates yet." />
        {list.items.length > 0 && <table className="admin-table">
          <thead><tr><th>Affiliate</th><th>Code</th><th>Clicks</th><th>Signups</th><th>Paying</th><th>Unpaid</th><th>Paid</th><th>Status</th><th>Actions</th></tr></thead>
          <tbody>{list.items.map((a) => <tr key={a.id}>
            <td>{a.user?.name ?? "Deleted user"}<br /><small className="muted">{a.user?.email}{a.note ? ` · ${a.note}` : ""}</small></td>
            <td><strong className="mono">{a.code}</strong><br /><small className="muted">{formatGBP(a.commissionGBP)} each</small></td>
            <td>{a.clicks}</td>
            <td>{a.signups}</td>
            <td>{a.payingCustomers}</td>
            <td><strong>{formatGBP(a.pendingGBP)}</strong></td>
            <td>{formatGBP(a.paidGBP)}</td>
            <td><span className={a.status === "active" ? "tag badge-green" : "tag badge-amber"}>{a.status}</span></td>
            <td style={{ whiteSpace: "nowrap" }}>
              <button type="button" className="btn btn-outline btn-sm" disabled={Boolean(busy)} onClick={() => token && run(`view-${a.id}`, () => affiliatesApi.detail(token, a.id), "", false)}>View</button>{" "}
              <button type="button" className="btn btn-outline btn-sm" disabled={Boolean(busy)} onClick={() => token && run(`status-${a.id}`, () => affiliatesApi.update(token, a.id, { status: a.status === "active" ? "paused" : "active" }), a.status === "active" ? "Affiliate paused. Their link no longer credits new signups." : "Affiliate resumed.")}>
                {a.status === "active" ? "Pause" : "Resume"}
              </button>
            </td>
          </tr>)}</tbody>
        </table>}
        <Pagination pagination={list.pagination} onChange={list.setPage} disabled={list.loading} />
      </div>
    </div>

    {selected && <div className="admin-card">
      <div className="admin-card-header" style={{ flexWrap: "wrap", gap: 8 }}>
        <h3>{selected.user?.name ?? "Deleted user"} — <span className="mono">{selected.code}</span></h3>
        <button type="button" className="btn btn-outline btn-sm" onClick={() => setSelected(null)}>Close</button>
      </div>
      <div className="admin-card-body">
        <p className="muted" style={{ marginBottom: 14 }}>Link: <span className="mono">{selected.link}</span></p>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(130px, 1fr))", gap: 12, marginBottom: 16 }}>
          {affiliateMetrics(selected).map((item) => <div className="metric-box" key={item.label}>
            <div className="label">{item.label}</div><div className="value">{item.value}</div>
          </div>)}
        </div>

        {selected.pendingGBP > 0 && <form
          onSubmit={(e) => { e.preventDefault(); if (token) run("pay", () => affiliatesApi.markPaid(token, selected.id, payoutReference), "Payout recorded.").then((ok) => ok && setPayoutReference("")); }}
          style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center", marginBottom: 20 }}
        >
          <input maxLength={200} value={payoutReference} onChange={(e) => setPayoutReference(e.target.value)} placeholder="Payment reference (e.g. bank transfer ref)" style={{ ...inputStyle, flex: "1 1 240px" }} />
          <button className="btn btn-gold btn-sm" disabled={Boolean(busy)}>{busy === "pay" ? "Saving…" : `Mark ${formatGBP(selected.pendingGBP)} as paid`}</button>
        </form>}

        <h4 style={{ margin: "0 0 8px" }}>Referred users ({selected.referralsPagination.total})</h4>
        <div style={{ overflowX: "auto" }}><table className="admin-table">
          <thead><tr><th>Referred user</th><th>Plan</th><th>Signed up</th><th>Commission</th><th></th></tr></thead>
          <tbody>{selected.referrals.map((r) => {
            const badge = commissionBadge(r.commission);
            const commission = r.commission;
            return <tr key={r.id}>
              <td>{r.name}<br /><small className="muted">{r.email}</small></td>
              <td>{r.plan ?? "—"}</td>
              <td>{formatDate(r.joinedAt)}</td>
              <td><span className={badge.className}>{badge.label}</span>{commission?.voidReason ? <><br /><small className="muted">{commission.voidReason}</small></> : null}</td>
              <td>{commission?.status === "pending" && <button type="button" className="btn btn-outline btn-sm" disabled={Boolean(busy)} onClick={() => {
                const reason = window.prompt("Why cancel this commission? (e.g. refunded, fake signup)");
                if (reason !== null && token) run(`void-${commission.id}`, () => affiliatesApi.voidCommission(token, commission.id, reason), "Commission cancelled.");
              }}>Cancel commission</button>}</td>
            </tr>;
          })}</tbody>
        </table>{selected.referrals.length === 0 && <p className="muted">No signups yet.</p>}</div>
        <Pagination
          pagination={selected.referralsPagination}
          disabled={Boolean(busy)}
          onChange={(page) => token && run("referrals", () => affiliatesApi.detail(token, selected.id, page), "", false)}
        />

        {selected.payouts.length > 0 && <>
          <h4 style={{ margin: "20px 0 8px" }}>Payout history</h4>
          <div style={{ overflowX: "auto" }}><table className="admin-table">
            <thead><tr><th>Date</th><th>Amount</th><th>Referrals</th><th>Reference</th></tr></thead>
            <tbody>{selected.payouts.map((p) => <tr key={p.id}>
              <td>{formatDate(p.paidAt)}</td><td><strong>{formatGBP(p.amountGBP)}</strong></td><td>{p.commissionCount}</td><td>{p.reference || "—"}</td>
            </tr>)}</tbody>
          </table></div>
        </>}
      </div>
    </div>}
  </AdminPage>;
}
