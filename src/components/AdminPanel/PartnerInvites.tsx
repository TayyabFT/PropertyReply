"use client";

import { useEffect, useState, type FormEvent } from "react";
import { useAuth } from "@/lib/auth";
import { partnerInvitesApi, type PartnerInvite } from "@/lib/api";

export default function PartnerInvites() {
  const { token } = useAuth();
  const [invites, setInvites] = useState<PartnerInvite[]>([]);
  const [email, setEmail] = useState("");
  const [note, setNote] = useState("");
  const [daysValid, setDaysValid] = useState(30);
  const [busy, setBusy] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  useEffect(() => {
    if (!token) return;
    let cancelled = false;
    partnerInvitesApi.list(token).then((res) => { if (!cancelled) setInvites(res.data); })
      .catch((err) => { if (!cancelled) setError(err.message); });
    return () => { cancelled = true; };
  }, [token]);

  async function create(event: FormEvent) {
    event.preventDefault();
    if (!token) return;
    setBusy("create"); setError(""); setMessage("");
    try {
      const res = await partnerInvitesApi.create(token, { email, note, daysValid });
      setInvites((items) => [res.data, ...items]);
      setEmail(""); setNote("");
      setMessage("Invitation created. Copy the link below and share it with the recipient.");
    } catch (err) { setError(err instanceof Error ? err.message : "Unable to create invitation."); }
    finally { setBusy(""); }
  }

  async function revoke(id: string) {
    if (!token) return;
    setBusy(id); setError("");
    try {
      const res = await partnerInvitesApi.revoke(token, id);
      setInvites((items) => items.map((item) => item.id === id ? res.data : item));
    } catch (err) { setError(err instanceof Error ? err.message : "Unable to revoke invitation."); }
    finally { setBusy(""); }
  }

  return <div className="admin-card" id="admin-partner-invites">
    <div className="admin-card-header"><h3>Invited Partner — two months free</h3></div>
    <div style={{ padding: 20 }}>
      <p>Invite new or existing members by email. No card or subscription fee for two months from acceptance. Listings remain free; the fee is 5% of sale price during the offer, then 10%. Existing subscriptions are cancelled on acceptance with the user&apos;s acknowledgement.</p>
      <p className="muted">Each account can redeem this offer once. Unsubscribed users&apos; listings are hidden after expiry. Creating a link does not send an email.</p>
      {error && <p role="alert" className="alert alert-error">{error}</p>}
      {message && <p role="status" className="alert alert-success">{message}</p>}
      <form onSubmit={create} style={{ display: "flex", gap: 12, flexWrap: "wrap", margin: "20px 0", alignItems: "end" }}>
        <label className="form-group">Recipient email<input type="email" required maxLength={254} value={email} onChange={(e) => setEmail(e.target.value)} /></label>
        <label className="form-group">Admin note<input maxLength={200} value={note} onChange={(e) => setNote(e.target.value)} /></label>
        <label className="form-group">Link valid for (days)<input type="number" min={1} max={90} required value={daysValid} onChange={(e) => setDaysValid(Number(e.target.value))} /></label>
        <button className="btn btn-gold" disabled={Boolean(busy)}>{busy === "create" ? "Creating…" : "Create invitation"}</button>
      </form>
      <div style={{ overflowX: "auto" }}><table style={{ width: "100%" }}>
        <thead><tr><th>Email / note</th><th>Status</th><th>Link expires</th><th>Offer ends</th><th>Invitation</th></tr></thead>
        <tbody>{invites.map((invite) => <tr key={invite.id}>
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
      </table>{!invites.length && <p>No Invited Partner invitations yet.</p>}</div>
    </div>
  </div>;
}
