"use client";

import { useState, type FormEvent } from "react";
import { useAuth } from "@/lib/auth";
import { partnerInvitesApi } from "@/lib/api";
import Pagination from "@/components/Pagination";
import { AdminPage, ListState, errorMessage, usePagedList } from "./shared";

export default function PartnerInvites() {
  const { token } = useAuth();
  const list = usePagedList((authToken, page) => partnerInvitesApi.list(authToken, page));
  const [email, setEmail] = useState("");
  const [note, setNote] = useState("");
  const [daysValid, setDaysValid] = useState(30);
  const [busy, setBusy] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  async function create(event: FormEvent) {
    event.preventDefault();
    if (!token) return;
    setBusy("create"); setError(""); setMessage("");
    try {
      await partnerInvitesApi.create(token, { email, note, daysValid });
      if (list.page === 1) list.reload();
      else list.setPage(1);
      setEmail(""); setNote("");
      setMessage("Invitation created. Copy the link below and share it with the recipient.");
    } catch (err) { setError(errorMessage(err, "Unable to create invitation.")); }
    finally { setBusy(""); }
  }

  async function revoke(id: string) {
    if (!token) return;
    setBusy(id); setError("");
    try {
      const res = await partnerInvitesApi.revoke(token, id);
      list.setItems((items) => items.map((item) => item.id === id ? res.data : item));
    } catch (err) { setError(errorMessage(err, "Unable to revoke invitation.")); }
    finally { setBusy(""); }
  }

  return <AdminPage
    title="Invited Partners"
    description="Invite new or existing members by email. No card or subscription fee for two months from acceptance. Listings remain free; the fee is 5% of sale price during the offer, then 10%. Existing subscriptions are cancelled on acceptance with the user's acknowledgement."
  >
    <div className="admin-card">
      <div className="admin-card-header"><h3>✉ Create an invitation</h3></div>
      <div className="admin-card-body">
        <p className="muted">Each account can redeem this offer once. Unsubscribed users&apos; listings are hidden after expiry. Creating a link does not send an email.</p>
        {error && <p role="alert" className="alert alert-error">{error}</p>}
        {message && <p role="status" className="alert alert-success">{message}</p>}
        <form onSubmit={create} style={{ display: "flex", gap: 12, flexWrap: "wrap", marginTop: 16, alignItems: "end" }}>
          <label className="form-group">Recipient email<input type="email" required maxLength={254} value={email} onChange={(e) => setEmail(e.target.value)} /></label>
          <label className="form-group">Admin note<input maxLength={200} value={note} onChange={(e) => setNote(e.target.value)} /></label>
          <label className="form-group">Link valid for (days)<input type="number" min={1} max={90} required value={daysValid} onChange={(e) => setDaysValid(Number(e.target.value))} /></label>
          <button className="btn btn-gold" disabled={Boolean(busy)}>{busy === "create" ? "Creating…" : "Create invitation"}</button>
        </form>
      </div>
    </div>

    <div className="admin-card">
      <div className="admin-card-header"><h3>Invitations ({list.pagination?.total ?? 0})</h3></div>
      <div className="admin-card-body" style={{ overflowX: "auto" }}>
        <ListState loading={list.loading} error={list.error} empty={list.items.length === 0} emptyText="No Invited Partner invitations yet." />
        {list.items.length > 0 && <table className="admin-table">
          <thead><tr><th>Email / note</th><th>Status</th><th>Link expires</th><th>Offer ends</th><th>Invitation</th></tr></thead>
          <tbody>{list.items.map((invite) => <tr key={invite.id}>
            <td>{invite.email}<br /><small>{invite.note}</small></td>
            <td>{invite.status}</td>
            <td>{new Date(invite.expiresAt).toLocaleDateString("en-GB")}</td>
            <td>{invite.offerEndsAt ? new Date(invite.offerEndsAt).toLocaleDateString("en-GB") : "Not accepted"}</td>
            <td>{invite.status === "active" && <>
              <input aria-label={`Invitation link for ${invite.email}`} readOnly value={invite.inviteUrl} onFocus={(e) => e.currentTarget.select()} />
              <button className="btn btn-outline btn-sm" onClick={async () => {
                try { await navigator.clipboard.writeText(invite.inviteUrl); setMessage("Invitation link copied."); }
                catch { setMessage("Select the invitation link and copy it manually."); }
              }}>Copy link</button>{" "}
              <button className="btn btn-outline btn-sm" disabled={Boolean(busy)} onClick={() => revoke(invite.id)}>Revoke</button>
            </>}</td>
          </tr>)}</tbody>
        </table>}
        <Pagination pagination={list.pagination} onChange={list.setPage} disabled={list.loading} />
      </div>
    </div>
  </AdminPage>;
}
