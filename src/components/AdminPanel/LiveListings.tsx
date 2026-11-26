"use client";

import { useState } from "react";
import { useAuth } from "@/lib/auth";
import { adminApi, type AdminListing } from "@/lib/api";
import Pagination from "@/components/Pagination";
import { AdminPage, ListState, errorMessage, usePagedList, useToast } from "./shared";

export default function LiveListings() {
  const { token } = useAuth();
  const { showToast, toastElement } = useToast();
  const [busyId, setBusyId] = useState<string | null>(null);
  const list = usePagedList((authToken, page) => adminApi.getListings(authToken, page));

  const markSold = async (listing: AdminListing) => {
    if (!token) return;
    const input = window.prompt(`Enter the final sale price for "${listing.title}" (GBP):`);
    if (!input) return;
    const salePrice = Number(input.replace(/[^0-9.]/g, ""));
    if (!salePrice || salePrice <= 0) {
      showToast("Please enter a valid sale price.");
      return;
    }

    let partnerFeeGBP: number | undefined;
    const partnerFeeInput = window.prompt(
      "Only for Founders Club: enter partner remuneration (GBP). Leave blank for Invited Partners and other members. Their fee is calculated from the sale price using their current offer status.",
    );
    if (partnerFeeInput && partnerFeeInput.trim()) {
      partnerFeeGBP = Number(partnerFeeInput.replace(/[^0-9.]/g, ""));
      if (!partnerFeeGBP || partnerFeeGBP <= 0) {
        showToast("Please enter a valid partner fee, or leave blank.");
        return;
      }
    }

    setBusyId(listing.id);
    try {
      const sold = await adminApi.markSold(token, listing.id, salePrice, partnerFeeGBP);
      list.reload();
      showToast(`Listing marked as sold — a ${Math.round(Number(sold.data.rate) * 100)}% success fee invoice was sent.`);
    } catch (err) {
      showToast(errorMessage(err, "Could not mark listing sold."));
    } finally {
      setBusyId(null);
    }
  };

  return (
    <AdminPage title="Live Listings" description="Mark a listing as sold to send the seller their success fee invoice.">
      {toastElement}
      <div className="admin-card">
        <div className="admin-card-header"><h3>🏷 Live and sold listings ({list.pagination?.total ?? 0})</h3></div>
        <div className="admin-card-body" style={{ overflowX: "auto" }}>
          <ListState loading={list.loading} error={list.error} empty={list.items.length === 0} emptyText="No live listings yet." />
          {list.items.length > 0 && (
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Property</th>
                  <th>Asking Price</th>
                  <th>Status</th>
                  <th>Sale Price</th>
                  <th>Success fee</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {list.items.map((row) => (
                  <tr key={row.id}>
                    <td>
                      <strong>{row.title}</strong>
                      <div style={{ fontSize: ".74rem", color: "var(--slate)" }}>{row.location}</div>
                    </td>
                    <td className="mono">{row.askingPrice}</td>
                    <td><span className={row.status === "sold" ? "tag badge-green" : "tag"}>{row.status}</span></td>
                    <td className="mono">{row.salePrice || "—"}</td>
                    <td className="mono amber">
                      {row.commissionGBP ? `${row.commissionGBP} (${row.commissionInvoiceStatus})` : "—"}
                    </td>
                    <td>
                      {row.status !== "sold" && (
                        <button className="btn btn-gold btn-sm" disabled={busyId === row.id} onClick={() => markSold(row)}>
                          Mark as Sold
                        </button>
                      )}
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
