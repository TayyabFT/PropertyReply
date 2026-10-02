"use client";

import Link from "next/link";
import { useState } from "react";
import { useAuth } from "@/lib/auth";
import { partnerInvitesApi } from "@/lib/api";

export default function PartnerOffer({ initialCode = "" }: { initialCode?: string }) {
  const { user, token, ready, updateUser } = useAuth();
  const [code, setCode] = useState(initialCode);
  const [acknowledged, setAcknowledged] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [accepted, setAccepted] = useState(false);
  const next = encodeURIComponent(`/partner-invite?code=${encodeURIComponent(code.trim())}`);

  async function accept() {
    if (!token) return;
    setBusy(true);
    setError("");
    try {
      const response = await partnerInvitesApi.accept(token, code, acknowledged);
      updateUser(response.data.user);
      setAccepted(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to accept invitation.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="card" style={{ maxWidth: 680, margin: "24px auto", textAlign: "left" }}>
      <h2>Invited Partner</h2>
      <p>Enjoy two calendar months of free membership from the day you accept. No card is required and there is no automatic subscription charge.</p>
      <ul style={{ paddingLeft: 22, margin: "16px 0" }}>
        <li>Browse deals and publish listings after identity verification and admin approval.</li>
        <li>Listing submissions are free during and after the offer.</li>
        <li>During the offer, the success fee is 5% of the property sale price (£25,000 on a £500,000 sale).</li>
        <li>After two months, choose an available subscription and enter your card details. The success fee becomes 10% of the sale price.</li>
        <li>Without an active paid subscription after expiry, your listings are hidden until you subscribe. They are not deleted.</li>
      </ul>
      {user?.hasBillingSubscription && !accepted && (
        <div className="alert alert-warn" style={{ marginBottom: 16 }}>
          Accepting cancels your current subscription immediately, without a prorated refund. You will not be charged a new subscription fee during this offer. Existing invoices and sale fees remain payable.
        </div>
      )}
      {error && <p role="alert" className="alert alert-error">{error}</p>}
      {accepted ? (
        <div role="status">
          <p>Your invitation is accepted. Your offer ends on {user?.invitedPartnerEndsAt ? new Date(user.invitedPartnerEndsAt).toLocaleDateString("en-GB") : "the date shown in Membership"}.</p>
          <Link className="btn btn-gold" href="/app/dashboard">Go to dashboard</Link>
        </div>
      ) : (
        <>
          <label className="form-group" style={{ display: "block" }}>
            Invitation code
            <input value={code} onChange={(event) => setCode(event.target.value.trim())} placeholder="IP-…" autoComplete="off" />
          </label>
          {ready && user ? (
            <>
              <p className="muted">Accepting as {user.email}. Use the account matching the invitation email.</p>
              <label style={{ display: "flex", gap: 10, margin: "16px 0", alignItems: "flex-start" }}>
                <input type="checkbox" checked={acknowledged} onChange={(event) => setAcknowledged(event.target.checked)} style={{ width: "auto", marginTop: 5 }} />
                <span>I accept these terms, including immediate cancellation of any existing subscription without a prorated refund.</span>
              </label>
              <button className="btn btn-gold" disabled={busy || !code || !acknowledged} onClick={accept}>
                {busy ? "Accepting…" : "Accept two-month invitation"}
              </button>
            </>
          ) : ready ? (
            <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
              <Link className="btn btn-gold" href={`/register?next=${next}`}>Create account</Link>
              <Link className="btn btn-outline" href={`/login?next=${next}`}>Sign in to accept</Link>
            </div>
          ) : <p>Loading account…</p>}
        </>
      )}
    </div>
  );
}
