"use client";

import { useRouter, useSearchParams } from "next/navigation";
import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type ChangeEvent,
} from "react";
import { useAuth } from "@/lib/auth";
import {
  billingApi,
  submitApi,
  type SubmitOptions,
  type SubmitPayload,
  type Submission,
  ApiRequestError,
} from "@/lib/api";

type FormState = {
  title: string;
  description: string;
  propertyType: string;
  bedrooms: string;
  streetAddress: string;
  postcode: string;
  town: string;
  county: string;
  askingPrice: string;
  marketValue: string;
  strategies: string[];
  images: string[];
  contactName: string;
  contactRole: string;
  contactPhone: string;
  contactEmail: string;
};

const emptyForm: FormState = {
  title: "",
  description: "",
  propertyType: "",
  bedrooms: "",
  streetAddress: "",
  postcode: "",
  town: "",
  county: "",
  askingPrice: "",
  marketValue: "",
  strategies: [],
  images: [],
  contactName: "",
  contactRole: "",
  contactPhone: "",
  contactEmail: "",
};

function buildPayload(form: FormState, draftId?: string): SubmitPayload {
  return {
    title: form.title,
    description: form.description,
    propertyType: form.propertyType,
    bedrooms: form.bedrooms,
    streetAddress: form.streetAddress,
    postcode: form.postcode,
    town: form.town,
    county: form.county,
    askingPrice: form.askingPrice,
    marketValue: form.marketValue,
    strategies: form.strategies,
    images: form.images,
    contact: {
      name: form.contactName,
      role: form.contactRole,
      phone: form.contactPhone,
      email: form.contactEmail,
    },
    ...(draftId ? { draftId } : {}),
  };
}

function statusColor(status: string): string {
  switch (status) {
    case "live":
      return "var(--green)";
    case "pending":
      return "var(--amber)";
    case "awaiting_payment":
    case "rejected":
      return "var(--red)";
    default:
      return "var(--slate)";
  }
}

function formatGbp(amount: number): string {
  if (!amount) return "—";
  return `£${amount.toLocaleString("en-GB")}`;
}

function submissionToForm(s: Submission): FormState {
  return {
    title: s.title,
    description: s.description,
    propertyType: s.propertyType,
    bedrooms: s.bedrooms,
    streetAddress: s.streetAddress,
    postcode: s.postcode,
    town: s.town,
    county: s.county,
    askingPrice: s.askingPrice ? String(s.askingPrice) : "",
    marketValue: s.marketValue ? String(s.marketValue) : "",
    strategies: s.strategies || [],
    images: s.images || [],
    contactName: s.contact?.name || "",
    contactRole: s.contact?.role || "",
    contactPhone: s.contact?.phone || "",
    contactEmail: s.contact?.email || "",
  };
}

