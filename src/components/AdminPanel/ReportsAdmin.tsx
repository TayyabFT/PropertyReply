"use client";

import { useState } from "react";
import { useAuth } from "@/lib/auth";
import { adminApi, type AdminReport } from "@/lib/api";
import Pagination from "@/components/Pagination";
import { AdminPage, ListState, errorMessage, usePagedList, useToast } from "./shared";

const reasonLabels: Record<string, string> = {
  misleading: "Misleading / Too good to be true",
  spam: "Spam",
  duplicate: "Duplicate listing",
  inaccurate: "Inaccurate details",
  other: "Other",
};

export default function ReportsAdmin() {
  const { token } = useAuth();
  const { showToast, toastElement } = useToast();
  const [busyId, setBusyId] = useState<string | null>(null);
  const list = usePagedList((authToken, page) => adminApi.getReports(authToken, page));

  const resolve = async (report: AdminReport, removeListing: boolean) => {
    if (!token) return;
    setBusyId(report.id);
    try {
      // Without a live listing attached there is nothing to remove; just resolve.
      if (removeListing && report.listingId) {
        await adminApi.removeListing(token, report.listingId);
        showToast("Listing removed and report resolved.");
      } else {
        await adminApi.resolveReport(token, report.id);
        showToast("Report marked resolved.");
      }
      list.reload();
    } catch (err) {
      showToast(errorMessage(err, removeListing ? "Could not remove listing." : "Could not resolve report."));
    } finally {
      setBusyId(null);
    }
  };

  return (
    <AdminPage title="Reports" description="Listings that members have reported. Resolve the report, or remove the listing if it breaks the rules.">
      {toastElement}
      <div className="admin-card">
        <div className="admin-card-header"><h3>⚑ Open reports ({list.pagination?.total ?? 0})</h3></div>
        <div className="admin-card-body">
          <ListState loading={list.loading} error={list.error} empty={list.items.length === 0} emptyText="No open reports." />
          {list.items.length > 0 && (
            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              {list.items.map((report) => (
                <div
                  key={report.id}
                  style={{
                    padding: "14px",
                    background: "rgba(232,64,64,.07)",
                    border: "1px solid rgba(232,64,64,.2)",
                    borderRadius: "var(--radius)",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    flexWrap: "wrap",
                    gap: "10px",
                  }}
                >
                  <div>
                    <p style={{ fontWeight: 600, fontSize: ".88rem" }}>
                      {report.title}
                      {report.location ? ` — ${report.location}` : ""}
                    </p>
                    <p style={{ fontSize: ".78rem", color: "var(--slate)" }}>
                      Reported by: {report.reportedBy} · Reason: {reasonLabels[report.reason] || report.reason}
                      {report.details ? ` · "${report.details}"` : ""}
                    </p>
                  </div>
                  <div className="action-btns">
                    <button className="btn btn-outline btn-sm" disabled={busyId === report.id} onClick={() => resolve(report, false)}>✓ Resolve</button>
                    <button className="btn btn-red btn-sm" disabled={busyId === report.id} onClick={() => resolve(report, true)}>🗑 Remove Listing</button>
                  </div>
                </div>
              ))}
            </div>
          )}
          <Pagination pagination={list.pagination} onChange={list.setPage} disabled={list.loading} />
        </div>
      </div>
    </AdminPage>
  );
}
