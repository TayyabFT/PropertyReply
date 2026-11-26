"use client";

import { useState, type FormEvent } from "react";
import { useAuth } from "@/lib/auth";
import { adminApi } from "@/lib/api";
import Pagination from "@/components/Pagination";
import { AdminPage, ListState, errorMessage, usePagedList, useToast } from "./shared";

export default function UsersAdmin() {
  const { token } = useAuth();
  const { showToast, toastElement } = useToast();
  const [busyId, setBusyId] = useState<string | null>(null);
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [plan, setPlan] = useState("");
  const list = usePagedList(
    (authToken, page) => adminApi.getUsers(authToken, { search, plan, page }),
    `${search}|${plan}`,
  );

  const handleSearch = (event: FormEvent) => {
    event.preventDefault();
    setSearch(searchInput.trim());
  };

  const updateUser = async (
    id: string,
    body: { plan?: string; status?: string; kycStatus?: string },
    successMessage: string,
  ) => {
    if (!token) return;
    setBusyId(id);
    try {
      const res = await adminApi.updateUser(token, id, body);
      list.setItems((prev) => prev.map((u) => (u.id === id ? res.data : u)));
      showToast(successMessage);
    } catch (err) {
      showToast(errorMessage(err, "Could not update user."));
    } finally {
      setBusyId(null);
    }
  };

  const grantCommercial = async (userId: string) => {
    if (!token) return;
    if (!window.confirm("Grant Founders Club (Commercial) for 12 months? Listing fees waived, 5% success fee. They can pay £25/mo separately if needed.")) {
      return;
    }
    setBusyId(userId);
    try {
      await adminApi.grantCommercial(token, userId, 12);
      list.reload();
      showToast("Founders Club partnership granted.");
    } catch (err) {
      showToast(errorMessage(err, "Could not grant Founders Club."));
    } finally {
      setBusyId(null);
    }
  };

  return (
    <AdminPage title="Users" description="Search members, change plans, approve KYC, and suspend or ban accounts.">
      {toastElement}
      <div className="admin-card">
        <div className="admin-card-header" style={{ flexWrap: "wrap", gap: "8px" }}>
          <h3>👥 Members ({(list.pagination?.total ?? 0).toLocaleString("en-GB")})</h3>
          <form onSubmit={handleSearch} style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
            <input
              type="search"
              placeholder="Search name or email…"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              style={{ width: "220px", padding: "8px 12px" }}
            />
            <select value={plan} onChange={(e) => setPlan(e.target.value)} style={{ width: "auto", padding: "7px 12px" }}>
              <option value="">All Plans</option>
              <option value="Premium">Premium</option>
              <option value="VIP">VIP</option>
              <option value="Ultra">Ultra</option>
              <option value="Commercial">Founders Club</option>
              <option value="InvitedPartner">Invited Partner</option>
            </select>
            <button className="btn btn-outline btn-sm" type="submit">Search</button>
          </form>
        </div>
        <div className="admin-card-body" style={{ overflowX: "auto" }}>
          <ListState loading={list.loading} error={list.error} empty={list.items.length === 0} emptyText="No users found." />
          {list.items.length > 0 && (
            <table className="admin-table">
              <thead>
                <tr>
                  <th>User</th>
                  <th>Email</th>
                  <th>Plan</th>
                  <th>KYC</th>
                  <th>Joined</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {list.items.map((row) => (
                  <tr key={row.id}>
                    <td><strong>{row.name}</strong></td>
                    <td>{row.email}</td>
                    <td>
                      <select
                        value={row.plan ?? ""}
                        disabled={busyId === row.id}
                        onChange={(e) => updateUser(row.id, { plan: e.target.value }, `Plan updated to ${e.target.value}.`)}
                        style={{ padding: "4px 8px", fontSize: ".78rem" }}
                      >
                        {!row.plan && <option value="" disabled>No plan</option>}
                        <option value="Premium">Premium</option>
                        <option value="VIP">VIP</option>
                        <option value="Ultra">Ultra</option>
                        <option value="Commercial">Founders Club</option>
                        {row.plan === "InvitedPartner" && <option value="InvitedPartner" disabled>Invited Partner</option>}
                      </select>
                    </td>
                    <td><span className={`tag ${row.kycBadge}`}>{row.kycLabel}</span></td>
                    <td>{row.joined}</td>
                    <td>
                      <span className="status-dot" style={{ background: row.statusColor }}></span>
                      {row.statusLabel}
                    </td>
                    <td>
                      <div className="action-btns">
                        {row.kycStatus !== "approved" && (
                          <button className="btn btn-outline btn-sm" disabled={busyId === row.id} onClick={() => updateUser(row.id, { kycStatus: "approved" }, "KYC approved.")}>
                            Approve KYC
                          </button>
                        )}
                        {row.status === "active" ? (
                          <button className="btn btn-red btn-sm" disabled={busyId === row.id} onClick={() => updateUser(row.id, { status: "suspended" }, "User suspended.")}>
                            Suspend
                          </button>
                        ) : (
                          <button className="btn btn-green btn-sm" disabled={busyId === row.id} onClick={() => updateUser(row.id, { status: "active" }, "User reactivated.")}>
                            Activate
                          </button>
                        )}
                        <button className="btn btn-outline btn-sm" disabled={busyId === row.id} onClick={() => grantCommercial(row.id)}>
                          Grant Founders Club
                        </button>
                        <button className="btn btn-red btn-sm" disabled={busyId === row.id} onClick={() => updateUser(row.id, { status: "banned" }, "User banned.")}>
                          Ban
                        </button>
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
