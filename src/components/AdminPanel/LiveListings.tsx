"use client";

import { useCallback, useState } from "react";
import { useAuth } from "@/lib/auth";
import { adminApi } from "@/lib/api";
import Pagination from "@/components/Pagination";
import AdminListingModal from "./AdminListingModal";
import { AdminPage, ListState, errorMessage, usePagedList, useToast } from "./shared";

export default function LiveListings() {
  const { token } = useAuth();
  const { showToast, toastElement } = useToast();
  const [busyId, setBusyId] = useState<string | null>(null);
  const [openId, setOpenId] = useState<string | null>(null);
  const list = usePagedList((authToken, page) => adminApi.getListings(authToken, page));
  const closeDetail = useCallback(() => setOpenId(null), []);

  const markSold = async (listing: { id: string; title: string }) => {
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
      setOpenId(null);
      list.reload();
      showToast(`Listing marked as sold — a ${Math.round(Number(sold.data.rate) * 100)}% success fee invoice was sent.`);
    } catch (err) {
      showToast(errorMessage(err, "Could not mark listing sold."));
    } finally {
      setBusyId(null);
    }
  };

  return (
    <AdminPage title="Live Listings" description="Click a listing to see its full details. Mark a listing as sold to send the seller their success fee invoice.">
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
                  <tr key={row.id} onClick={() => setOpenId(row.id)} style={{ cursor: "pointer" }}>
                    <td>
                      <button
                        type="button"
                        onClick={(event) => { event.stopPropagation(); setOpenId(row.id); }}
                        style={{ background: "none", border: 0, padding: 0, font: "inherit", color: "inherit", textAlign: "left", cursor: "pointer" }}
                      >
                        <strong style={{ textDecoration: "underline", textUnderlineOffset: 3 }}>{row.title}</strong>
                      </button>
                      <div style={{ fontSize: ".74rem", color: "var(--slate)" }}>{row.location}</div>
                    </td>
                    <td className="mono">{row.askingPrice}</td>
                    <td><span className={row.status === "sold" ? "tag badge-green" : "tag"}>{row.status}</span></td>
                    <td className="mono">{row.salePrice || "—"}</td>
                    <td className="mono amber">
                      {row.commissionGBP ? `${row.commissionGBP} (${row.commissionInvoiceStatus})` : "—"}
                    </td>
                    <td onClick={(event) => event.stopPropagation()}>
                      <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                        <button className="btn btn-outline btn-sm" onClick={() => setOpenId(row.id)}>
                          View
                        </button>
                        {row.status !== "sold" && (
                          <button className="btn btn-gold btn-sm" disabled={busyId === row.id} onClick={() => markSold(row)}>
                            Mark as Sold
                          </button>
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
      <AdminListingModal
        listingId={openId}
        onClose={closeDetail}
        onMarkSold={markSold}
        busy={busyId !== null}
      />
    </AdminPage>
  );
}