export default function SubmitListing() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { token, user, ready } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const paymentStatus = searchParams.get("payment");
  const checkoutSessionId = searchParams.get("session_id");

  useEffect(() => {
    if (!ready || !user) return;
    if (user.kycStatus !== "approved") {
      router.replace("/app/kyc?reason=submit-required");
    }
  }, [ready, user, router]);

  const [options, setOptions] = useState<SubmitOptions | null>(null);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [drafts, setDrafts] = useState<Submission[]>([]);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [draftId, setDraftId] = useState<string | null>(null);

  const [loadingOptions, setLoadingOptions] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [savingDraft, setSavingDraft] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    if (!token) return;
    const authToken = token;
    let cancelled = false;

    async function init() {
      setLoadingOptions(true);
      try {
        // After Stripe listing-fee checkout, confirm the session so status
        // updates even when the local billing webhook is not running.
        if (paymentStatus === "success" && checkoutSessionId) {
          try {
            await billingApi.confirmCheckout(authToken, checkoutSessionId);
          } catch {
            // Webhook may still catch up; continue loading submissions
          }
        }

        const [optionsRes, draftsRes, submissionsRes] = await Promise.all([
          submitApi.getOptions(authToken),
          submitApi.getDrafts(authToken),
          submitApi.getSubmissions(authToken),
        ]);
        if (cancelled) return;
        setOptions(optionsRes.data);
        setDrafts(draftsRes.data);
        setSubmissions(submissionsRes.data);

        if (paymentStatus === "success") {
          const paid = submissionsRes.data.some(
            (item) =>
              item.paymentStatus === "paid" || item.status === "pending",
          );
          setSuccess(
            paid
              ? "Payment successful. Your listing has been submitted and is awaiting review."
              : "Payment received. If status still says Payment Required, refresh in a moment.",
          );
          setError(null);
          router.replace("/app/submit", { scroll: false });
        } else if (paymentStatus === "cancelled") {
          setError(
            "Payment was cancelled. Your draft was kept — you can submit again when ready.",
          );
          setSuccess(null);
          router.replace("/app/submit", { scroll: false });
        }
      } catch (err) {
        if (!cancelled) {
          const message =
            err instanceof ApiRequestError
              ? err.message
              : "Failed to load the submission form.";
          setError(message);
        }
      } finally {
        if (!cancelled) setLoadingOptions(false);
      }
    }

    init();
    return () => {
      cancelled = true;
    };
  }, [token, paymentStatus, checkoutSessionId, router]);

  // Prefill contact name from the logged-in user once, if empty.
  useEffect(() => {
    if (user?.name) {
      setForm((current) =>
        current.contactName ? current : { ...current, contactName: user.name },
      );
    }
    if (user?.email) {
      setForm((current) =>
        current.contactEmail
          ? current
          : { ...current, contactEmail: user.email },
      );
    }
  }, [user]);

  const discountPercent = useMemo(() => {
    const asking = Number(form.askingPrice);
    const market = Number(form.marketValue);
    if (!asking || !market || market <= 0 || asking >= market) return 0;
    return Math.round(((market - asking) / market) * 100);
  }, [form.askingPrice, form.marketValue]);

  const updateField = (field: keyof FormState, value: string) => {
    setForm((current) => ({ ...current, [field]: value }));
  };

  const toggleStrategy = (tag: string) => {
    setForm((current) => ({
      ...current,
      strategies: current.strategies.includes(tag)
        ? current.strategies.filter((item) => item !== tag)
        : [...current.strategies, tag],
    }));
  };

  const handleFiles = (event: ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files) return;
    const names = Array.from(files).map((file) => file.name);
    setForm((current) => ({
      ...current,
      images: [...current.images, ...names].slice(
        0,
        options?.imageLimits.maxImages ?? 20,
      ),
    }));
  };

  const removeImage = (name: string) => {
    setForm((current) => ({
      ...current,
      images: current.images.filter((img) => img !== name),
    }));
  };

  const resetMessages = () => {
    setError(null);
    setSuccess(null);
  };

  const refreshDrafts = async (authToken: string) => {
    try {
      const [draftsRes, submissionsRes] = await Promise.all([
        submitApi.getDrafts(authToken),
        submitApi.getSubmissions(authToken),
      ]);
      setDrafts(draftsRes.data);
      setSubmissions(submissionsRes.data);
    } catch {
      // non-critical
    }
  };

  const handleSubmit = async () => {
    if (!token) return;
    resetMessages();
    setSubmitting(true);

    try {
      const res = await submitApi.submit(token, buildPayload(form));
      window.location.href = res.data.checkoutUrl;
    } catch (err) {
      const message =
        err instanceof ApiRequestError
          ? err.message
          : "Unable to submit the listing. Please try again.";
      setError(message);
      window.scrollTo({ top: 0, behavior: "smooth" });
      setSubmitting(false);
    }
  };

  const handleRetryPayment = async (id: string) => {
    if (!token) return;
    resetMessages();
    try {
      const res = await submitApi.retryPayment(token, id);
      window.location.href = res.data.checkoutUrl;
    } catch (err) {
      const message =
        err instanceof ApiRequestError
          ? err.message
          : "Unable to start payment. Please try again.";
      setError(message);
    }
  };

  const handleSaveDraft = async () => {
    if (!token) return;
    resetMessages();
    setSavingDraft(true);

    try {
      const payload = buildPayload(form, draftId ?? undefined);
      const res = draftId
        ? await submitApi.updateDraft(token, draftId, payload)
        : await submitApi.saveDraft(token, payload);
      setDraftId(res.data.id);
      setSuccess("Draft saved. You can finish it later.");
      await refreshDrafts(token);
    } catch (err) {
      const message =
        err instanceof ApiRequestError
          ? err.message
          : "Unable to save the draft.";
      setError(message);
    } finally {
      setSavingDraft(false);
    }
  };

  const loadDraft = (draft: Submission) => {
    resetMessages();
    setForm(submissionToForm(draft));
    setDraftId(draft.id);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const deleteDraft = async (id: string) => {
    if (!token) return;
    try {
      await submitApi.deleteDraft(token, id);
      if (draftId === id) {
        setForm(emptyForm);
        setDraftId(null);
      }
      await refreshDrafts(token);
    } catch (err) {
      const message =
        err instanceof ApiRequestError
          ? err.message
          : "Unable to delete the draft.";
      setError(message);
    }
  };

  const startNew = () => {
    resetMessages();
    setForm(emptyForm);
    setDraftId(null);
  };

  if (loadingOptions && !options) {
    return (
      <section className="section" id="submit">
        <div className="container">
          <div className="page-head">
            <h1>Submit a Deal</h1>
            <p>Loading submission form…</p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="section" id="submit">
      <div className="container">
        <div className="tag mb-8">Submit a Deal</div>
        <h2 className="mb-8">List a BMV Property</h2>
        <p className="muted mb-32">
          Share below-market deals with thousands of active investors. All
          submissions are reviewed before going live.
        </p>

        {error && (
          <div className="alert alert-error" style={{ marginBottom: "16px" }}>
            <span>!</span>
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div
            className="alert"
            style={{
              marginBottom: "16px",
              background: "rgba(46,204,113,.12)",
              border: "1px solid rgba(46,204,113,.25)",
            }}
          >
            <span>✓</span>
            <span>{success}</span>
          </div>
        )}

        {drafts.length > 0 && (
          <div className="card" style={{ marginBottom: "20px" }}>
            <div className="flex-between mb-16">
              <h3>📝 Your Drafts</h3>
              {draftId && (
                <button
                  type="button"
                  className="btn btn-outline btn-sm"
                  onClick={startNew}
                >
                  + Start New
                </button>
              )}
            </div>
            <div
              style={{ display: "flex", flexDirection: "column", gap: "8px" }}
            >
              {drafts.map((draft) => (
                <div
                  key={draft.id}
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    padding: "10px 12px",
                    background:
                      draftId === draft.id
                        ? "rgba(212,168,67,.1)"
                        : "rgba(255,255,255,.04)",
                    borderRadius: "var(--radius)",
                    border: "1px solid rgba(255,255,255,.06)",
                  }}
                >
                  <span style={{ fontSize: ".88rem" }}>
                    {draft.title || "Untitled draft"}
                  </span>
                  <div style={{ display: "flex", gap: "8px" }}>
                    <button
                      type="button"
                      className="btn btn-outline btn-sm"
                      onClick={() => loadDraft(draft)}
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      className="btn btn-outline btn-sm"
                      style={{ color: "var(--red)" }}
                      onClick={() => deleteDraft(draft.id)}
                    >
                      ✕
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {submissions.length > 0 && (
          <div className="card" style={{ marginBottom: "20px" }}>
            <div className="flex-between mb-16">
              <h3>📋 My Submitted Listings</h3>
              <span style={{ fontSize: ".8rem", color: "var(--slate)" }}>
                {submissions.length} total
              </span>
            </div>
            <div className="table-scroll">
            <table className="dash-table">
              <thead>
                <tr>
                  <th>Property</th>
                  <th>Location</th>
                  <th>Asking</th>
                  <th>Discount</th>
                  <th>Status</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {submissions.map((item) => (
                  <tr key={item.id}>
                    <td>{item.title || "Untitled"}</td>
                    <td>{item.location || "—"}</td>
                    <td className="mono">{formatGbp(item.askingPrice)}</td>
                    <td>
                      <span className="discount-pill">
                        {item.discountPercent}%
                      </span>
                    </td>
                    <td>
                      <span
                        className="status-dot"
                        style={{ background: statusColor(item.status) }}
                      ></span>
                      {item.statusLabel}
                    </td>
                    <td>
                      {item.status === "awaiting_payment" && (
                        <button
                          type="button"
                          className="btn btn-gold btn-sm"
                          onClick={() => handleRetryPayment(item.id)}
                        >
                          Complete Payment (£10)
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            </div>
          </div>
        )}

        <div className="submit-form">
          <div className="submit-header">
            <h3>{draftId ? "Editing Draft" : "New Property Listing"}</h3>
            <p style={{ color: "var(--slate)", fontSize: ".82rem" }}>
              All fields marked * are required
            </p>
          </div>
          <div className="submit-body">
            <p className="form-section-title">🏠 Property Information</p>
            <div className="form-group">
              <label>Property Title *</label>
              <input
                type="text"
                placeholder="e.g. 3-Bed Terrace – Motivated Seller, Manchester"
                value={form.title}
                onChange={(e) => updateField("title", e.target.value)}
              />
            </div>
            <div className="form-group">
              <label>Property Description *</label>
              <textarea
                rows={4}
                placeholder="Describe the property, its condition, why it's a good deal, any known issues…"
                value={form.description}
                onChange={(e) => updateField("description", e.target.value)}
              ></textarea>
            </div>
            <div className="grid-2">
              <div className="form-group">
                <label>Property Type *</label>
                <select
                  value={form.propertyType}
                  onChange={(e) => updateField("propertyType", e.target.value)}
                >
                  <option value="">-- Select --</option>
                  {options?.propertyTypes.map((type) => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label>Number of Bedrooms *</label>
                <select
                  value={form.bedrooms}
                  onChange={(e) => updateField("bedrooms", e.target.value)}
                >
                  <option value="">-- Select --</option>
                  {options?.bedrooms.map((bed) => (
                    <option key={bed} value={bed}>
                      {bed}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <p className="form-section-title" style={{ marginTop: "24px" }}>
              📍 Location & Pricing
            </p>
            <div className="grid-2">
              <div className="form-group">
                <label>Street Address</label>
                <input
                  type="text"
                  placeholder="e.g. 15 Oak Street"
                  value={form.streetAddress}
                  onChange={(e) => updateField("streetAddress", e.target.value)}
                />
              </div>
              <div className="form-group">
                <label>Postcode *</label>
                <input
                  type="text"
                  placeholder="e.g. M6 5AB"
                  value={form.postcode}
                  onChange={(e) => updateField("postcode", e.target.value)}
                />
              </div>
              <div className="form-group">
                <label>Town / City *</label>
                <input
                  type="text"
                  placeholder="e.g. Manchester"
                  value={form.town}
                  onChange={(e) => updateField("town", e.target.value)}
                />
              </div>
              <div className="form-group">
                <label>County</label>
                <input
                  type="text"
                  placeholder="e.g. Greater Manchester"
                  value={form.county}
                  onChange={(e) => updateField("county", e.target.value)}
                />
              </div>
            </div>
            <div className="grid-3">
              <div className="form-group">
                <label>Asking Price * (£)</label>
                <input
                  type="number"
                  placeholder="e.g. 118000"
                  value={form.askingPrice}
                  onChange={(e) => updateField("askingPrice", e.target.value)}
                />
              </div>
              <div className="form-group">
                <label>Estimated Market Value * (£)</label>
                <input
                  type="number"
                  placeholder="e.g. 178000"
                  value={form.marketValue}
                  onChange={(e) => updateField("marketValue", e.target.value)}
                />
              </div>
              <div className="form-group">
                <label>Discount % (auto-calculated)</label>
                <input
                  type="text"
                  readOnly
                  value={discountPercent ? `${discountPercent}%` : ""}
                  placeholder="Will auto-calculate"
                  style={{
                    background: "rgba(212,168,67,.07)",
                    color: "var(--gold)",
                  }}
                />
              </div>
            </div>

            <p className="form-section-title" style={{ marginTop: "24px" }}>
              🏷 Investment Strategy Tags *
            </p>
            <div className="checkbox-grid">
              {options?.strategyTags.map((tag) => (
                <label className="checkbox-item" key={tag}>
                  <input
                    type="checkbox"
                    checked={form.strategies.includes(tag)}
                    onChange={() => toggleStrategy(tag)}
                  />{" "}
                  {tag}
                </label>
              ))}
            </div>

            <p className="form-section-title" style={{ marginTop: "24px" }}>
              📸 Property Images
            </p>
            <div
              className="image-upload"
              onClick={() => fileInputRef.current?.click()}
              style={{ cursor: "pointer" }}
            >
              <div className="upload-icon">📷</div>
              <p>Drag and drop images here, or click to browse</p>
              <p style={{ marginTop: "6px", fontSize: ".78rem" }}>
                Supports {options?.imageLimits.acceptedFormats.join(", ")} · Max{" "}
                {options?.imageLimits.maxSizeMb}MB per image · Up to{" "}
                {options?.imageLimits.maxImages} images
              </p>
              <button
                type="button"
                className="btn btn-outline btn-sm"
                style={{ marginTop: "14px" }}
                onClick={(e) => {
                  e.stopPropagation();
                  fileInputRef.current?.click();
                }}
              >
                Browse Files
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                multiple
                hidden
                onChange={handleFiles}
              />
            </div>
            {form.images.length > 0 && (
              <div
                style={{
                  display: "flex",
                  flexWrap: "wrap",
                  gap: "8px",
                  marginTop: "12px",
                }}
              >
                {form.images.map((img) => (
                  <span
                    key={img}
                    className="tag"
                    style={{ display: "flex", gap: "6px", alignItems: "center" }}
                  >
                    {img}
                    <button
                      type="button"
                      onClick={() => removeImage(img)}
                      style={{
                        background: "none",
                        border: "none",
                        color: "var(--red)",
                        cursor: "pointer",
                      }}
                      aria-label={`Remove ${img}`}
                    >
                      ✕
                    </button>
                  </span>
                ))}
              </div>
            )}

            <p className="form-section-title" style={{ marginTop: "24px" }}>
              📞 Contact Details
            </p>
            <div className="grid-2">
              <div className="form-group">
                <label>Your Name *</label>
                <input
                  type="text"
                  placeholder="Full name"
                  value={form.contactName}
                  onChange={(e) => updateField("contactName", e.target.value)}
                />
              </div>
              <div className="form-group">
                <label>Role *</label>
                <select
                  value={form.contactRole}
                  onChange={(e) => updateField("contactRole", e.target.value)}
                >
                  <option value="">-- Select --</option>
                  {options?.roles.map((role) => (
                    <option key={role} value={role}>
                      {role}
                    </option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label>Phone Number *</label>
                <input
                  type="tel"
                  placeholder="e.g. 07700 900000"
                  value={form.contactPhone}
                  onChange={(e) => updateField("contactPhone", e.target.value)}
                />
              </div>
              <div className="form-group">
                <label>Email Address *</label>
                <input
                  type="email"
                  placeholder="your@email.co.uk"
                  value={form.contactEmail}
                  onChange={(e) => updateField("contactEmail", e.target.value)}
                />
              </div>
            </div>

            <div className="alert alert-warn">
              <span>⚠️</span>
              <div>
                A £10 listing fee applies per submission, payable by card on
                the next step. Listings are reviewed within 24–48 hours after
                payment. Inaccurate, misleading, or spam listings will be
                removed and may result in account suspension.
              </div>
            </div>

            <div className="form-actions">
              <button
                type="button"
                className="btn btn-outline"
                onClick={() => router.push("/app/dashboard")}
              >
                ← Cancel
              </button>
              <div style={{ display: "flex", gap: "10px" }}>
                <button
                  type="button"
                  className="btn btn-outline"
                  onClick={handleSaveDraft}
                  disabled={savingDraft || submitting}
                >
                  {savingDraft ? "Saving…" : "Save as Draft"}
                </button>
                <button
                  type="button"
                  className="btn btn-gold"
                  onClick={handleSubmit}
                  disabled={submitting || savingDraft}
                >
                  {submitting ? "Redirecting to payment…" : "Pay £10 & Submit →"}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
