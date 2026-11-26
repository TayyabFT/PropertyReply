"use client";

import { useState, type FormEvent } from "react";
import { useAuth } from "@/lib/auth";
import { adminApi } from "@/lib/api";
import Pagination from "@/components/Pagination";
import { AdminPage, ListState, errorMessage, usePagedList, useToast } from "./shared";

const emptyForm = { firstName: "", lastName: "", email: "", password: "" };
const labelStyle = { display: "grid", gap: "4px", textAlign: "left" } as const;
const captionStyle = { fontSize: ".75rem", color: "var(--slate)" };

export default function AdminAccounts() {
  const { token } = useAuth();
  const { showToast, toastElement } = useToast();
  const [form, setForm] = useState(emptyForm);
  const [creating, setCreating] = useState(false);
  const list = usePagedList((authToken, page) => adminApi.getAdmins(authToken, page));

  const handleCreate = async (event: FormEvent) => {
    event.preventDefault();
    if (!token) return;
    const email = form.email.trim();
    if (!email || !form.password) {
      showToast("Email and password are required.");
      return;
    }
    if (form.password.length < 8) {
      showToast("Password must be at least 8 characters.");
      return;
    }

    setCreating(true);
    try {
      const res = await adminApi.createAdmin(token, {
        email,
        password: form.password,
        firstName: form.firstName.trim() || undefined,
        lastName: form.lastName.trim() || undefined,
      });
      setForm(emptyForm);
      list.reload();
      showToast(res.message || "Admin account created.");
    } catch (err) {
      showToast(errorMessage(err, "Could not create admin account."));
    } finally {
      setCreating(false);
    }
  };

  return (
    <AdminPage title="Admin Accounts" description="Create another admin with an email and password. They can sign in immediately with full admin access.">
      {toastElement}
      <div className="admin-card">
        <div className="admin-card-header"><h3>🛡 Add an admin</h3></div>
        <div className="admin-card-body">
          <form
            onSubmit={handleCreate}
            style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: "12px", alignItems: "end" }}
          >
            <label style={labelStyle}>
              <span style={captionStyle}>First name</span>
              <input type="text" value={form.firstName} onChange={(e) => setForm((f) => ({ ...f, firstName: e.target.value }))} placeholder="Optional" style={{ padding: "8px 12px" }} />
            </label>
            <label style={labelStyle}>
              <span style={captionStyle}>Last name</span>
              <input type="text" value={form.lastName} onChange={(e) => setForm((f) => ({ ...f, lastName: e.target.value }))} placeholder="Optional" style={{ padding: "8px 12px" }} />
            </label>
            <label style={labelStyle}>
              <span style={captionStyle}>Email *</span>
              <input type="email" required value={form.email} onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))} placeholder="admin@example.com" style={{ padding: "8px 12px" }} />
            </label>
            <label style={labelStyle}>
              <span style={captionStyle}>Password *</span>
              <input type="password" required minLength={8} value={form.password} onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))} placeholder="Min. 8 characters" style={{ padding: "8px 12px" }} />
            </label>
            <button type="submit" className="btn btn-gold btn-sm" disabled={creating} style={{ height: "40px" }}>
              {creating ? "Creating…" : "Add Admin"}
            </button>
          </form>
        </div>
      </div>

      <div className="admin-card">
        <div className="admin-card-header"><h3>Admins ({list.pagination?.total ?? 0})</h3></div>
        <div className="admin-card-body" style={{ overflowX: "auto" }}>
          <ListState loading={list.loading} error={list.error} empty={list.items.length === 0} emptyText="No admin accounts found." />
          {list.items.length > 0 && (
            <table className="admin-table">
              <thead>
                <tr><th>Name</th><th>Email</th><th>Status</th><th>Joined</th></tr>
              </thead>
              <tbody>
                {list.items.map((admin) => (
                  <tr key={admin.id}>
                    <td><strong>{admin.name}</strong></td>
                    <td>{admin.email}</td>
                    <td><span className="tag badge-green">{admin.status}</span></td>
                    <td>{admin.joined}</td>
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
