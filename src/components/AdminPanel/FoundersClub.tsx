"use client";

import { useState, type FormEvent } from "react";
import { useAuth } from "@/lib/auth";
import { adminApi } from "@/lib/api";
import Pagination from "@/components/Pagination";
import { AdminPage, ListState, errorMessage, usePagedList, useToast } from "./shared";

const labelStyle = { display: "grid", gap: "4px", textAlign: "left" } as const;
const captionStyle = { fontSize: ".75rem", color: "var(--slate)" };

export default function FoundersClub() {
  const { token } = useAuth();
  const { showToast, toastElement } = useToast();
  const [busyId, setBusyId] = useState<string | null>(null);
  const [form, setForm] = useState({ email: "", note: "", daysValid: "30" });
  const [creating, setCreating] = useState(false);
  const list = usePagedList((authToken, page) => adminApi.getCommercialInvites(authToken, page));

  const handleCreate = async (event: FormEvent) => {
    event.preventDefault();
    if (!token) return;
    setCreating(true);
    try {
      const res = await adminApi.createCommercialInvite(token, {
        email: form.email.trim() || undefined,
        note: form.note.trim() || undefined,
        daysValid: Number(form.daysValid) || 30,
      });
      setForm({ email: "", note: "", daysValid: "30" });
      if (list.page === 1) list.reload();
      else list.setPage(1);
      try {
        await navigator.clipboard.writeText(res.data.inviteUrl);
        showToast(`Invite ${res.data.code} created — link copied to clipboard.`);
      } catch {
        showToast(`Invite ${res.data.code} created. Share the link with your partner.`);
      }
    } catch (err) {
      showToast(errorMessage(err, "Could not create invite."));
    } finally {
      setCreating(false);
    }
  };

  const revoke = async (id: string) => {
    if (!token) return;
    setBusyId(id);
    try {
      await adminApi.revokeCommercialInvite(token, id);
      list.setItems((prev) => prev.map((i) => (i.id === id ? { ...i, status: "revoked" } : i)));
      showToast("Invite revoked.");
    } catch (err) {
      showToast(errorMessage(err, "Could not revoke invite."));
    } finally {
      setBusyId(null);
    }
  };

  return (
    <AdminPage
      title="Founders Club"
      description="Invite-only £25/mo for 12 months, 5% success fee. Create a code and share the link — only people you invite can join. You can also grant Founders Club directly from Users."
    >
      {toastElement}
      <div className="admin-card">
        <div className="admin-card-header"><h3>🏛 Create an invite</h3></div>
        <div className="admin-card-body">
          <form
            onSubmit={handleCreate}
            style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: "12px", alignItems: "end" }}
          >
            <label style={labelStyle}>
              <span style={captionStyle}>Lock to email (optional)</span>
              <input type="email" value={form.email} onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))} placeholder="partner@example.com" style={{ padding: "8px 12px" }} />
            </label>
            <label style={labelStyle}>
              <span style={captionStyle}>Note</span>
              <input type="text" value={form.note} onChange={(e) => setForm((f) => ({ ...f, note: e.target.value }))} placeholder="e.g. partner name" style={{ padding: "8px 12px" }} />
            </label>
            <label style={labelStyle}>
              <span style={captionStyle}>Valid days</span>
              <input type="number" min={1} max={365} value={form.daysValid} onChange={(e) => setForm((f) => ({ ...f, daysValid: e.target.value }))} style={{ padding: "8px 12px" }} />
            </label>
            <button type="submit" className="btn btn-gold btn-sm" disabled={creating} style={{ height: "40px" }}>
              {creating ? "Creating…" : "Create Invite"}
            </button>
          </form>
        </div>
      </div>

      <div className="admin-card">
        <div className="admin-card-header"><h3>Invites ({list.pagination?.total ?? 0})</h3></div>
        <div className="admin-card-body" style={{ overflowX: "auto" }}>
          <ListState loading={list.loading} error={list.error} empty={list.items.length === 0} emptyText="No invites yet." />
          {list.items.length > 0 && (
            <table className="admin-table">
              <thead>
                <tr><th>Code</th><th>Email lock</th><th>Note</th><th>Status</th><th>Used by</th><th>Actions</th></tr>
              </thead>
              <tbody>
                {list.items.map((invite) => (
                  <tr key={invite.id}>
                    <td><strong className="mono">{invite.code}</strong></td>
                    <td>{invite.email || "—"}</td>
                    <td>{invite.note || "—"}</td>
                    <td>
                      <span className={invite.status === "active" ? "tag badge-green" : invite.status === "used" ? "tag badge-blue" : "tag badge-red"}>
                        {invite.status}
                      </span>
                    </td>
                    <td>{invite.usedBy ? `${invite.usedBy}${invite.usedByEmail ? ` (${invite.usedByEmail})` : ""}` : "—"}</td>
                    <td>
                      <div className="action-btns">
                        {invite.status === "active" && (
                          <>
                            <button
                              type="button"
                              className="btn btn-outline btn-sm"
                              onClick={async () => {
                                try {
                                  await navigator.clipboard.writeText(invite.inviteUrl);
                                  showToast("Invite link copied.");
                                } catch {
                                  showToast(invite.inviteUrl);
                                }
                              }}
                            >
                              Copy link
                            </button>
                            <button type="button" className="btn btn-red btn-sm" disabled={busyId === invite.id} onClick={() => revoke(invite.id)}>
                              Revoke
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
          <Pagination pagination={list.pagination} onChange={list.setPage} disabled={list.loading} />
        </div>
      </div>
    </AdminPage>
  );
}
