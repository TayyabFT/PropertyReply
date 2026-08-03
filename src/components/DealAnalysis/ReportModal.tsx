"use client";

import { useState, type FormEvent } from "react";

type ReportModalProps = {
  open: boolean;
  reasons: { value: string; label: string }[];
  loading: boolean;
  onClose: () => void;
  onSubmit: (reason: string, details: string) => void;
};

export default function ReportModal({
  open,
  reasons,
  loading,
  onClose,
  onSubmit,
}: ReportModalProps) {
  const [reason, setReason] = useState(reasons[0]?.value ?? "");
  const [details, setDetails] = useState("");

  if (!open) return null;

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    onSubmit(reason, details);
  };

  return (
    <div className="modal-backdrop" onClick={onClose} role="presentation">
      <div className="modal" onClick={(e) => e.stopPropagation()} role="dialog">
        <h3>Report Listing</h3>
        <p className="sub">
          Tell us what&apos;s wrong with this deal. Our team will review it
          within 24–48 hours.
        </p>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Reason</label>
            <select
              value={reason}
              onChange={(event) => setReason(event.target.value)}
              required
            >
              {reasons.map((item) => (
                <option key={item.value} value={item.value}>
                  {item.label}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label>Additional details (optional)</label>
            <textarea
              rows={4}
              placeholder="Describe the issue…"
              value={details}
              onChange={(event) => setDetails(event.target.value)}
            />
          </div>

          <div style={{ display: "flex", gap: "10px", marginTop: "16px" }}>
            <button
              type="submit"
              className="btn btn-gold btn-sm"
              disabled={loading}
            >
              {loading ? "Submitting…" : "Submit Report"}
            </button>
            <button
              type="button"
              className="btn btn-outline btn-sm"
              onClick={onClose}
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
