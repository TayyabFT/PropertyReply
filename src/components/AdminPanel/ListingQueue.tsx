"use client";

import { useState } from "react";
import { useAuth } from "@/lib/auth";
import { adminApi } from "@/lib/api";
import Pagination from "@/components/Pagination";
import { AdminPage, ListState, errorMessage, usePagedList, useToast } from "./shared";

export default function ListingQueue() {
  const { token } = useAuth();
  const { showToast, toastElement } = useToast();
  const [busyId, setBusyId] = useState<string | null>(null);
  const list = usePagedList((authToken, page) => adminApi.getSubmissions(authToken, "pending", page));

  const decide = async (id: string, approve: boolean) => {
    if (!token) return;
    setBusyId(id);
    try {
      if (approve) await adminApi.approveSubmission(token, id);
      else await adminApi.rejectSubmission(token, id);
      list.reload();
      showToast(approve ? "Submission approved and published to Browse Deals." : "Submission rejected.");
    } catch (err) {
      showToast(errorMessage(err, approve ? "Could not approve." : "Could not reject."));
    } finally {
      setBusyId(null);
    }
  };

  return (
    <AdminPage title="Listing Queue" description="Review new property submissions before they go live on Browse Deals.">
      {toastElement}
      <div className="admin-card">
        <div className="admin-card-header">
          <h3>🏠 Waiting for review ({list.pagination?.total ?? 0})</h3>
        </div>
        <div className="admin-card-body" style={{ overflowX: "auto" }}>
          <ListState loading={list.loading} error={list.error} empty={list.items.length === 0} emptyText="No pending submissions. All caught up! 🎉" />
          {list.items.length > 0 && (
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Property</th>
                  <th>Submitted By</th>
                  <th>Price</th>
                  <th>Discount</th>
                  <th>Submitted</th>
                  <th>KYC</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {list.items.map((row) => (
                  <tr key={row.id}>
                    <td>
                      <strong>{row.property}</strong>
                      <div style={{ fontSize: ".74rem", color: "var(--slate)" }}>{row.location}</div>
                    </td>
                    <td>{row.submittedBy}</td>
                    <td className="mono">{row.price}</td>
                    <td><span className="discount-pill">{row.discount}</span></td>
                    <td>{row.submitted}</td>
                    <td><span className={`tag ${row.kycBadge}`}>{row.kycLabel}</span></td>
                    <td>
                      <div className="action-btns">
                        <button className="btn btn-green btn-sm" disabled={busyId === row.id} onClick={() => decide(row.id, true)}>✓ Approve</button>
                        <button className="btn btn-red btn-sm" disabled={busyId === row.id} onClick={() => decide(row.id, false)}>✕ Reject</button>
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
