"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ApiRequestError, type DealAnalysisContactData } from "@/lib/api";

type ContactModalProps = {
  contact: DealAnalysisContactData | null;
  loading: boolean;
  onClose: () => void;
  onSendEnquiry: (message: string) => Promise<string>;
};

export default function ContactModal({
  contact,
  loading,
  onClose,
  onSendEnquiry,
}: ContactModalProps) {
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [sentMessage, setSentMessage] = useState<string | null>(null);
  const [enquiryError, setEnquiryError] = useState<string | null>(null);

  useEffect(() => {
    setMessage("");
    setSending(false);
    setSentMessage(null);
    setEnquiryError(null);
  }, [contact?.listingId]);

  if (!contact && !loading) return null;

  const handleSend = async () => {
    if (!message.trim()) {
      setEnquiryError("Please enter a message before sending.");
      return;
    }

    setSending(true);
    setEnquiryError(null);

    try {
      const resultMessage = await onSendEnquiry(message.trim());
      setSentMessage(resultMessage);
      setMessage("");
    } catch (err) {
      setEnquiryError(
        err instanceof ApiRequestError
          ? err.message
          : "Unable to send your enquiry. Please try again.",
      );
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="modal-backdrop" onClick={onClose} role="presentation">
      <div className="modal" onClick={(e) => e.stopPropagation()} role="dialog">
        {loading ? (
          <p>Loading contact details…</p>
        ) : contact ? (
          <>
            <h3>Contact Seller</h3>
            <p className="sub">{contact.title}</p>

            <div className="grid-2" style={{ gap: "12px", marginTop: "16px" }}>
              {[
                { label: "Name", value: contact.contact.name },
                { label: "Phone", value: contact.contact.phone },
                { label: "Email", value: contact.contact.email },
                { label: "Role", value: contact.contact.role },
              ].map((field) => (
                <div
                  key={field.label}
                  style={{
                    background: "rgba(255,255,255,.04)",
                    border: "1px solid rgba(255,255,255,.07)",
                    borderRadius: "var(--radius)",
                    padding: "14px",
                  }}
                >
                  <p style={{ fontSize: ".75rem", color: "var(--slate)" }}>
                    {field.label}
                  </p>
                  <p style={{ fontSize: ".9rem", fontWeight: 600 }}>
                    {field.value}
                  </p>
                </div>
              ))}
            </div>

            <div style={{ marginTop: "20px" }}>
              <p className="form-section-title">✉️ Send an Enquiry</p>

              {sentMessage ? (
                <div className="alert alert-success">
                  <span>✓</span>
                  <span>{sentMessage}</span>
                </div>
              ) : (
                <>
                  {enquiryError && (
                    <div className="alert alert-error" style={{ marginBottom: "10px" }}>
                      <span>!</span>
                      <span>{enquiryError}</span>
                    </div>
                  )}
                  <div className="form-group" style={{ margin: 0 }}>
                    <textarea
                      rows={4}
                      placeholder="Introduce yourself and ask the seller about this property…"
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      maxLength={2000}
                    />
                  </div>
                </>
              )}
            </div>

            <div style={{ display: "flex", gap: "10px", marginTop: "20px" }}>
              {!sentMessage && (
                <button
                  type="button"
                  className="btn btn-gold btn-sm"
                  onClick={handleSend}
                  disabled={sending}
                >
                  {sending ? "Sending…" : "Send Enquiry"}
                </button>
              )}
              <button
                type="button"
                className="btn btn-outline btn-sm"
                onClick={onClose}
              >
                Done
              </button>
            </div>
          </>
        ) : null}
      </div>
    </div>
  );
}

type UpgradePromptProps = {
  onClose: () => void;
};

export function UpgradePrompt({ onClose }: UpgradePromptProps) {
  return (
    <div className="modal-backdrop" onClick={onClose} role="presentation">
      <div className="modal" onClick={(e) => e.stopPropagation()} role="dialog">
        <h3>Premium Required</h3>
        <p className="sub">
          Upgrade to Premium to view seller contact details and unlock the full
          flip and buy-to-let analysis.
        </p>
        <div style={{ display: "flex", gap: "10px", marginTop: "16px" }}>
          <Link href="/app/membership" className="btn btn-gold btn-sm">
            Upgrade Now
          </Link>
          <button
            type="button"
            className="btn btn-outline btn-sm"
            onClick={onClose}
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
